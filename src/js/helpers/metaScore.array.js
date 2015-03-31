/**
* Description
* @class Array
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Array = (function () {

  /**
   * Description
   * @constructor
   */
  function Array() {
  }

  metaScore.Class.extend(Array);

  /**
   * Checks if a value is in an array
   * @method inArray
   * @param {} value
   * @param {} arr
   * @return UnaryExpression
   */
  Array.inArray = function (value, arr) {
    var len, i = 0;

    if(arr) {
      if(arr.indexOf){
        return arr.indexOf(value);
      }

      len = arr.length;

      for ( ; i < len; i++ ) {
        // Skip accessing in sparse arrays
        if ( i in arr && arr[i] === value ) {
          return i;
        }
      }
    }

    return -1;
  };

  /**
   * Copies an array
   * @method copy
   * @param {} arr
   * @return CallExpression
   */
  Array.copy = function (arr) {
    return [].concat(arr);
  };

  /**
   * Shuffles elements in an array
   * @method shuffle
   * @param {} arr
   * @return shuffled
   */
  Array.shuffle = function(arr) {

    var shuffled = Array.copy(arr);

    shuffled.sort(function(){
      return ((Math.random() * 3) | 0) - 1;
    });

    return shuffled;

  };

  /**
   * Return new array with duplicate values removed
   * @method unique
   * @param {} arr
   * @return unique
   */
  Array.unique = function(arr) {

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

  };

  /**
   * Call a function on each element of an array
   * @method each
   * @param {} arr
   * @param {} callback
   * @param {} scope
   * @return arr
   */
  Array.each = function(arr, callback, scope) {

    var i = 0,
      l = arr.length,
      value,
      scope_provided = scope !== undefined;

    for(; i < l; i++) {
      value = callback.call(scope_provided ? scope : arr[i], i, arr[i]);

      if (value === false) {
        break;
      }
    }

    return arr;

  };

  /**
   * Remove an element from an array
   * @method remove
   * @param {} arr
   * @param {} element
   * @return arr
   */
  Array.remove = function(arr, element){
    var index = Array.inArray(element, arr);

    while(index > -1){
      arr.splice(index, 1);
      index = Array.inArray(element, arr);
    }

    return arr;
  };

  return Array;

})();