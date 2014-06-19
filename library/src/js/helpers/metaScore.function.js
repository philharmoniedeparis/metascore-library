/*global global console*/

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
        
        if (!metaScore.Var.type(fn, 'function')) {
          return undefined;
        }
        
        return function () {
          return fn.apply(scope || this, arguments);
        };
      },
      /**
      * A reusable empty function
      */
      emptyFn: function(){}
    }
  });
  
}(global));