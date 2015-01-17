/**
 * Locale
 *
 * @requires ../metaScore.base.js
 */

metaScore.Locale = (function () {

  function Locale() {
  }

  metaScore.Class.extend(Locale);

  Locale.strings = {};

  /**
  * Translate a string
  * @param {string} the original string
  * @param {object} string replacements
  * @returns {string} the translated string
  */
  Locale.t = function(key, str, args){
    var locale = metaScore.getLocale();

    if(this.strings.hasOwnProperty(locale) && this.strings[locale].hasOwnProperty(key)){
      str = this.strings[locale][key];
    }

    return Locale.formatString(str, args);
  };

  /**
  * Replace placeholders with sanitized values in a string.
  * @param {string} the original string
  * @param {object} string replacements
  * @returns {string} the formatted string
  */
  Locale.formatString = function(str, args) {
    metaScore.Object.each(args, function(key, value){
      str = str.replace(key, args[key]);
    }, this);

    return str;
  };

  return Locale;

})();