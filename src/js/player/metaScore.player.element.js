/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Element = (function () {

  function Element(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Element.parent.call(this);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'element'});
    this.dom.get(0)._metaScore = this;
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this.dom);
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  metaScore.Evented.extend(Element);
  
  Element.prototype.onClick = function(evt){
    this.triggerEvent('click');
    
    evt.stopPropagation();
  };
  
  Element.prototype.destroy = function(){
    this.dom.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Element;
  
})();