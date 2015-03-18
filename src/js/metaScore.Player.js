/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = (function () {

  function Player(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Player.parent.call(this, '<iframe></iframe>', {'class': 'metaScore-player', 'src': 'about:blank'});

    this
      .css('width', this.configs.width)
      .css('height', this.configs.height)
      .css('border', 'none')
      .addListener('load', metaScore.Function.proxy(this.onIFrameLoad, this))
      .appendTo(this.configs.container);
  }

  Player.defaults = {
    'url': '',
    'width': '100%',
    'height': '100%',
    'container': 'body',
    'ajax': {},
    'keyboard': true
  };

  metaScore.Dom.extend(Player);

  Player.prototype.onIFrameLoad = function(evt){
    this.document = this.get(0).contentDocument || this.iframe.get(0).contentWindow.document;    
    this.head = new metaScore.Dom(this.document.head);
    this.body = new metaScore.Dom(this.document.body);

    if(this.configs.keyboard){
      this.body
        .addListener('keydown', metaScore.Function.proxy(this.onKey, this))
        .addListener('keyup', metaScore.Function.proxy(this.onKey, this));
    }

    this.load();
  };

  Player.prototype.onKey = function(evt){
    var skip = evt.type === 'keydown';
    
    switch(evt.keyCode){
      case 32: //space-bar
        if(!skip){
          this.togglePlay();
        }
        evt.preventDefault();
        break;
      case 37: //left
        if(!skip){
          this.getBody().child('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
        }
        evt.preventDefault();
        break;
      case 39: //right
        if(!skip){
          this.getBody().child('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
        }
        evt.preventDefault();
        break;
    }
  };

  Player.prototype.onControllerButtonClick = function(evt){
    var action = metaScore.Dom.data(evt.target, 'action');

    switch(action){
      case 'rewind':
        this.media.reset();
        break;

      case 'play':
        this.togglePlay();
        break;
    }

    evt.stopPropagation();
  };

  Player.prototype.onMediaPlay = function(evt){
    this.controller.addClass('playing');
  };

  Player.prototype.onMediaPause = function(evt){
    this.controller.removeClass('playing');
  };

  Player.prototype.onMediaTimeUpdate = function(evt){
    var currentTime = evt.detail.media.getTime();

    this.controller.updateTime(currentTime);
  };

  Player.prototype.onPageActivate = function(evt){
    var block = evt.target._metaScore,
      page = evt.detail.page;

    if(block.getProperty('synched')){
      this.media.setTime(page.getProperty('start-time'));
    }
  };

  Player.prototype.onCursorElementTime = function(evt){
    this.media.setTime(evt.detail.value);
  };

  Player.prototype.onTextElementTime = function(evt){
    var player = this;
  
    if(this.linkcuepoint){
      this.linkcuepoint.destroy();
    }

    this.linkcuepoint = new metaScore.player.CuePoint({
      media: this.media,
      inTime: evt.detail.inTime,
      outTime: evt.detail.outTime,
      onStart: function(cuepoint){
        player.setReadingIndex(evt.detail.rIndex);
      },
      onEnd: function(cuepoint){
        cuepoint.getMedia().pause();
      },
      onOut: function(cuepoint){
        cuepoint.destroy();
        delete player.linkcuepoint;
        
        player.setReadingIndex(0);
      }
    });

    this.media.setTime(evt.detail.inTime);
    this.media.play();
  };

  Player.prototype.onComponenetPropChange = function(evt){
    var component = evt.detail.component;

    switch(evt.detail.property){
      case 'start-time':
      case 'end-time':
        component.setCuePoint({
          'media': this.media
        });
        break;
    }
  };

  Player.prototype.onLoadSuccess = function(xhr){
    this.json = JSON.parse(xhr.response);

    this.data('id', this.json.id);

    // setup the base url
    if(this.json.base_url){
      new metaScore.Dom('<base/>', {'href': this.json.base_url, 'target': '_blank'})
        .appendTo(this.getHead());
    }

    // add style sheets
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': this.json.library_css})
      .appendTo(this.getHead());

    this.css = new metaScore.StyleSheet()
      .setInternalValue(this.json.css)
      .appendTo(this.getHead());

    this.rindex_css = new metaScore.StyleSheet()
      .appendTo(this.getHead());

    this
      .addMedia(this.json.media)
      .addController(this.json.controller);

    metaScore.Array.each(this.json.blocks, function(index, block){
      this.addBlock(block);
    }, this);

    this.getBody().removeClass('loading');
    
    this.media.reset();
    
    this.triggerEvent('loadsuccess', {'player': this, 'data': this.json}, true, false);
  };

  Player.prototype.onLoadError = function(xhr){
    this.getBody().removeClass('loading');
    
    this.triggerEvent('loaderror', {'player': this}, true, false);
  };

  Player.prototype.load = function(url){
    var options;

    this.getBody().addClass('loading');

    options = metaScore.Object.extend({}, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    }, this.configs.ajax);


    metaScore.Ajax.get(this.configs.url, options);
  };

  Player.prototype.getId = function(){
    return this.data('id');
  };

  Player.prototype.getHead = function(){
    return this.head;
  };

  Player.prototype.getBody = function(){
    return this.body;
  };

  Player.prototype.getData = function(){
    return this.json;
  };

  Player.prototype.getComponent = function(selector){    
    return this.getComponents(selector).get(0);
  };

  Player.prototype.getComponents = function(selector){
    var components;
    
    components = this.getBody().children('.metaScore-component');
    
    if(selector){
      components = components.filter(selector);
    }

    return components;
  };

  Player.prototype.addMedia = function(configs, supressEvent){
    this.media = new metaScore.player.component.Media(configs)
      .addMediaListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addMediaListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .addMediaListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
      .appendTo(this.getBody());

    if(supressEvent !== true){
      this.triggerEvent('mediaadd', {'player': this, 'media': this.media}, true, false);
    }
    
    return this;
  };

  Player.prototype.addController = function(configs, supressEvent){
    this.controller = new metaScore.player.component.Controller(configs)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .appendTo(this.body);

    if(supressEvent !== true){
      this.triggerEvent('controlleradd', {'player': this, 'controller': this.controller}, true, false);
    }
    
    return this;
  };

  Player.prototype.addBlock = function(configs, supressEvent){
    var block, page;

    if(configs instanceof metaScore.player.component.Block){
      block = configs;
    }
    else{
      block = new metaScore.player.component.Block(metaScore.Object.extend({}, configs, {
          'container': this.getBody(),
          'listeners': {
            'propchange': metaScore.Function.proxy(this.onComponenetPropChange, this)
          }
        }))
        .addListener('pageactivate', metaScore.Function.proxy(this.onPageActivate, this))
        .addDelegate('.element[data-type="Cursor"]', 'time', metaScore.Function.proxy(this.onCursorElementTime, this))
        .addDelegate('.element[data-type="Text"]', 'time', metaScore.Function.proxy(this.onTextElementTime, this));
    }

    if(supressEvent !== true){
      this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    }

    return block;
  };

  Player.prototype.updateCSS = function(value){
    this.css.setInternalValue(value);
  };

  Player.prototype.togglePlay = function(){      
    if(this.media.isPlaying()){
      this.media.pause();
    }
    else{
      this.media.play();
    }
  };

  Player.prototype.setReadingIndex = function(index, supressEvent){
    this.rindex_css.removeRules();

    if(index !== 0){
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"]', 'display: block;');
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]) .contents', 'display: block;');
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"].active .contents', 'display: block;');
    }

    if(supressEvent !== true){
      this.getBody().triggerEvent('rindex', {'player': this, 'value': index}, true, false);
    }
    
    return this;
  };

  return Player;

})();