/*global global console*/

/**
* Editor
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Editor = metaScore.Dom.extend({
    init: function(selector) {
    
      this.callSuper('<div/>', {'class': 'metaScore-editor'});
      
      if(selector !== undefined){
        this.appendTo(selector);
      }
      
      this.setupUI();
      
    },
    setupUI: function(){
    
      var bottom, workspace, grid;
    
      this.mainmenu = metaScore.Editor.MainMenu.create()
        .appendTo(this);
      
      bottom = metaScore.Dom.create('<div/>', {'class': 'bottom'})
        .appendTo(this);
    
      workspace = metaScore.Dom.create('<div/>', {'class': 'workspace'})
        .appendTo(bottom);
    
      grid = metaScore.Dom.create('<div/>', {'class': 'grid'})
        .appendTo(workspace);
        
      this.player = metaScore.Player.create()
        .appendTo(workspace);
    
      this.sidebar = metaScore.Editor.Sidebar.create()
        .appendTo(bottom);
      
    }
  });
  
}(global));