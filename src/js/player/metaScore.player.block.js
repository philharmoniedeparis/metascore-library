/**
 * Player Block
 *
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.Player.Block = metaScore.Dom.extend(function(){
  
  var _pager, _pages;

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'block', 'id': metaScore.String.uuid(5)});
  
    _pages = [];
    
    _pager = new metaScore.Player.Pager()
      .appendTo(this);
    
  };
  
  this.addPage = function(configs){
  
    var page = new metaScore.Player.Page(configs)
      .appendTo(this);
  
    _pages.push(page);
    
    return page;
  
  };
  
  this.setProperty = function(name, value){
  
    switch(name){
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
        
      case 'width':
        this.css('width', value +'px');
        break;
        
      case 'height':
        this.css('height', value +'px');
        break;
        
      case 'bg-color':
        this.css('background-color', value);
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'synched':
        this.data('synched', value);
        break;
    }
  
  };
});