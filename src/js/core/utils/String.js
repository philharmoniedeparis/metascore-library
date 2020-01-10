/**
 * Capitalize a string
 *
 * @param {String} str The string to capitalize
 * @return {String} The capitalized string
 */
export function capitalize(str){
    return str.replace(/(?:^|\s)\S/g, (a) => { return a.toUpperCase(); });
}

/**
 * Generate a random uuid
 *
 * @author Broofa <robert@broofa.com> (http://www.broofa.com/2008/09/javascript-uuid-function/)
 * @param {Integer} [len] The desired number of characters
 * @param {Integer} [radix] The number of allowable values for each character
 * @return {String} The generated uuid
 *
 * @example
 *    let id = uuid();
 *    // "66209871-857D-4A12-AC7E-E9EEBC2A6AC3"
 *
 * @example
 *    let id = uuid(5);
 *    // "kryIh"
 *
 * @example
 *    let id = uuid(5, 2);
 *    // "10100"
 */
export function uuid(len, radix) {
    const chars = [
        '0','1','2','3','4','5','6','7','8','9',
        'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
    ];
    const _radix = radix || chars.length;
    const id = [];

    if (len) {
        // Compact form
        for (let i = 0; i < len; i++){
            id[i] = chars[0 | Math.random() * _radix];
        }
    }
    else {
        // rfc4122 requires these characters
        id[8] = id[13] = id[18] = id[23] = '-';
        id[14] = '4';

        // Fill in random data.    At i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
        for (let i = 0; i < 36; i++) {
            if (!id[i]) {
                const r = 0 | Math.random() * 16;
                id[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return id.join('');
}

/**
 * Pad a string with another string
 *
 * @param {String} str The string to pad
 * @param {Integer} len The desired final string length
 * @param {String} [padstr=" "] The string to pad with
 * @param {String} [dir="right"] The padding direction ("right", "left" or "both")
 * @return {String} The padded string
 *
 * @exqmple
 *    var str = "a";
 *    var padded = String.pad(str, 3, "b");
 *    // "abb"
 *
 * @exqmple
 *    var str = "a";
 *    var padded = String.pad(str, 3, "b", "left");
 *    // "bba"
 *
 * @exqmple
 *    var str = "a";
 *    var padded = String.pad(str, 3, "b", "both");
 *    // "bab"
 */
export function pad(str, len = 0, padstr = ' ', dir = 'right') {
    let padded_str = `${str}`;

    if (len + 1 >= padded_str.length) {
        switch (dir){
            case 'left':
                padded_str = Array(len + 1 - padded_str.length).join(padstr) + padded_str;
                break;

            case 'both':{
                const padlen = len - padded_str.length;
                const right = Math.ceil(padlen / 2);
                const left = padlen - right;

                padded_str = Array(left+1).join(padstr) + padded_str + Array(right+1).join(padstr);
                break;
            }

            default:
                padded_str = padded_str + Array(len + 1 - padded_str.length).join(padstr);
                break;
        }
    }

    return padded_str;
}

/**
 * Replace all occurences of a sub-string in a string
 *
 * @param {String} str The string being searched and replaced on
 * @param {String} search The value being searched for
 * @param {String} replacement The value that replaces found search values
 * @return {String} The replaced string
 *
 * @exqmple
 *    var str = "abc test test abc test test test abc test test abc";
 *    var replaced = String.replaceAll(str, "abc", "xyz");
 *    // "xyz test test xyz test test test xyz test test xyz"
 */
export function replaceAll(str, search, replacement) {
    const escaped_search = search.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    const regex = new RegExp(escaped_search, 'g');

    return str.replace(regex, replacement);
}

/**
 */
export function decodeHTML(str) {
    const doc = document.implementation.createHTMLDocument("");
    const element = doc.createElement('div');

    element.innerHTML = str;

    return element.textContent;
}

/**
 * A natural comparision function
 *
 * @author Jim Palmer (http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/) - version 0.7
 * @param {String} a The original string
 * @param {String} b The string to compare with
 * @param {Boolean} [insensitive=false] Whether the sort should not be case-sensitive
 */
export function naturalCompare(a, b, insensitive){ // eslint-disable-line complexity
    const re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
    const sre = /(^[ ]*|[ ]*$)/g;
    const dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[/-]\d{1,4}[/-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
    const hre = /^0x[0-9a-f]+$/i;
    const ore = /^0/;
    const i = (s) => { return insensitive && (`${s}`).toLowerCase() || `${s}` };

    // convert all to strings strip whitespace
    const x = i(a).replace(sre, '') || '';
    const y = i(b).replace(sre, '') || '';

    // chunk/tokenize
    const xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
    const yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');

    // numeric, hex or date detection
    const xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x));
    const yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null;

    // first try and sort Hex codes or Dates
    if (yD){
        if (xD < yD){
            return -1;
        }
        else if (xD > yD){
            return 1;
        }
    }

    // natural sorting through split numeric strings and default strings
    for(let cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++){
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        let oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        let oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;

        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if(isNaN(oFxNcL) !== isNaN(oFyNcL)){
            return (isNaN(oFxNcL)) ? 1 : -1;
        }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if(typeof oFxNcL !== typeof oFyNcL){
                oFxNcL += '';
                oFyNcL += '';
        }

        if(oFxNcL < oFyNcL){
            return -1;
        }

        if (oFxNcL > oFyNcL) {
            return 1;
        }
    }

    return 0;
}
