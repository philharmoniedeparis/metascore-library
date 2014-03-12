/*global global*/

/**
* Object helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Object = {

    /**
    * Merge the contents of two or more objects together into the first object.
    * @returns {object} the target object extended with the properties of the other objects
    */
    extend: function() {
    
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

    },

    /**
    * Call a function on each element of an array
    * @param {array} the array
    * @param {function} the function to call
    * @returns {void}
    */
    each: function(obj, callback, scope) {
    
      var key, value,
        scope_provided = scope !== undefined;
      
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);
        
          if (value === false) {
            break;
          }
        }
      }
      
      return obj;

    }
  };
  
}(global));