/**
 * @module Core
 */

metaScore.Locale = (function(){

    /**
     * The i18n handling class
     *
     * @class Locale
     * @constructor
     */
    function Locale() {
    }

    /**
     * Translate a string
     *
     * @method t
     * @static
     * @param {String} key The string identifier
     * @param {String} str The default string to use if no translation is found
     * @param {Object} args An object of replacements to make after translation
     * @return {String} The translated string
     */
    Locale.t = function(key, str, args){
        if(typeof(metaScoreLocale) !== "undefined" && metaScoreLocale.hasOwnProperty(key)){
            str = metaScoreLocale[key];
        }

        return Locale.formatString(str, args);
    };

    /**
     * Replace placeholders with sanitized values in a string
     *
     * @method formatString
     * @static
     * @param {String} str The string to process
     * @param {Object} args An object of replacements with placeholders as keys
     * @return {String} The translated string
     */
    Locale.formatString = function(str, args) {
        metaScore.Object.each(args, function(key, value){
            str = str.replace(key, args[key]);
        }, this);

        return str;
    };

    return Locale;

})();