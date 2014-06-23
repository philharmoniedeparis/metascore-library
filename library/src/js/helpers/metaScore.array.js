/*global metaScore*/

/**
* Array helper functions
*/
metaScore.Array = metaScore.Base.extend(function(){});

/**
* Checks if a value is in an array
* @param {mixed} the value to check
* @param {array} the array
* @returns {number} the index of the value if found, -1 otherwise
*/
metaScore.Array.inArray = function (value, arr) {
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
* @param {array} the original array
* @returns {array} a copy of the array
*/
metaScore.Array.copy = function (arr) {
  return [].concat(arr);
};

/**
* Shuffles elements in an array
* @param {array} the original array
* @returns {array} a copy of the array with it's elements shuffled
*/
metaScore.Array.shuffle = function(arr) {

  var shuffled = metaScore.Array.copy(arr);

  shuffled.sort(function(){
    return ((Math.random() * 3) | 0) - 1;
  });

  return shuffled;

};

/**
* Return new array with duplicate values removed
* @param {array} the original array
* @returns {array} a copy of the array with the duplicate values removed
*/
metaScore.Array.unique = function(arr) {

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
* @param {array} the array
* @param {function} the function to call
* @returns {void}
*/
metaScore.Array.each = function(arr, callback, scope) {

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