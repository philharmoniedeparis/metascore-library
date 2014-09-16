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
    
    // call parent constructor
    Page.parent.call(this, '<div/>', {'class': 'page'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  Page.defaults = {
    'elements': []
  };
  
  metaScore.Dom.extend(Page);
  
  Page.prototype.onClick = function(evt){  
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'page': this});
    
      evt.stopPropagation();
    }
  };
  
  Page.prototype.addElement = function(configs){
    var element;
    
    if(configs instanceof metaScore.player.Element){
      element = configs;
    }
    else{
      element = new metaScore.player.element[configs.type](configs);
    }
    
    element.appendTo(this);
    
    return element;  
  };
  
  Page.prototype.getProperty = function(prop){
    switch(prop){
      case 'bg-color':
        return this.css('background-color');
        
      case 'bg-image':
        return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
      case 'start-time':
        console.log(this.data('ds'));
        return this.data('start-time');
        
      case 'end-time':
        return this.data('end-time');
    }
  };
  
  Page.prototype.setProperty = function(prop, value){
    switch(prop){
      case 'bg-color':
        this.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'start-time':
        this.data('start-time', value);
        break;
        
      case 'end-time':
        this.data('end-time', value);
        break;
        
     case 'elements':
        metaScore.Array.each(value, function(index, configs){
          this.addElement(configs);
        }, this);
        break;
    }
    
    this.triggerEvent('propertychange', {'property': prop, 'value': value});
  };
  
  Page.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Page;
  
})();