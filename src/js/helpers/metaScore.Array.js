/**
* Description
* @class Array
* @extends Class
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

  /**
   * Natural Sort algorithm
   * Author: Jim Palmer (http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/)
   * Version 0.7 - Released under MIT license
   * @method naturalSort
   * @param {} insensitive
   * @return CallExpression
   */
  Array.naturalSort = function(insensitive){
    return function(a, b){
      var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
      // first try and sort Hex codes or Dates
      if (yD) {
        if ( xD < yD ) { return -1; }
        else if ( xD > yD ) { return 1; }
      }
      // natural sorting through split numeric strings and default strings
      for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
          // find floats not starting with '0', string or 0 if not defined (Clint Priest)
          oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
          oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
          // handle numeric vs string comparison - number < string - (Kyle Adams)
          if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
          // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
          else if (typeof oFxNcL !== typeof oFyNcL) {
              oFxNcL += '';
              oFyNcL += '';
          }
          if (oFxNcL < oFyNcL) { return -1; }
          if (oFxNcL > oFyNcL) { return 1; }
      }
      return 0;
    };
  };

  return Array;

})();