/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = (function () {
  
  function Player(configs) {  
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Player.parent.call(this, '<iframe></iframe>', {'class': 'metaScore-player'});
    
    this.appendTo(this.configs.container);
    
    this.head = new metaScore.Dom(this.get(0).contentDocument.head);
    this.body = new metaScore.Dom(this.get(0).contentDocument.body);
    
    if(this.configs.url){
      this.load();
    }
    
  }
  
  Player.defaults = {
    'url': '',
    'ajax': {},
    'keyboard': true
  };
  
  
  metaScore.Dom.extend(Player);
  
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
    switch(evt.detail.property){
      case 'start-time':
      case 'end-time':
        evt.detail.component.setCuePoint({
          'media': this.media
        });        
        break;
    }
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
  
  Player.prototype.onLoadSuccess = function(xhr){  
    var data = JSON.parse(xhr.response);
    
    this.getBody().data('id', data.id);
    
    // add player style sheets    
    if(data.css){
      metaScore.Array.each(data.css, function(index, css) {
        this.addCSS(css);
      }, this);
    }
    
    this.media = new metaScore.player.component.Media(data.media)
      .addListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
      .appendTo(this.getBody());
    
    this.controller = new metaScore.player.component.Controller(data.controller)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .appendTo(this.getBody());
      
    this.rindex_css = new metaScore.StyleSheet({
      container: this.getBody()
    });
    
    metaScore.Array.each(data.blocks, function(index, block){
      this.addBlock(block);
    }, this);
    
    this.media.reset();
    
    this.getBody().removeClass('loading');
    
    this.triggerEvent('loadsuccess', {'player': this}, true, false);
  };
  
  Player.prototype.onLoadError = function(xhr){
    
    this.getBody().removeClass('loading');
    
    this.triggerEvent('loaderror', {'player': this}, true, false);
  
  };
  
  Player.prototype.getId = function(){
    return this.getBody().data('id');
  };
  
  Player.prototype.getHead = function(){
    return this.head;
  };
  
  Player.prototype.getBody = function(){
    return this.body;
  };
  
  Player.prototype.getComponents = function(type){
    var selector = '.metaScore-component';
      
    if(type){
      selector += '.'+ type;
    }
    
    return this.getBody().children(selector);
  };
  
  Player.prototype.addBlock = function(configs){
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
        .addDelegate('.element', 'time', metaScore.Function.proxy(this.onElementTime, this))          
        .addDelegate('.element', 'rindex', metaScore.Function.proxy(this.onElementReadingIndex, this));
    }
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.addCSS = function(attr){
    new metaScore.Dom('<link/>', metaScore.Object.extend({}, attr, {
        'rel': 'stylesheet',
        'type': 'text/css'
      }))
      .appendTo(this.getHead());
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
    
  return Player;
  
})();