/*global global console*/

/**
* Editor
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Editor = metaScore.Base.extend({
    statics: {
    },
    init: function(selector) {
    
      this.element = metaScore.Dom.create(selector);
      
      this.element.addClass('metaScore-editor');
      
      this.setupUI();
      
    },
    setupUI: function(){
    
      this.mainmenu = metaScore.Editor.MainMenu.create();
      this.mainmenu.getElement().appendTo(this.element);
      
    }
  });
  
}(global));