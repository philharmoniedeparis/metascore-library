/**
 * Player Page
 *
 * @requires metaScore.player.js
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Page = metaScore.Dom.extend(function(){
  
  var elements = [];

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'page'});
    
  };
  
  this.addElement = function(configs){
  
    var element = new metaScore.Player.Element(configs)
      .appendTo(this);
  
    elements.push(element);
    
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
        this.attr('data-start', value);
        break;
        
      case 'end':
        this.attr('data-end', value);
        break;
    }
  
  };
});