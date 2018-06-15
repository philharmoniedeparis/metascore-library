/**
 * Capitalize a string
 *
 * @method capitalize
 * @param {String} str The string to capitalize
 * @return {String} The capitalized string
 */
export function capitalize(str){
    return str.replace(/(?:^|\s)\S/g, (a) => { return a.toUpperCase(); });
}

/**
 * Generate a random uuid
 *
 * @method uuid
 * @author Broofa <robert@broofa.com> (http://www.broofa.com/2008/09/javascript-uuid-function/)
 * @param {Integer} [len] The desired number of characters
 * @param {Integer} [radix] The number of allowable values for each character
 * @return {String} The generated uuid
 *
 * @exqmple
 *    var id = String.uuid();
 *    // "66209871-857D-4A12-AC7E-E9EEBC2A6AC3"
 *
 * @exqmple
 *    var id = String.uuid(5);
 *    // "kryIh"
 *
 * @exqmple
 *    var id = String.uuid(5, 2);
 *    // "10100"
 */
export function uuid(len, radix) {
    let chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        id = [], i;

    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++){
            id[i] = chars[0 | Math.random() * radix];
        }
    }
    else {
        // rfc4122, version 4 form
        let r;

        // rfc4122 requires these characters
        id[8] = id[13] = id[18] = id[23] = '-';
        id[14] = '4';

        // Fill in random data.    At i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!id[i]) {
                r = 0 | Math.random()*16;
                id[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return id.join('');
}

/**
 * Pad a string with another string
 *
 * @method pad
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
export function pad(str, len, padstr, dir) {
    let right, left,
        padlen;

    if (typeof(len) === "undefined") { len = 0; }
    if (typeof(padstr) === "undefined") { padstr = ' '; }
    if (typeof(dir) === "undefined") { dir = 'right'; }

    str = `${str}`;

    if (len + 1 >= str.length) {
        switch (dir){
            case 'left':
                str = Array(len + 1 - str.length).join(padstr) + str;
                break;

            case 'both':
                padlen = len - str.length;
                right = Math.ceil(padlen / 2);
                left = padlen - right;
                str = Array(left+1).join(padstr) + str + Array(right+1).join(padstr);
                break;

            default:
                str = str + Array(len + 1 - str.length).join(padstr);
                break;
        }
    }
    return str;
}

/**
 * Replace all occurences of a sub-string in a string
 *
 * @method replaceAll
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
