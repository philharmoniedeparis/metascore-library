/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Page = metaScore.Dom.extend(function(){

  this.constructor = function(dom) {
  
    if(dom){
      this.super(dom);
    }
    else{
      this.super('<div/>', {'class': 'page'});
    }
      
    this.addListener('click', this.onClick);
    
  };
  
  this.addElement = function(element){
  
    this.append(element);
    
    return element;
  
  };
  
  this.onClick = function(evt){
    
    this.triggerEvent('pageclick', {'page': this});
    
    evt.stopPropagation();
    
  }; 
});