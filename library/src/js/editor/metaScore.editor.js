/*global global console*/

/**
* Editor
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Editor = metaScore.Dom.extend({
    init: function(selector) {
    
      this.callSuper('<div/>', {'class': 'metaScore-editor'});    
      this.appendTo(selector);
      
      this.setupUI();
      
    },
    setupUI: function(){
    
      this.mainmenu = metaScore.Editor.MainMenu.create();
      this.append(this.mainmenu);
      
    }
  });
  
}(global));