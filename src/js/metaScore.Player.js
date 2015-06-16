/**
* The main player class
* @class Player
* @namespace metaScore
* @extends metaScore.Dom
*/

metaScore.Player = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Player(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Player.parent.call(this, '<div></div>', {'class': 'metaScore-player'});

    this
      .addListener('keydown', metaScore.Function.proxy(this.onKey, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKey, this))
      .appendTo(this.configs.container);

    this.load();
  }

  Player.defaults = {
    'url': '',
    'container': 'body',
    'ajax': {},
    'keyboard': true
  };

  metaScore.Dom.extend(Player);

  /**
   * Description
   * @method onKey
   * @param {} evt
   * @return 
   */
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
          this.child('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
        }
        evt.preventDefault();
        break;
      case 39: //right
        if(!skip){
          this.child('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
        }
        evt.preventDefault();
        break;
    }
  };

  /**
   * Description
   * @method onControllerButtonClick
   * @param {} evt
   * @return 
   */
  Player.prototype.onControllerButtonClick = function(evt){
    var action = metaScore.Dom.data(evt.target, 'action');

    switch(action){
      case 'rewind':
        this.getMedia().reset();
        break;

      case 'play':
        this.togglePlay();
        break;
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onMediaLoadedMetadata
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaLoadedMetadata = function(evt){
    this.getMedia().reset();
  };

  /**
   * Description
   * @method onMediaPlay
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaPlay = function(evt){
    this.controller.addClass('playing');
  };

  /**
   * Description
   * @method onMediaPause
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaPause = function(evt){
    this.controller.removeClass('playing');
  };

  /**
   * Description
   * @method onMediaTimeUpdate
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaTimeUpdate = function(evt){
    var currentTime = evt.detail.media.getTime();

    this.controller.updateTime(currentTime);
  };

  /**
   * Description
   * @method onPageActivate
   * @param {} evt
   * @return 
   */
  Player.prototype.onPageActivate = function(evt){
    var block = evt.target._metaScore,
      page = evt.detail.page,
      basis = evt.detail.basis;

    if(block.getProperty('synched') && (basis !== 'pagecuepoint')){
      this.getMedia().setTime(page.getProperty('start-time'));
    }
  };

  /**
   * Description
   * @method onCursorElementTime
   * @param {} evt
   * @return 
   */
  Player.prototype.onCursorElementTime = function(evt){
    this.getMedia().setTime(evt.detail.value);
  };

  /**
   * Description
   * @method onTextElementTime
   * @param {} evt
   * @return 
   */
  Player.prototype.onTextElementTime = function(evt){
    var player = this;
  
    if(this.linkcuepoint){
      this.linkcuepoint.destroy();
    }

    this.linkcuepoint = new metaScore.player.CuePoint({
      media: this.getMedia(),
      inTime: evt.detail.inTime,
      outTime: evt.detail.outTime,
      onStart: function(cuepoint){
        player.setReadingIndex(evt.detail.rIndex);
      },
      onEnd: function(cuepoint){
        cuepoint.getMedia().pause();
      },
      onSeekOut: function(cuepoint){
        cuepoint.destroy();
        delete player.linkcuepoint;
        
        player.setReadingIndex(0);
      },
      considerError: true
    });

    this.getMedia()
      .setTime(evt.detail.inTime)
      .play();
  };

  /**
   * Description
   * @method onComponenetPropChange
   * @param {} evt
   * @return 
   */
  Player.prototype.onComponenetPropChange = function(evt){
    var component = evt.detail.component;

    switch(evt.detail.property){
      case 'start-time':
      case 'end-time':
        component.setCuePoint({
          'media': this.getMedia()
        });
        break;
    }
  };

  /**
   * Description
   * @method onLoadSuccess
   * @param {} xhr
   * @return 
   */
  Player.prototype.onLoadSuccess = function(xhr){
    this.json = JSON.parse(xhr.response);

    this.data('id', this.json.id);

    // setup the base url
    if(this.json.base_url){
      new metaScore.Dom('<base/>', {'href': this.json.base_url, 'target': '_blank'})
        .appendTo(document.head);
    }

    // add style sheets
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': this.json.library_css})
      .appendTo(document.head);

    this.css = new metaScore.StyleSheet()
      .setInternalValue(this.json.css)
      .appendTo(document.head);

    this.rindex_css = new metaScore.StyleSheet()
      .appendTo(document.head);

    metaScore.Array.each(this.json.blocks, function(index, block){
      switch(block.type){
        case 'media':
          this.addMedia(metaScore.Object.extend({}, block, this.json.media));
          break;
          
        case 'controller':
          this.addController(block);
          break;
        
        default:
          this.addBlock(block);
      }
    }, this);

    this.removeClass('loading');
    
    this.triggerEvent('loadsuccess', {'player': this, 'data': this.json}, true, false);
  };

  /**
   * Description
   * @method onLoadError
   * @param {} xhr
   * @return 
   */
  Player.prototype.onLoadError = function(xhr){
    this.removeClass('loading');
    
    this.triggerEvent('loaderror', {'player': this}, true, false);
  };

  /**
   * Description
   * @method load
   * @return 
   */
  Player.prototype.load = function(){
    var options;

    this.addClass('loading');

    options = metaScore.Object.extend({}, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    }, this.configs.ajax);


    metaScore.Ajax.get(this.configs.url, options);
  };

  /**
   * Description
   * @method getId
   * @return CallExpression
   */
  Player.prototype.getId = function(){
    return this.data('id');
  };

  /**
   * Description
   * @method getData
   * @return MemberExpression
   */
  Player.prototype.getData = function(){
    return this.json;
  };

  /**
   * Description
   * @method getMedia
   * @return MemberExpression
   */
  Player.prototype.getMedia = function(){
    return this.media;
  };

  /**
   * Description
   * @method getComponent
   * @param {} selector
   * @return CallExpression
   */
  Player.prototype.getComponent = function(selector){    
    return this.getComponents(selector).get(0);
  };

  /**
   * Description
   * @method getComponents
   * @param {} selector
   * @return components
   */
  Player.prototype.getComponents = function(selector){
    var components;
    
    components = this.find('.metaScore-component');
    
    if(selector){
      components = components.filter(selector);
    }

    return components;
  };

  /**
   * Description
   * @method addMedia
   * @param {} configs
   * @param {} supressEvent
   * @return ThisExpression
   */
  Player.prototype.addMedia = function(configs, supressEvent){
    this.media = new metaScore.player.component.Media(configs)
      .addMediaListener('loadedmetadata', metaScore.Function.proxy(this.onMediaLoadedMetadata, this))
      .addMediaListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addMediaListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .addMediaListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
      .appendTo(this);

    if(supressEvent !== true){
      this.triggerEvent('mediaadd', {'player': this, 'media': this.media}, true, false);
    }
    
    return this;
  };

  /**
   * Description
   * @method addController
   * @param {} configs
   * @param {} supressEvent
   * @return ThisExpression
   */
  Player.prototype.addController = function(configs, supressEvent){
    this.controller = new metaScore.player.component.Controller(configs)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .appendTo(this);

    if(supressEvent !== true){
      this.triggerEvent('controlleradd', {'player': this, 'controller': this.controller}, true, false);
    }
    
    return this;
  };

  /**
   * Description
   * @method addBlock
   * @param {} configs
   * @param {} supressEvent
   * @return block
   */
  Player.prototype.addBlock = function(configs, supressEvent){
    var block, page;

    if(configs instanceof metaScore.player.component.Block){
      block = configs;
      block.appendTo(this);
    }
    else{
      block = new metaScore.player.component.Block(metaScore.Object.extend({}, configs, {
          'container': this,
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

  /**
   * Description
   * @method updateCSS
   * @param {} value
   * @return 
   */
  Player.prototype.updateCSS = function(value){
    this.css.setInternalValue(value);
  };

  /**
   * Description
   * @method togglePlay
   * @return 
   */
  Player.prototype.togglePlay = function(){
    var media = this.getMedia();
  
    if(media.isPlaying()){
      media.pause();
    }
    else{
      media.play();
    }
  };

  /**
   * Description
   * @method setReadingIndex
   * @param {} index
   * @param {} supressEvent
   * @return ThisExpression
   */
  Player.prototype.setReadingIndex = function(index, supressEvent){
    this.rindex_css.removeRules();

    if(index !== 0){
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"]', 'display: block;');
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]) .contents', 'display: block;');
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"].active .contents', 'display: block;');
    }

    if(supressEvent !== true){
      this.triggerEvent('rindex', {'player': this, 'value': index}, true, false);
    }
    
    return this;
  };

  return Player;

})();