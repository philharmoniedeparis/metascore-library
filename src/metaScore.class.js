/*global global*/

/**
* Defines the Class object
*/
(function (context) {
  
  context.metaScore.Class = function(configs){
    
    for (var key in configs) {
      if(configs.hasOwnProperty(key)){
        this.createGetter(configs, key);
        this.createSetter(configs, key);
      }
    }
    
  };
  
  context.metaScore.Class.prototype.createGetter = function(object, prop){
    this['get'+ context.metaScore.String.capitaliseFirstLetter(prop)] = function(){
      return object[prop];
    };
  };
  
  context.metaScore.Class.prototype.createSetter = function(object, prop){
    this['set'+ context.metaScore.String.capitaliseFirstLetter(prop)] = function(value){
      object[prop] = value;
    };
  };
  
  context.metaScore.Class.extend = function (constructor, static_properties, prototype_properties) {
  
    var cls, key;
  
    // set the class's constructor
    if(context.metaScore.Function.isFunction(constructor)){
      cls = constructor;
    }
    else{
      cls = this.prototype.constructor;
    }
  
    cls.prototype = new context.metaScore.Class();
    cls.prototype.constructor =  cls;
    cls.superClass = this;
    
    // set the class's static properties
    for (key in static_properties) {
      if(static_properties.hasOwnProperty(key)){
        cls[key] = static_properties[key];
      }
    }
    
    // set the class's prototype properties
    for (key in prototype_properties) {
      if(prototype_properties.hasOwnProperty(key)){
        cls.prototype[key] = prototype_properties[key];
      }
    }
    
    return cls;
    
  };
    
}(global));