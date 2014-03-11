/*global global*/

/**
* Function helper functions
*/
(function (context) {

  context.metaScore.Function = {

    /**
    * Checks if an object is a function
    * @param {function} the object
    * @returns {boolean} true if the object is a function, false otherwise
    */
    isFunction: function(fn) {  
      return Object.prototype.toString.call(fn) === '[object Function]';
    }
    
  };
  
}(global));