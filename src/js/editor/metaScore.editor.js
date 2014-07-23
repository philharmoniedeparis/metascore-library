/**
 * Editor
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires metaScore.editor.history.js
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
    _grid, _history;

  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'metaScore-editor'});
  
    this.initConfig(configs);
    
    if(DEBUG){
      metaScore.Editor.instance = this;
    }
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
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
    _history = new metaScore.Editor.History();
    
    // add player style sheets
    
    if(this.configs.palyer_css){
      metaScore.Array.each(this.configs.palyer_css, function(index, url) {
        this.addPlayerCSS(url);
      }, this);
    }
      
    // add event listeners
    
    _mainmenu
      .addDelegate('button[data-action]:not(.disabled)', 'click', this.onMainmenuClick, this);
    
    _block_panel
      .addListener('blockset', this.onBlockSet)
      .addListener('blockunset', this.onBlockUnset)
      .addListener('valueschange', this.onBlockPanelValueChange)
      .getToolbar().addDelegate('.buttons [data-action]', 'click', this.onBlockPanelToolbarClick, this);
    
    _page_panel
      .addListener('pageset', this.onPageSet)
      .addListener('pageunset', this.onPageUnset)
      .getToolbar().addDelegate('.buttons [data-action]', 'click', this.onPagePanelToolbarClick, this);
    
    _element_panel
      .addListener('elementset', this.onElementSet)
      .getToolbar().addDelegate('.buttons [data-action]', 'click', this.onElementPanelToolbarClick, this);
    
    _player_body
      .addDelegate('.metaScore-block .element', 'elementclick', this.onElementClick, this)
      .addDelegate('.metaScore-block .page', 'pageclick', this.onPageClick, this)
      .addDelegate('.metaScore-block', 'blockclick', this.onBlockClick, this)
      .addListener('click', this.onPlayerClick)
      .addDelegate('.metaScore-block', 'pageactivated', this.onPageActivated, this)
      .addListener('childremoved', this.onPlayerChildRemoved)
      .addListener('keydown', this.onKeydown)
      .addListener('keyup', this.onKeyup);
      
    _history
      .addListener('add', this.onHistoryAdd)
      .addListener('undo', this.onHistoryUndo)
      .addListener('redo', this.onHistoryRedo);

    new metaScore.Dom('body')
      .addListener('keydown', this.onKeydown)
      .addListener('keyup', this.onKeyup);
      
      
    _block_panel.unsetBlock();
    
  };
  
  this.addPlayerCSS = function(url){
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': url}).appendTo(_player_head);
  };
  
  this.addBlock = function(block){  
    if(!block){
      block = new metaScore.Player.Block();
      this.addPage(block);
    }
    
    block.appendTo(_player_body);
    _block_panel.setBlock(block);
        
    _history.add({
      'undo': metaScore.Function.proxy(function(){this.removeBlock(block);}, this),
      'redo': metaScore.Function.proxy(function(){this.addBlock(block);}, this)
    });
    
    return block;
  };
  
  this.removeBlock = function(block){
    block = block || _block_panel.getBlock();
  
    block.remove();
  };
  
  this.addPage = function(block){
    var page;
    
    block = block || _block_panel.getBlock();
      
    page = new metaScore.Player.Page();
      
    block.addPage(page);
    
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
      case 90: //z
        if(evt.ctrlKey){
          _history.undo();
        }
        break;
      case 89: //y
        if(evt.ctrlKey){
          _history.redo();
        }
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
  
  this.onMainmenuClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        break;
      case 'open':
        metaScore.Ajax.get(this.configs.api_url +'guide.json', {
          'success': function(xhr){
            console.log(JSON.parse(xhr.response));
          },
          'error': function(){
          }
        });
        break;
      case 'save':
        break;
      case 'download':
        break;
      case 'delete':
        break;
      case 'revert':
        break;
      case 'undo':
        _history.undo();
        break;
      case 'redo':
        _history.redo();
        break;
      case 'edit':
        break;
      case 'settings':
        break;
      case 'help':
        break;
    }
  };
  
  this.onBlockSet = function(evt){
    var block = evt.detail.block;
    
    _page_panel.setPage(block.getActivePage(), true);
    _page_panel.getMenu().enableItems('[data-action="new"]');
    _element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onBlockUnset = function(evt){
    _page_panel.unsetPage();
    _page_panel.getMenu().disableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onBlockPanelValueChange = function(evt){
    var block = evt.detail.block,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
     
    _history.add({
      'undo': function(cmd){_block_panel.updateBlockProperties(block, old_values);},
      'redo': function(cmd){_block_panel.updateBlockProperties(block, new_values);}
    });
  };
  
  this.onBlockPanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.addBlock();
        break;
        
      case 'delete':
        this.removeBlock();
        break;
    }
    
    evt.stopPropagation();
  };
  
  this.onPageSet = function(evt){
    var page = evt.detail.page,
      block = new metaScore.Player.Block(page.parents().parents().get(0));
    
    _block_panel.setBlock(block, true);
    _page_panel.getMenu().enableItems('[data-action="new"]');
    _element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onPageUnset = function(evt){
    _element_panel.unsetElement();
    _element_panel.getMenu().disableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onPagePanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.addPage();
        break;
        
      case 'delete':
        this.removePage();
        break;
    }
    
    evt.stopPropagation();
  };
  
  this.onElementSet = function(evt){
    var element = evt.detail.element,
      page = new metaScore.Player.Page(element.parents().get(0)),
      block = new metaScore.Player.Block(page.parents().parents().get(0));
    
    _page_panel.setPage(page, true);
    _block_panel.setBlock(block, true);
      
    evt.stopPropagation();
  };
  
  this.onElementPanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.addElement(metaScore.Dom.data(evt.target, 'type'));
        break;
        
      case 'delete':
        this.removePage();
        break;
    }
    
    evt.stopPropagation();
  };
  
  this.onElementClick = function(evt){
    _element_panel.setElement(evt.detail.element);
    
    evt.stopPropagation();
  };
  
  this.onPageClick = function(evt){
    _page_panel.setPage(evt.detail.page);
    _element_panel.unsetElement();
    
    evt.stopPropagation();
  };
  
  this.onBlockClick = function(evt){
    _block_panel.setBlock(evt.detail.block);
    
    evt.stopPropagation();
  };
  
  this.onPlayerClick = function(evt){
    _block_panel.unsetBlock();
    
    evt.stopPropagation();
  };
  
  this.onPageActivated = function(evt){
    var page = evt.detail.page;
    
    _page_panel.setPage(page);
  };
  
  this.onPlayerChildRemoved = function(evt){
    var element = evt.detail.child,
      block;
  
    if(metaScore.Dom.is(element, '.page')){
      block = new metaScore.Player.Block(evt.target.parentElement);
    
      if(block.getPageCount() === 0){
        this.addPage(block);
      }
      
      block.setActivePage(0);
    }
    else if(metaScore.Dom.is(element, '.metaScore-block')){
      block = _block_panel.getBlock();
      if(block && (element === block.get(0))){
        _block_panel.unsetBlock();
      }
    }
  };
  
  this.onHistoryAdd = function(evt){
    _mainmenu.enableItems('[data-action="undo"]');
    _mainmenu.disableItems('[data-action="redo"]');
  };
  
  this.onHistoryUndo = function(evt){
    if(_history.hasUndo()){
      _mainmenu.enableItems('[data-action="undo"]');
    }
    else{
      _mainmenu.disableItems('[data-action="undo"]');
    }
    
    _mainmenu.enableItems('[data-action="redo"]');
  };
  
  this.onHistoryRedo = function(evt){
    if(_history.hasRedo()){
      _mainmenu.enableItems('[data-action="redo"]');
    }
    else{
      _mainmenu.disableItems('[data-action="redo"]');
    }
    
    _mainmenu.enableItems('[data-action="undo"]');
  };
});