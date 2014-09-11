/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Element = (function () {

  function Element(dom) {
    if(dom){
      // call parent constructor
      Element.parent.call(this, dom);
    }
    else{
      // call parent constructor
      Element.parent.call(this, '<div/>', {'class': 'element'});
    }
      
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  metaScore.Dom.extend(Element);
  
  Element.prototype.onClick = function(evt){    
    this.triggerEvent('elementclick', {'element': this});
    
    evt.stopPropagation();    
  };
    
  return Element;
  
})();