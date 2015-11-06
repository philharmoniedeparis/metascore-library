metaScore.Class = (function(){

  /**
   * The base class <br/>
   * Implements a class extension mechanism and defines shared methods
   *
   * @class Class
   * @constructor
   */
  function Class(){
  }

  /**
   * Default config values
   *
   * @property defaults
   * @type Object
   * @default {}
   */
  Class.defaults = {};

  /**
   * Extends a class using the current one
   *
   * @method extend
   * @param {Class} child The child class to extend
   */
  Class.extend = function(child){
    child.prototype = Object.create(this.prototype, {
      constructor: {
        value: child
      }
    });

    child.parent = this;
    child.extend = this.extend;

    if(!('defaults' in child)){
      child.defaults = {};
    }

    for(var prop in this.defaults){
      if(!(prop in child.defaults)){
        child.defaults[prop] = this.defaults[prop];
      }
    }
  };

  /**
   * Returns a configs object by overriding the defaults with custom ones
   *
   * @method getConfigs
   * @param {Object} configs The custom configs
   * @return {Object} The extended configs
   */
  Class.prototype.getConfigs = function(configs){
    configs = configs || {};

    for(var prop in this.constructor.defaults){
      if(!(prop in configs)){
        configs[prop] = this.constructor.defaults[prop];
      }
    }

    return configs;
  };

  return Class;

})();