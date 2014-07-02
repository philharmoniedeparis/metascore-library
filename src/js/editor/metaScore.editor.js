/**
 * Editor
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires metaScore.editor.mainmenu.js
 * @requires panel/metaScore.editor.panel.block.js
 * @requires panel/metaScore.editor.panel.page.js
 * @requires panel/metaScore.editor.panel.element.js
 * @requires ../player/metaScore.player.js
 */
metaScore.Editor = metaScore.Dom.extend(function(){

  var _workspace, _mainmenu,
    _sidebar,
    _block_panel, _page_panel, _element_panel,
    _player_wrapper, _player_head, _player_body, _player,
    _grid;

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-editor'});
    
    if(DEBUG){
      metaScore.Editor.instance = this;
    }
    
    if(selector !== undefined){
      this.appendTo(selector);
    } 
  
    // add components
    
    _workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);      
    _mainmenu = new metaScore.Editor.MainMenu().appendTo(this);     
    _sidebar =  new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this);    
    _block_panel = new metaScore.Editor.Panel.Block().appendTo(_sidebar);
    _page_panel = new metaScore.Editor.Panel.Page().appendTo(_sidebar);
    _element_panel = new metaScore.Editor.Panel.Element().appendTo(_sidebar);
    _player_wrapper = new metaScore.Dom('<iframe/>', {'class': 'player-wrapper'}).appendTo(_workspace);
    _player_head = new metaScore.Dom(_player_wrapper.get(0).contentDocument.head);
    _player_body = new metaScore.Dom(_player_wrapper.get(0).contentDocument.body).addClass('metaScore-player-wrapper');
    _player = new metaScore.Player();
    _grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(_workspace);
    
    // add styles
    
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': 'dist/metaScore.player.css'}).appendTo(_player_head);
      
      
    // add event listeners
    
    _block_panel
      .addListener('blockunset', function(evt){
        _page_panel.unsetPage();
      })
      .getToolbar()
        .addDelegate('.buttons .menu li', 'click', function(evt){
          var action = metaScore.Dom.data(evt.target, 'action'),
            block;
        
          switch(action){
            case 'new':        
              block = new metaScore.Player.Block().appendTo(_player_body);           
              _player.addComponenet('block', block);
              _block_panel.setBlock(block);
              break;
              
            case 'delete':
              _block_panel.getBlock().remove();
              break;
          }
          
          evt.stopPropagation();
        });
    
    _page_panel
      .addListener('pageset', function(evt){
        _page_panel.enableFields();
        
        evt.stopPropagation();
      })
      .addListener('pageunset', function(evt){
        _page_panel.disableFields();
        
        evt.stopPropagation();
      })
      .getToolbar()
        .addDelegate('.buttons .menu li', 'click', function(evt){
          var action = metaScore.Dom.data(evt.target, 'action'),
            page;
            
          switch(action){
            case 'new':        
              page = _block_panel.getBlock().addPage();                
              _player.addComponenet('page', page);
              _page_panel.setPage(page);
              break;
              
            case 'delete':
              _page_panel.getPage().remove();
              break;
          }
          
          evt.stopPropagation();
        });
    
    
    _player_body
      .addListener('click', function(evt){        
        _block_panel.unsetBlock();
        
        evt.stopPropagation();
      })
      .addDelegate('.metaScore-block .pager', 'click', function(evt){
        var id = new metaScore.Dom(evt.target).parents('.metaScore-block').attr('id');
        
        _block_panel.setBlock(_player.getComponenetById('block', id));
        
        evt.stopPropagation();
      });
    
  };
});