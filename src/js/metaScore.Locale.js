/**
 * Locale
 *
 * @requires ../metaScore.base.js
 */

metaScore.Locale = (function () {

  function Locale() {
  }

  metaScore.Class.extend(Locale);

  /**
  * Translate a string
  * @param {string} the original string
  * @param {object} string replacements
  * @returns {string} the translated string
  */
  Locale.t = function(key, str, args){
    if(typeof(metaScoreLocale) !== "undefined" && metaScoreLocale.hasOwnProperty(key)){
      str = metaScoreLocale[key];
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