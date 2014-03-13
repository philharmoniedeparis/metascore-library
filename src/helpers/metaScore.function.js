/*global global*/

/**
* Function helper functions
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Function = metaScore.Base.extend({
    statics: {
      /**
      * Checks if a variable is of a certain type
      * @param {mixed} the variable
      * @param {string} the type to check against
      * @returns {boolean} true if the variable is of the specified type, false otherwise
      */
      proxy: function(fn, scope) {
      
        var args;
        
        if (!metaScore.Var.type(fn, 'function')) {
          return undefined;
        }
        
        args = Array.prototype.slice.call(arguments, 2);
        
        return function () {
          return fn.apply(scope || this, args);
        };
      }
    }
  });
  
}(global));