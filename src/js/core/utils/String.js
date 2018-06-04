
/**
 * A class for string helper functions
 */
export default class String {

    /**
     * Capitalize a string
     * 
     * @method capitalize
     * @param {String} str The string to capitalize
     * @return {String} The capitalized string
     */
    static capitalize(str){
        return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

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
    static uuid(len, radix) {
        var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
            uuid = [], i;

        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++){
                uuid[i] = chars[0 | Math.random() * radix];
            }
        }
        else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.    At i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random()*16;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };

    /**
     * Pad a string with another string
     * 
     * @method pad
     * @param {String} str The string to pad
     * @param {Integer} len The desired final string length
     * @param {String} [pad=" "] The string to pad with
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
    static pad(str, len, pad, dir) {
        var right, left,
            padlen;

        if (typeof(len) === "undefined") { len = 0; }
        if (typeof(pad) === "undefined") { pad = ' '; }
        if (typeof(dir) === "undefined") { dir = 'right'; }

        str = str +'';

        if (len + 1 >= str.length) {
            switch (dir){
                case 'left':
                    str = Array(len + 1 - str.length).join(pad) + str;
                    break;

                case 'both':
                    padlen = len - str.length;
                    right = Math.ceil(padlen / 2);
                    left = padlen - right;
                    str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
                    break;

                default:
                    str = str + Array(len + 1 - str.length).join(pad);
                    break;
            }
        }
        return str;
    };

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
    static replaceAll(str, search, replacement) {
        var escaped_search = search.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        var regex = new RegExp(escaped_search, 'g');
        
        return str.replace(regex, replacement);
    };

}