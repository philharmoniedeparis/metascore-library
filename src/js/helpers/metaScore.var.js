/**
 * Variable
 *
 * @requires ../metaScore.base.js
 */
 
metaScore.Var = (function () {

  /**
  * Helper object used by the type function
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
  
  function Var() {
  }
  
  metaScore.Class.extend(Var);

  /**
  * Get the type of a variable
  * @param {mixed} the variable
  * @returns {string} the type
  */
  Var.type = function(obj) {
    return obj == null ? String(obj) : classes2types[ Object.prototype.toString.call(obj) ] || "object";
  };

  /**
  * Checks if a variable is of a certain type
  * @param {mixed} the variable
  * @param {string} the type to check against
  * @returns {boolean} true if the variable is of the specified type, false otherwise
  */
  Var.is = function(obj, type) {
    return Var.type(obj) === type.toLowerCase();
  };

  /**
  * Checks if a variable is empty
  * @param {mixed} the variable
  * @returns {boolean} true if the variable is empty, false otherwise
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