
/**
 * A class for array helper functions
 */
export default class Array {

    /**
     * Check if a value is in an array
     * 
     * @method inArray
     * @static
     * @param {Mixed} needle The value to search
     * @param {Array} haystack The array
     * @return {Integer} The index of the first match, -1 if none
     */
    static inArray(needle, haystack){
        var len, i = 0;

        if(haystack) {
            if(haystack.indexOf){
                return haystack.indexOf(needle);
            }

            len = haystack.length;

            for(; i < len; i++){
                // Skip accessing in sparse arrays
                if(i in haystack && haystack[i] === needle){
                    return i;
                }
            }
        }

        return -1;
    };

    /**
     * Copy an array
     * 
     * @method copy
     * @static
     * @param {Array} arr The original array
     * @return {Array} The copy
     */
    static copy(arr) {
        return [].concat(arr);
    };

    /**
     * Shuffle array elements
     * 
     * @method shuffle
     * @static
     * @param {Array} arr The array to shuffle
     * @return {Array} The shuffled copy of the array
     */
    static shuffle(arr) {
        var shuffled = Array.copy(arr);

        shuffled.sort(function(){
            return ((Math.random() * 3) | 0) - 1;
        });

        return shuffled;
    };

    /**
     * Remove duplicate values from an array
     * 
     * @method unique
     * @static
     * @param {Array} arr The array to remove duplicates from
     * @return {Array} A copy of the array with no duplicates
     */
    static unique(arr) {
        var unique = [],
            length = arr.length;

        for(var i=0; i<length; i++){
            for(var j=i+1; j<length; j++){
                // If this[i] is found later in the array
                if(arr[i] === arr[j]){
                    j = ++i;
                }
            }
            unique.push(arr[i]);
        }

        return unique;
    };

    /**
     * Iterate over an array with a callback function
     * 
     * @method each
     * @static
     * @param {Array} arr The array to iterate over
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {Integer} callback.index The index of the current element being processed in the array
     * @param {Mixed} callback.value The element that is currently being processed in the array
     * @param {Mixed} scope The value to use as this when executing the callback
     * @return {Array} The array
     */
    static each(arr, callback, scope) {
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
     * Remove a elements from an array by value
     * 
     * @method remove
     * @static
     * @param {Array} arr The array to remove the elements from
     * @param {Mixed} value The value to search for
     * @return {Array} The array
     */
    static remove(arr, value){
        var index = Array.inArray(value, arr);

        while(index > -1){
            arr.splice(index, 1);
            index = Array.inArray(value, arr);
        }

        return arr;
    };

    /**
     * A natural sort function generator
     * 
     * @method naturalSort
     * @author Jim Palmer (http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/) - version 0.7
     * @static
     * @param {Boolean} [insensitive=false] Whether the sort should not be case-sensitive
     * @return {Function} The sorting function
     * 
     * @example
     *     var arr = ["c", "A2", "a1", "d", "b"];
     *     arr.sort(Array.naturalSort(true));
     *     // ["a1", "A2", "b", "c", "d"]
     * 
     * @example
     *     var arr = ["c", "A2", "a1", "d", "b"];
     *     arr.sort(Array.naturalSort(false));
     *     // ["A2", "a1", "b", "c", "d"]
     */
    static naturalSort(insensitive){
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

    /**
     * A natural case-insentive sorting function to use with Array.sort
     * 
     * @method naturalSortInsensitive
     * @static
     * @param {String} a The first string to compare
     * @param {String} b The second string to compare
     * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    static naturalSortInsensitive(){
        return Array.naturalSort(true);
    }
    

    /**
     * A natural case-sentive sorting function to use with Array.sort
     * 
     * @method naturalSortInsensitive
     * @static
     * @param {String} a The first string to compare
     * @param {String} b The second string to compare
     * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    static naturalSortSensitive(){
        return Array.naturalSort(false);
    }

}