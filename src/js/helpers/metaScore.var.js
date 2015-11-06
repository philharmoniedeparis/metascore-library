/**
* A helper class for variable type detection and value.
* @class Var
* @extends Class
*/

metaScore.Var = (function () {

  /**
  * Helper object used by the type function
  *
  * @property dot
  * @type {Object}
  * @private
  */
  var classes2types = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regexp",
    "[object Object]": "object"
  };

  /**
   * @constructor
   */
  function Var() {
  }

  metaScore.Class.extend(Var);

  /**
   * Get the type of a variable
   * @method type
   * @param {} obj
   * @return ConditionalExpression
   */
  Var.type = function(obj) {
    return obj == null ? String(obj) : classes2types[ Object.prototype.toString.call(obj) ] || "object";
  };

  /**
   * Checks if a variable is of a certain type
   * @method is
   * @param {} obj
   * @param {} type
   * @return BinaryExpression
   */
  Var.is = function(obj, type) {
    return Var.type(obj) === type.toLowerCase();
  };

  /**
   * Checks if a variable is empty
   * @method isEmpty
   * @param {} obj
   * @return Literal
   */
  Var.isEmpty = function(obj) {
    if(obj === undefined || obj == null){
      return true;
    }

    if(obj.hasOwnProperty('length')){
      return obj.length <= 0;
    }

    if(metaScore.Var.is(obj, 'object')){
      return Object.keys(obj).length <= 0;
    }

    return false;
  };

  return Var;

})();