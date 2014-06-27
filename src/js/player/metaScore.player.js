/**
 * Player
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires metaScore.player.block.js
 */
metaScore.Player = metaScore.Dom.extend(function(){

  var blocks = [];

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-player'});
    
    if(DEBUG){
      metaScore.Player.instance = this;
    }
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
  };
  
  this.addBlock = function(configs){
    
    var block = new metaScore.Player.Block(configs)
      .appendTo(this);
    
    blocks.push(block);
    
    return block;
    
  };
  
  this.deleteBlock = function(block){
    
    if(block){
      block.remove();
      metaScore.Array.remove(blocks, block);
    }
    
  };
  
});