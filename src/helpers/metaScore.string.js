/*global global*/

/**
* String helper functions
*/
(function (context) {

  context.metaScore.String = {

    /**
    * Checks if an object is a string
    * @param {string} the object
    * @returns {boolean} true if the object is a string, false otherwise
    */
    isString: function(str) {  
      return Object.prototype.toString.call(str) === '[object String]';
    },

    /**
    * Capitalize the first letter of string
    * @param {string} the original string
    * @returns {string} the string with the first lettre capitalized
    */
    capitaliseFirstLetter: function(str){
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };
  
}(global));