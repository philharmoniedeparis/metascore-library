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
export function naturalSort(insensitive){
    return (a, b) => {
        let re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
            sre = /(^[ ]*|[ ]*$)/g,
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[/-]\d{1,4}[/-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            i = (s) => { return insensitive && (`${s}`).toLowerCase() || `${s}` },
            // convert all to strings strip whitespace
            x = i(a).replace(sre, '') || '',
            y = i(b).replace(sre, '') || '',
            // chunk/tokenize
            xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
            // numeric, hex or date detection
            xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
            yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null,
            oFxNcL, oFyNcL;

        // first try and sort Hex codes or Dates
        if (yD) {
            if ( xD < yD ) { return -1; }
            else if ( xD > yD ) { return 1; }
        }

        // natural sorting through split numeric strings and default strings
        for(let cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
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
    }
}

/**
 * A natural case-insentive sorting function to use with Array.sort
 *
 * @method naturalSortInsensitive
 * @static
 * @param {String} a The first string to compare
 * @param {String} b The second string to compare
 * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
export function naturalSortInsensitive(){
    return naturalSort(true);
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
export function naturalSortSensitive(){
    return naturalSort(false);
}
