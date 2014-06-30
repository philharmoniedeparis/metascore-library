/**
 * Editor
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires metaScore.editor.mainmenu.js
 * @requires metaScore.editor.sidebar.js
 * @requires ../player/metaScore.player.js
 */
metaScore.Editor = metaScore.Dom.extend(function(){

  var _workspace, _mainmenu,
    _sidebar, _player, _grid;

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-editor'});
    
    if(DEBUG){
      metaScore.Editor.instance = this;
    }
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
  
    // add components
    _workspace = new metaScore.Dom('<div/>', {'class': 'workspace'})
      .appendTo(this);
  
    _mainmenu = new metaScore.Editor.MainMenu()
      .appendTo(this);
  
    _sidebar = new metaScore.Editor.Sidebar()
      .appendTo(this);
      
    _player = new metaScore.Player()
      .appendTo(_workspace);
  
    _grid = new metaScore.Dom('<div/>', {'class': 'grid'})
      .appendTo(_workspace);
      
      
    // add event listeners
    _sidebar.getPanel('block').getToolbar()
      .addDelegate('.buttons .menu .new', 'click', function(evt){
        var block = _player.addBlock();
        _sidebar.getPanel('block').selectBlock(block);
      })
      .addDelegate('.buttons .menu .delete', 'click', function(evt){
        var block = _sidebar.getPanel('block').getBlock();
        _player.deleteBlock(block);
      });
      
    _player.addDelegate('.block .pager', 'click', function(evt){
      var id = new metaScore.Dom(evt.target).parents('.block').attr('id'),
        block = _player.getBlock(id);
        
      _sidebar.getPanel('block').selectBlock(block);
    });
    
  };
});