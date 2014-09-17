/**
 * Player Component
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player');

metaScore.player.Component = (function () {

  function Component(configs) {  
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Component.parent.call(this, '<div/>', {'class': 'metaScore-component'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    }
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Object.each(this.configs.listeners, function(key, value){
      this.addListener(key, value);
    }, this);
    
    this.setupDOM();
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  metaScore.Dom.extend(Component);
  
  Component.defaults = {
    'properties': {}
  };
  
  Component.prototype.setupDOM = function(){
  
  };
  
  Component.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'component': this});
    
      evt.stopPropagation();
    }
  };
  
  Component.prototype.getProperty = function(prop){
    if(prop in this.configs.properties && 'getter' in this.configs.properties[prop]){
      return this.configs.properties[prop].getter.call(this);
    }
  };
  
  Component.prototype.setProperty = function(prop, value){
    if(prop in this.configs.properties && 'setter' in this.configs.properties[prop]){
      this.configs.properties[prop].setter.call(this, value);
      this.triggerEvent('propchange', {'component': this, 'property': prop, 'value': value});
    }
  };
  
  Element.prototype.setCuePoint = function(configs){
  };
  
  Component.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Component;
  
})();