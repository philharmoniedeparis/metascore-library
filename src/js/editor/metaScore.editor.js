/**
 * Editor
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor = metaScore.Dom.extend(function(){

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-editor'});
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
    this.setupUI();
    
  };
  
  this.setupUI = function(){
  
    this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'})
      .appendTo(this);
  
    this.mainmenu = new metaScore.Editor.MainMenu()
      .appendTo(this);
  
    this.sidebar = new metaScore.Editor.Sidebar()
      .appendTo(this);
      
    this.player = new metaScore.Player()
      .appendTo(this.workspace);
  
    this.grid = new metaScore.Dom('<div/>', {'class': 'grid'})
      .appendTo(this.workspace);
    
  };
});