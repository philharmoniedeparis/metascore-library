/**
 * Base Class
 *
 * @requires metaScore.core.js
 */
 
metaScore.Class = (function () {
 
  /**
   * @constructor
   */
  function Class(){    
  }

  Class.defaults = {};
      
  Class.extend = function(child){
    child.prototype = Object.create(this.prototype, {
      constructor: {
        value: child
      }
    });
    
    child.parent = this;
    child.extend = this.extend;
    
    if(!child.hasOwnProperty('defaults')){
      child.defaults = {};
    }
    
    for(var prop in this.defaults){
      if(!child.defaults.hasOwnProperty(prop)){
        child.defaults[prop] = this.defaults[prop];
      }
    } 
  };
  
  Class.prototype.getConfigs = function(configs){
    configs = configs || {};
  
    for(var prop in this.constructor.defaults){
      if(!configs.hasOwnProperty(prop)){
        configs[prop] = this.constructor.defaults[prop];
      }
    }
  
    return configs;  
  };
  
  return Class;
  
})();