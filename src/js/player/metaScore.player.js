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
    
    this.media = new metaScore.player.Media();
    
    if(!(this.configs.hasOwnProperty('id'))){
      this.configs.id = metaScore.String.uuid();
    }
    
    metaScore.Array.each(this.configs.blocks, function(index, block){
      this.addBlock(block);
    }, this);
  }
  
  Player.defaults = {
    container: 'body',
    blocks: [],
    keyboard: true
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
      .addListener('elementclick', metaScore.Function.proxy(this.onElementClick, this));
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.destroy = function(parent){
    var blocks = metaScore.Dom.selectElements('.metaScore-block[data-player-id="'+ this.configs.id +'"]', parent);
    
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
    
  return Player;
  
})();