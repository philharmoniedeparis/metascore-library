/**
 * Player
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires metaScore.player.block.js
 */
metaScore.Player = metaScore.Dom.extend(function(){

  var _blocks;

  this.constructor = function(selector) {
  
    _blocks = {};
  
    this.super('<div/>', {'class': 'metaScore-player'});
    
    if(DEBUG){
      metaScore.Player.instance = this;
    }
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
  };
  
  this.addBlock = function(configs){
    
    var block, id;
    
    block = new metaScore.Player.Block(configs)
      .appendTo(this);
      
    id = block.attr('id');
    
    _blocks[id] = block;
    
    return block;
    
  };
  
  this.getBlock = function(id){
    
    return _blocks[id];
    
  };
  
  this.deleteBlock = function(block){
    
    var id;
    
    if(block){
      id = block.attr('id');
    
      block.remove();      
      delete _blocks[id];
    }
    
  };
  
});