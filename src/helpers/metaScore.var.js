/*global global*/

/**
* Variable helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Var = {

    /**
    * Helper object used by the type function
    */
    classes2types: {
      "[object Boolean]": "boolean",
      "[object Number]": "number",
      "[object String]": "string",
      "[object Function]": "function",
      "[object Array]": "array",
      "[object Date]": "date",
      "[object RegExp]": "regexp",
      "[object Object]": "object"
    },

    /**
    * Get the type of a variable
    * @param {mixed} the variable
    * @returns {string} the type
    */
    type: function(obj) {
      return obj == null ? String(obj) : metaScore.Var.classes2types[ Object.prototype.toString.call(obj) ] || "object";
    },

    /**
    * Checks if a variable is of a certain type
    * @param {mixed} the variable
    * @param {string} the type to check against
    * @returns {boolean} true if the variable is of the specified type, false otherwise
    */
    is: function(obj, type) {
      return metaScore.Var.type(obj) === type.toLowerCase();
    }
  };
  
}(global));