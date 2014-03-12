/*global global*/

/**
* String helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.String = {

    /**
    * Capitalize a string
    * @param {string} the original string
    * @returns {string} the capitalized string
    */
    capitalize: function(str){
      return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    }
  };
  
}(global));