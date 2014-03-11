/*global global*/

/**
* Array helper functions
*/
(function (context) {

  context.metaScore.Array = {

    /**
    * Checks if an object is an array
    * @param {array} the object
    * @returns {boolean} true if the object is an array, false otherwise
    */
    isArray: function(arr) {  
      return Object.prototype.toString.call(arr) === '[object Array]';
    },

    /**
    * Copies an array
    * @param {array} the original array
    * @returns {array} a copy of the array
    */
    copy: function (arr) {
      return [].concat(arr);
    },

    /**
    * Shuffles elements in an array
    * @param {array} the original array
    * @returns {array} a copy of the array with it's elements shuffled
    */
    shuffle: function(arr) {

      var shuffled = context.metaScore.Array.copy(arr);

      shuffled.sort(function(){
        return ((Math.random() * 3) | 0) - 1;
      });

      return shuffled;

    },

    /**
    * Return new array with duplicate values removed
    * @param {array} the original array
    * @returns {array} a copy of the array with the duplicate values removed
    */
    unique: function(arr) {

      var unique = [];
      var length = arr.length;

      for(var i=0; i<length; i++) {
        for(var j=i+1; j<length; j++) {
          // If this[i] is found later in the array
          if (arr[i] === arr[j]){
            j = ++i;
          }
        }
        unique.push(arr[i]);
      }

      return unique;

    },

    /**
    * Call a function on each element of an array
    * @param {array} the array
    * @param {function} the function to call
    * @returns {void}
    */
    each: function(arr, fn, scope) {
    
      if(!scope){
        scope = context;
      }

      for(var i = 0, l = arr.length; i < l; i++) {
        fn.call(scope, arr[i]);
      }

    }
  };
  
}(global));