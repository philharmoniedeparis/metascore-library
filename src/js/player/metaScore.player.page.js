/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Page = (function () {

  function Page(dom) {    
    if(dom){
      // call parent constructor
      Page.parent.call(this, dom);
    }
    else{
      // call parent constructor
      Page.parent.call(this, '<div/>', {'class': 'page'});
    }
      
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  metaScore.Dom.extend(Page);
  
  Page.prototype.addElement = function(element){  
    this.append(element);
    
    return element;  
  };
  
  Page.prototype.onClick = function(evt){    
    this.triggerEvent('pageclick', {'page': this});
    
    evt.stopPropagation();    
  };
    
  return Page;
  
})();