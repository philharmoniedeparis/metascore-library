/**
 * Function
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.var.js
 */
 
metaScore.Function = (function () {
  
  function Function() {
  }
  
  metaScore.Class.extend(Function);

  /**
  * Checks if a variable is of a certain type
  * @param {mixed} the variable
  * @param {string} the type to check against
  * @param {array} an array of arguments to send, defaults to the arguments sent
  * @returns {boolean} true if the variable is of the specified type, false otherwise
  */
  Function.proxy = function(fn, scope, args){
    if (!metaScore.Var.type(fn, 'function')){
      return undefined;
    }
    
    return function () {    
      return fn.apply(scope || this, args || arguments);
    };
  };

  /**
  * A reusable empty function
  */
  Function.emptyFn = function(){};
    
  return Function;
  
})();