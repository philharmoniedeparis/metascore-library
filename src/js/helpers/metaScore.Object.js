/**
* Description
* @class Object
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Object = (function () {

  /**
   * Description
   * @constructor
   */
  function Object() {
  }

  metaScore.Class.extend(Object);

  /**
   * Merge the contents of two or more objects together into the first object.
   * @method extend
   * @return target
   */
  Object.extend = function() {

    var target = arguments[0] || {},
      options,
      i = 1,
      length = arguments.length,
      key, src, copy;

    for (; i < length; i++ ) {
      if ((options = arguments[i]) != null) {
        for ( key in options ) {
          src = target[key];
          copy = options[key];

          if(src !== copy && copy !== undefined ) {
            target[key] = copy;
          }
        }
      }
    }

    return target;

  };

  /**
   * Return a copy of an object
   * @method copy
   * @param {} obj
   * @return CallExpression
   */
  Object.copy = function(obj) {

    return Object.extend({}, obj);

  };

  /**
   * Call a function on each property of an object
   * @method each
   * @param {} obj
   * @param {} callback
   * @param {} scope
   * @return obj
   */
  Object.each = function(obj, callback, scope) {

    var key, value,
      scope_provided = scope !== undefined;

    for (key in obj) {
      value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);

      if (value === false) {
        break;
      }
    }

    return obj;

  };

  return Object;

})();