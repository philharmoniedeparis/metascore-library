/*global global*/

/**
* String helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.String = metaScore.Base.extend({
    statics: {
      /**
      * Capitalize a string
      * @param {string} the original string
      * @returns {string} the capitalized string
      */
      capitalize: function(str){
        return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
      },

      /**
      * Translate a string
      * @param {string} the original string
      * @param {object} string replacements
      * @returns {string} the translated string
      */
      t: function(str){
        return str;
      }
    }
  });
  
}(global));