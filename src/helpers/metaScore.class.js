/*global global*/

/**
* Defines the Class object
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Class = function(configs){
  
    var _this = this;
          
    metaScore.Object.each(configs, function(key, value){
      this.createGetter(configs, key);
      this.createSetter(configs, key);
    }, this);
    
  };
  
  metaScore.Class.prototype.createGetter = function(object, prop){
    this['get'+ metaScore.String.capitalize(prop)] = function(){
      return object[prop];
    };
  };
  
  metaScore.Class.prototype.createSetter = function(object, prop){
    this['set'+ metaScore.String.capitalize(prop)] = function(value){
      object[prop] = value;
    };
  };
  
  metaScore.Class.extend = function (constructor, static_properties, prototype_properties) {
  
    var cls, key;
  
    // set the class's constructor
    if(constructor){
      cls = constructor;
    }
    else{
      cls = this.prototype.constructor;
    }
  
    cls.prototype = new metaScore.Class();
    cls.prototype.constructor =  cls;
    cls.superClass = this;
    
    // set the class's static properties
    metaScore.Object.each(static_properties, function(key, value){
      cls[key] = value;
    });
    
    // set the class's prototype properties
    metaScore.Object.each(prototype_properties, function(key, value){
      cls.prototype[key] = value;
    });
    
    return cls;
    
  };
    
}(global));