/**
 * Player Element
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Element = metaScore.Dom.extend(function(){

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'element'});
    
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
        
      case 'reading-index':
        this.attr('data-r-index', value);
        break;
        
      case 'z-index':
        this.css('z-index', value);
        break;
        
      case 'bg-color':
        this.css('background-color', value);
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'border-width':
        this.css('border-width', value +'px');
        break;
        
      case 'border-color':
        this.css('border-color', value);
        break;
        
      case 'start':
        this.attr('data-start', value);
        break;
        
      case 'end':
        this.attr('data-end', value);
        break;
    }
  
  };
});