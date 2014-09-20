/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = (function () {
  
  function Player(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Player.parent.call(this);
    
    this.id = this.configs.id || metaScore.String.uuid();
    
    this.media = new metaScore.player.component.Media(this.configs.media)
      .data('player-id', this.id)
      .addListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
      .appendTo(this.configs.container);
    
    this.controller = new metaScore.player.component.Controller(this.configs.controller)
      .data('player-id', this.id)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .appendTo(this.configs.container);   
    
    metaScore.Array.each(this.configs.blocks, function(index, configs){
      this.addBlock(metaScore.Object.extend({}, configs, {
        'container': this.configs.container,
        'listeners': {
          'propchange': metaScore.Function.proxy(this.onComponenetPropChange, this)
        }
      }));
    }, this);
  }
  
  Player.defaults = {
    'container': 'body',
    'blocks': [],
    'keyboard': true
  };
  
  metaScore.Evented.extend(Player);
  
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
    var currentTime = this.media.getCurrentTime();
  
    this.controller.updateTime(currentTime);
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
  
  Player.prototype.addBlock = function(configs){
    var block, page;
  
    if(configs instanceof metaScore.player.component.Block){
      block = configs;
    }
    else{
      block = new metaScore.player.component.Block(configs)
        .data('player-id', this.id);
    }
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.getComponents = function(parent){
    var components = [];
    
    new metaScore.Dom('.metaScore-component[data-player-id="'+ this.id +'"]', parent).each(function(index, component){
      components.push(component._metaScore);
    }, this);
    
    return components;
  };
  
  Player.prototype.destroy = function(parent){
    var components = this.getComponents(parent);
    
    metaScore.Array.each(components, function(index, component){
      component.destroy();
    }, this);
  };
    
  return Player;
  
})();