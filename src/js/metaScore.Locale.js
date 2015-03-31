/**
* The i18n handling class
* @class Locale
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Locale = (function () {

  /**
   * Description
   * @constructor
   */
  function Locale() {
  }

  metaScore.Class.extend(Locale);

  /**
   * Translate a string
   * @method t
   * @param {} key
   * @param {} str
   * @param {} args
   * @return CallExpression
   */
  Locale.t = function(key, str, args){
    if(typeof(metaScoreLocale) !== "undefined" && metaScoreLocale.hasOwnProperty(key)){
      str = metaScoreLocale[key];
    }

    return Locale.formatString(str, args);
  };

  /**
   * Replace placeholders with sanitized values in a string.
   * @method formatString
   * @param {} str
   * @param {} args
   * @return str
   */
  Locale.formatString = function(str, args) {
    metaScore.Object.each(args, function(key, value){
      str = str.replace(key, args[key]);
    }, this);

    return str;
  };

  return Locale;

})();