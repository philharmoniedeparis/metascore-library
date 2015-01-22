/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = (function () {

  function Player(configs) {
    var iframe, document;

    this.configs = this.getConfigs(configs);

    iframe = new metaScore.Dom('<iframe></iframe>', {'class': 'metaScore-player'})
      .css('width', this.configs.width)
      .css('height', this.configs.height)
      .css('border', 'none')
      .appendTo(this.configs.container);

    document = iframe.get(0).contentDocument;

    // call parent constructor
    Player.parent.call(this, document.body);

    if(this.configs.keyboard){
      this.addListener('keydown', metaScore.Function.proxy(this.onKeydown, this));
    }

    this.iframe = iframe;
    this.head = new metaScore.Dom(document.head);

    this.load();
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

  Player.prototype.onKeydown = function(evt){
    if(metaScore.editing){
      return;
    }
  
    switch(evt.keyCode){
      case 32: //space-bar
        if(this.media.isPlaying()){
          this.media.pause();
        }
        else{
          this.media.play();
        }
        evt.preventDefault();
        break;
      case 37: //left
        this.child('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
        evt.preventDefault();
        break;
      case 39: //right
        this.child('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
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
        if(this.media.isPlaying()){
          this.media.pause();
        }
        else{
          this.media.play();
        }
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

  Player.prototype.onElementTime = function(evt){
    if(this.linkcuepoint){
      this.linkcuepoint.destroy();
    }

    this.media.setTime(evt.detail.value);

    if(evt.detail.forcePlay){
      this.media.play();
    }

    if(evt.detail.stop){
      this.linkcuepoint = new metaScore.player.CuePoint({
        media: this.media,
        inTime: evt.detail.stop,
        onStart: metaScore.Function.proxy(this.onLinkCuePointStart, this)
      });
    }
  };

  Player.prototype.onLinkCuePointStart = function(cuepoint){
    cuepoint.destroy();

    this.setReadingIndex(0);

    this.media.pause();
  };

  Player.prototype.onElementReadingIndex = function(evt){
    this.setReadingIndex(evt.detail.value);

    evt.stopPropagation();
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

  Player.prototype.load = function(url){
    var options;

    this.addClass('loading');

    options = metaScore.Object.extend({}, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    }, this.configs.ajax);


    metaScore.Ajax.get(this.configs.url, options);
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

    this.addMedia(this.json.media);
    this.addController(this.json.controller);

    metaScore.Array.each(this.json.blocks, function(index, block){
      this.addBlock(block);
    }, this);

    this.media.reset();

    this.removeClass('loading');

    this.triggerEvent('loadsuccess', {'player': this, 'data': this.json}, true, false);
  };

  Player.prototype.onLoadError = function(xhr){

    this.removeClass('loading');

    this.triggerEvent('loaderror', {'player': this}, true, false);

  };

  Player.prototype.getId = function(){
    return this.data('id');
  };

  Player.prototype.getHead = function(){
    return this.head;
  };

  Player.prototype.getIFrame = function(){
    return this.iframe;
  };

  Player.prototype.getData = function(){
    return this.json;
  };

  Player.prototype.getComponents = function(type){
    var selector = '.metaScore-component';

    if(metaScore.Var.is(type, 'array')){
      selector += '.'+ type.join(', '+ selector +'.');
    }
    else if(type){
      selector += '.'+ type;
    }

    return this.children(selector);
  };

  Player.prototype.addMedia = function(configs, supressEvent){
    this.media = new metaScore.player.component.Media(configs)
      .addListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
      .appendTo(this);

    if(supressEvent !== true){
      this.triggerEvent('mediaadd', {'player': this, 'media': this.media}, true, false);
    }
  };

  Player.prototype.addController = function(configs, supressEvent){
    this.controller = new metaScore.player.component.Controller(configs)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .appendTo(this);

    if(supressEvent !== true){
      this.triggerEvent('controlleradd', {'player': this, 'controller': this.controller}, true, false);
    }
  };

  Player.prototype.addBlock = function(configs, supressEvent){
    var block, page;

    if(configs instanceof metaScore.player.component.Block){
      block = configs;
    }
    else{
      block = new metaScore.player.component.Block(metaScore.Object.extend({}, configs, {
          'container': this,
          'listeners': {
            'propchange': metaScore.Function.proxy(this.onComponenetPropChange, this)
          }
        }))
        .addListener('pageactivate', metaScore.Function.proxy(this.onPageActivate, this))
        .addDelegate('.element', 'time', metaScore.Function.proxy(this.onElementTime, this))
        .addDelegate('.element', 'rindex', metaScore.Function.proxy(this.onElementReadingIndex, this));
    }

    if(supressEvent !== true){
      this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    }

    return block;
  };

  Player.prototype.updateCSS = function(value){
    this.css.setInternalValue(value);
  };

  Player.prototype.setReadingIndex = function(index, supressEvent){
    this.rindex_css.removeRules();

    if(index !== 0){
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]) .contents', 'display: block;');
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"].active .contents', 'display: block;');
    }

    if(supressEvent !== true){
      this.triggerEvent('rindex', {'player': this, 'value': index}, true, false);
    }
  };

  Player.prototype.remove = function(){
    this.getIFrame().remove();
  };

  return Player;

})();