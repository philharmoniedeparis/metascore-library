/**
 * Editor
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires metaScore.editor.mainmenu.js
 * @requires metaScore.editor.sidebar.js
 * @requires ../player/metaScore.player.js
 */
metaScore.Editor = metaScore.Dom.extend(function(){

  var workspace, mainmenu,
    sidebar, player, grid;

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-editor'});
    
    if(DEBUG){
      metaScore.Editor.instance = this;
    }
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
  
    // add components
    workspace = new metaScore.Dom('<div/>', {'class': 'workspace'})
      .appendTo(this);
  
    mainmenu = new metaScore.Editor.MainMenu()
      .appendTo(this);
  
    sidebar = new metaScore.Editor.Sidebar()
      .appendTo(this);
      
    player = new metaScore.Player()
      .appendTo(workspace);
  
    grid = new metaScore.Dom('<div/>', {'class': 'grid'})
      .appendTo(workspace);
      
      
    // add event listeners
    sidebar.getPanel('block').getToolbar()
      .addDelegate('.buttons .menu .new', 'click', function(evt){
        var block = player.addBlock();
        sidebar.getPanel('block').setBlock(block);
      })
      .addDelegate('.buttons .menu .delete', 'click', function(evt){
        var block = sidebar.getPanel('block').getBlock();
        player.deleteBlock(block);
      });
      
    player.addDelegate('.block', 'click', function(evt){
      //sidebar.getPanel('block').setBlock(block);
    });
    
  };
});