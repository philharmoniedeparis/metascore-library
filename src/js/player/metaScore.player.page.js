/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Page = (function () {

  function Page(configs) {
    this.configs = this.getConfigs(configs);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'page'});
    this.dom.get(0)._metaScore = this;
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Array.each(this.configs.elements, function(index, element){
      this.addElement(element);
    }, this);
  }
  
  metaScore.Class.extend(Page);
  
  Page.prototype.addElement = function(configs){
    var element;
    
    if(configs instanceof metaScore.player.Element){
      element = configs;
    }
    else{
      element = new metaScore.player.element[configs.type](configs);
    }
    
    element.dom.appendTo(this.dom);
    
    return element;  
  };
  
  Page.prototype.onClick = function(evt){    
    this.dom.triggerEvent('pageclick', {'page': this});
    
    evt.stopPropagation();    
  };
    
  return Page;
  
})();