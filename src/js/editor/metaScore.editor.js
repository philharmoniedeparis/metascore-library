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
      .addListener('blockset', function(evt){
        _page_panel.setPage(evt.detail.block.getActivePage(), true);
        _page_panel.getMenu().enableItems('[data-action="new"]');
        _element_panel.getMenu().enableItems('[data-action="new"]');
          
        evt.stopPropagation();
      })
      .addListener('blockunset', function(evt){
        _page_panel.unsetPage();
        _page_panel.getMenu().disableItems('[data-action="new"]');
          
        evt.stopPropagation();
      })
      .getToolbar()
        .addDelegate('.buttons [data-action]', 'click', function(evt){
          switch(metaScore.Dom.data(evt.target, 'action')){
            case 'new':
              this.addBlock();
              break;
              
            case 'delete':
              this.removeBlock();
              break;
          }
          
          evt.stopPropagation();
        }, this);
    
    _page_panel
      .addListener('pageset', function(evt){
        var page = evt.detail.page,
          block = new metaScore.Player.Block(page.parents().parents().get(0));
        
        _block_panel.setBlock(block, true);
        _page_panel.getMenu().enableItems('[data-action="new"]');
        _element_panel.getMenu().enableItems('[data-action="new"]');
          
        evt.stopPropagation();
      })
      .addListener('pageunset', function(evt){
        _element_panel.unsetElement();
        _element_panel.getMenu().disableItems('[data-action="new"]');
          
        evt.stopPropagation();
      })
      .getToolbar()
        .addDelegate('.buttons [data-action]', 'click', function(evt){
          switch(metaScore.Dom.data(evt.target, 'action')){
            case 'new':
              this.addPage();
              break;
              
            case 'delete':
              this.removePage();
              break;
          }
          
          evt.stopPropagation();
        }, this);
    
    _element_panel
      .addListener('elementset', function(evt){
        var element = evt.detail.element,
          page = new metaScore.Player.Page(element.parents().get(0)),
          block = new metaScore.Player.Block(page.parents().parents().get(0));
        
        _page_panel.setPage(page, true);
        _block_panel.setBlock(block, true);
          
        evt.stopPropagation();
      })
      .getToolbar()
        .addDelegate('.buttons [data-action]', 'click', function(evt){
          switch(metaScore.Dom.data(evt.target, 'action')){
            case 'new':
              this.addElement(metaScore.Dom.data(evt.target, 'type'));
              break;
              
            case 'delete':
              this.removePage();
              break;
          }
          
          evt.stopPropagation();
        }, this);
    
    _player_body
      .addDelegate('.metaScore-block .pages .page .element', 'click', function(evt){
        var element = new metaScore.Player.Element(evt.target);
        
        _element_panel.setElement(element);
        
        evt.stopImmediatePropagation();
      }, this)
      .addDelegate('.metaScore-block .pages .page', 'click', function(evt){      
        var page = new metaScore.Player.Page(evt.target);
        
        _page_panel.setPage(page);
        _element_panel.unsetElement();
        
        evt.stopImmediatePropagation();
      }, this)
      .addDelegate('.metaScore-block .pager', 'click', function(evt){
        var block = new metaScore.Player.Block(evt.target.parentElement);
                
        _block_panel.setBlock(block);
        
        evt.stopImmediatePropagation();
      }, this)
      .addListener('click', function(evt){
        _block_panel.unsetBlock();
        
        evt.stopPropagation();
      })
      .addDelegate('.metaScore-block', 'pageactivated', function(evt){
        var page = evt.detail.page;
        
        _page_panel.setPage(page);
      }, this)
      .addDelegate('.metaScore-block .pages', 'childremoved', function(evt){
        var block = new metaScore.Player.Block(evt.target.parentElement);
        
        if(block.getPageCount() === 0){
          this.addPage(block);
        }
        
        block.setActivePage(0);
      }, this)
      .addListener('keydown', this.onKeydown)
      .addListener('keyup', this.onKeyup);

    new metaScore.Dom('body')
      .addListener('keydown', this.onKeydown)
      .addListener('keyup', this.onKeyup);
      
      
    _block_panel.unsetBlock();
    
  };
  
  this.addBlock = function(){    
    var block = new metaScore.Player.Block().appendTo(_player_body);
    
    _block_panel.setBlock(block);
    
    this.addPage(block);
    
    return block;
  };
  
  this.removeBlock = function(){
    var block;
    
    if(block = _block_panel.getBlock()){
      block.remove();
    }
    
    _block_panel.unsetBlock();
    
  };
  
  this.addPage = function(block){
    var page;
    
    block = block || _block_panel.getBlock();
      
    page = new metaScore.Player.Page();
      
    block.addPage(page);
    
    _page_panel.setPage(page);
    
    return page;
  };
  
  this.removePage = function(){
    var page;
    
    if(page = _page_panel.getPage()){
      page.remove();
    }
    
  };
  
  this.addElement = function(type, page){
    var element;
    
    page = page || _page_panel.getPage();
      
    element = new metaScore.Player.Element[type]();
      
    page.addElement(element);
    
    _element_panel.setElement(element);
    
    return element;
  };
  
  this.removeElement = function(){
    var element;
    
    if(element = _element_panel.getElement()){
      element.remove();
    }
    
  };
  
  this.onKeydown = function(evt){  
    switch(evt.keyCode){
      case 18: //alt
        _player_body.addClass('alt-down');
        break;
    }  
  };
  
  this.onKeyup = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        _player_body.removeClass('alt-down');
        break;
    }
  };
});