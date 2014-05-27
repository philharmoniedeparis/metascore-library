/*global global console*/

/**
* Editor main menu
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Editor = metaScore.Editor || {};

  metaScore.Editor.MainMenu = metaScore.Base.extend({
    statics: {
    },
    init: function() {
    
      this.element = metaScore.Dom.create('<div/>', {'class': 'main-menu'});
      
    },
    getElement: function(){
    
      return this.element;
      
    }
  });
  
}(global));