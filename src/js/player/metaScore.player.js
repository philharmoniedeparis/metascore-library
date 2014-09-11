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
    
    if(block.getPageCount() < 1){
      this.addPage(block);
    }
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.removeBlock = function(block){  
    block.remove();
    
    this.triggerEvent('blockremove', {'player': this, 'block': block}, true, false);
  };
  
  Player.prototype.addPage = function(block, configs){      
    var page = block.addPage(configs);
    
    this.triggerEvent('pageadd', {'player': this, 'page': page}, true, false);
    
    return page;
  };
  
  Player.prototype.removePage = function(page){
    page.remove();
    
    this.triggerEvent('pageremove', {'player': this, 'page': page}, true, false);
  };
  
  Player.prototype.addElement = function(page, configs){
    var element = page.addElement(configs);
    
    this.triggerEvent('elementadd', {'player': this, 'element': element}, true, false);
    
    return element;
  };
  
  Player.prototype.removeElement = function(element){    
    element.remove();
    
    this.triggerEvent('elementremove', {'player': this, 'element': element}, true, false);
  };
    
  return Player;
  
})();