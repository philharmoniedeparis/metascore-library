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
    
    if(!(this.configs.hasOwnProperty('id'))){
      this.configs.id = metaScore.String.uuid();
    }
    
    this.media = new metaScore.player.Media();
    
    this.controller = new metaScore.player.Controller({
         'container': this.configs.container,
      })
      .addListener('click', metaScore.Function.proxy(this.onBlockClick, this));
      
    this.controller.dom.data('player-id', this.configs.id);
    
    metaScore.Array.each(this.configs.blocks, function(index, block){
      this.addBlock(block);
    }, this);
  }
  
  Player.defaults = {
    'container': 'body',
    'blocks': [],
    'keyboard': true
  };
  
  metaScore.Evented.extend(Player);
  
  Player.prototype.addBlock = function(configs){
    var block, page;
  
    if(configs instanceof metaScore.player.Block){
      block = configs;
    }
    else{
      block = new metaScore.player.Block(metaScore.Object.extend({}, configs, {'container': this.configs.container}));
    }
    
    block.dom.data('player-id', this.configs.id);
    
    if(block.getPageCount() < 1){
      block.addPage();
    }
    
    block
      .addListener('click', metaScore.Function.proxy(this.onBlockClick, this))
      .addListener('pageclick', metaScore.Function.proxy(this.onPageClick, this))
      .addListener('elementclick', metaScore.Function.proxy(this.onElementClick, this))
      .addListener('pageactivate', metaScore.Function.proxy(this.onBlockPageActivated, this));
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.destroy = function(parent){
    var blocks = metaScore.Dom.selectElements('.metaScore-controller[data-player-id="'+ this.configs.id +'"], .metaScore-block[data-player-id="'+ this.configs.id +'"]', parent);
    
    metaScore.Array.each(blocks, function(index, block){
      block._metaScore.destroy();
    }, this);
  };
  
  Player.prototype.onBlockClick = function(evt){
    this.triggerEvent('blockclick', {'block': evt.target});
  };
  
  Player.prototype.onPageClick = function(evt){
    this.triggerEvent('pageclick', {'page': evt.detail.page});
  };
  
  Player.prototype.onElementClick = function(evt){
    this.triggerEvent('elementclick', {'element': evt.detail.element});
  };
  
  Player.prototype.onBlockPageActivated = function(evt){
    this.triggerEvent('blockpageactivate', {'block': evt.target, 'index': evt.detail.index, 'page': evt.detail.page});
  };
    
  return Player;
  
})();