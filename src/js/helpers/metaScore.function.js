/**
* Description
* @class Function
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Function = (function () {

  /**
   * Description
   * @constructor
   */
  function Function() {
  }

  metaScore.Class.extend(Function);

  /**
   * Checks if a variable is of a certain type
   * @method proxy
   * @param {} fn
   * @param {} scope
   * @param {} args
   * @return FunctionExpression
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
   * @method emptyFn
   * @return 
   */
  Function.emptyFn = function(){};

  return Function;

})();