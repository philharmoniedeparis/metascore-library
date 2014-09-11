/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Element = (function () {

  function Element(configs) {
    this.configs = this.getConfigs(configs);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'element'});
    this.dom.get(0)._metaScore = this;
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  metaScore.Class.extend(Element);
  
  Element.prototype.onClick = function(evt){    
    this.dom.triggerEvent('elementclick', {'element': this});
    
    evt.stopPropagation();    
  };
    
  return Element;
  
})();