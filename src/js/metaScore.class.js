/**
* The base class
* Implements a class extension mechanism and defines shared methods 
* @class Class
* @namespace metaScore
*/

metaScore.Class = (function () {

  /**
   * @constructor
   */
  function Class(){
  }

  Class.defaults = {};

  /**
   * Extends a class by another
   * @method extend
   * @param {Object} child
   * @return 
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
   * Extends the passed configs with default configs
   * @method getConfigs
   * @param {Object} configs
   * @return configs
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