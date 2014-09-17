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
    
    this.media = new metaScore.player.Media({
        'type': this.configs.file.type,
        'sources': this.configs.transcoded_files
      })
      .addListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .appendTo(this.configs.container);
    
    this.controller = new metaScore.player.Controller(this.configs.controller)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .data('player-id', this.id)
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
  
    if(configs instanceof metaScore.player.Block){
      block = configs;
    }
    else{
      block = new metaScore.player.Block(configs)
        .data('player-id', this.id);
    }
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.destroy = function(parent){
    var blocks = metaScore.Dom.selectElements('.metaScore-block[data-player-id="'+ this.id +'"]', parent);
    
    metaScore.Array.each(blocks, function(index, block){
      block._metaScore.destroy();
    }, this);
  };
    
  return Player;
  
})();