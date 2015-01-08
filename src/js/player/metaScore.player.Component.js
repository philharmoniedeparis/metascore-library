/**
 * Player Component
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player').Component = (function () {

  function Component(configs) {  
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Component.parent.call(this, '<div/>', {'class': 'metaScore-component'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    }
    
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
  
  Component.prototype.setupDOM = function(){};
  
  Component.prototype.getProperty = function(name){
    if(name in this.configs.properties && 'getter' in this.configs.properties[name]){
      return this.configs.properties[name].getter.call(this);
    }
  };
  
  Component.prototype.getProperties = function(){
    var values = {};
  
    metaScore.Object.each(this.configs.properties, function(name, prop){
      if('getter' in prop){
        values[name] = prop.getter.call(this);
      }
    }, this);
    
    return values;
  };
  
  Component.prototype.setProperty = function(name, value){
    if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
      this.configs.properties[name].setter.call(this, value);
      this.triggerEvent('propchange', {'component': this, 'property': name, 'value': value});
    }
  };
  
  Element.prototype.setCuePoint = function(configs){
  };
    
  return Component;
  
})();