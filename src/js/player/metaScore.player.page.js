/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Page = metaScore.Dom.extend(function(){
  
  var _elements = [];

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'page'});
    
  };
  
  this.addElement = function(configs){
  
    var element = new metaScore.Player.Element(configs)
      .appendTo(this);
  
    _elements.push(element);
    
    return element;
  
  };
  
  this.setProperty = function(name, value){
  
    switch(name){        
      case 'bg-color':
        this.css('background-color', value);
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'start':
        this.data('start', value);
        break;
        
      case 'end':
        this.data('end', value);
        break;
    }
  
  };
});