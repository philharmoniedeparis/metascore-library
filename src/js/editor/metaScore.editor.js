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
metaScore.Editor = (function(){
  
  function Editor(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Editor.parent.call(this, '<div/>', {'class': 'metaScore-editor'});
    
    if(DEBUG){
      metaScore.Editor.instance = this;
    }
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    } 
  
    // add components    
    this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);      
    this.mainmenu = new metaScore.editor.MainMenu().appendTo(this);     
    this.sidebar =  new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this);    
    this.block_panel = new metaScore.editor.panel.Block().appendTo(this.sidebar);
    this.page_panel = new metaScore.editor.panel.Page().appendTo(this.sidebar);
    this.element_panel = new metaScore.editor.panel.Element().appendTo(this.sidebar);
    this.player_wrapper = new metaScore.Dom('<iframe/>', {'class': 'player-wrapper'}).appendTo(this.workspace);
    this.player_head = new metaScore.Dom(this.player_wrapper.get(0).contentDocument.head);
    this.player_body = new metaScore.Dom(this.player_wrapper.get(0).contentDocument.body).addClass('metaScore-player-wrapper');
    this.player = new metaScore.Player({'container': this.player_body});
    this.grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);
    this.history = new metaScore.editor.History();
    
    // add player style sheets    
    if(this.configs.palyer_css){
      metaScore.Array.each(this.configs.palyer_css, function(index, url) {
        this.addPlayerCSS(url);
      }, this);
    }
      
    // add event listeners    
    this.mainmenu
      .addDelegate('button[data-action]:not(.disabled)', 'click', metaScore.Function.proxy(this.onMainmenuClick, this));
    
    this.block_panel
      .addListener('blockset', metaScore.Function.proxy(this.onBlockSet, this))
      .addListener('blockunset', metaScore.Function.proxy(this.onBlockUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));
    
    this.page_panel
      .addListener('pageset', metaScore.Function.proxy(this.onPageSet, this))
      .addListener('pageunset', metaScore.Function.proxy(this.onPageUnset, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));
    
    this.element_panel
      .addListener('elementset', metaScore.Function.proxy(this.onElementSet, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));
    
    this.player_body
      .addDelegate('.element', 'elementclick', metaScore.Function.proxy(this.onElementClick, this))
      .addDelegate('.page', 'pageclick', metaScore.Function.proxy(this.onPageClick, this))
      .addDelegate('.metaScore-block', 'blockclick', metaScore.Function.proxy(this.onBlockClick, this))
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addDelegate('.metaScore-block', 'pageactivated', metaScore.Function.proxy(this.onPageActivated, this))
      .addListener('childremoved', metaScore.Function.proxy(this.onPlayerChildRemoved, this))
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
    this.player
      .addListener('blockadd', metaScore.Function.proxy(this.onBlockAdd, this))
      .addListener('blockremove', metaScore.Function.proxy(this.onBlockRemove, this))
      .addListener('pageadd', metaScore.Function.proxy(this.onPageAdd, this))
      .addListener('pageremove', metaScore.Function.proxy(this.onPageRemove, this))
      .addListener('elementadd', metaScore.Function.proxy(this.onElementAdd, this))
      .addListener('elementremove', metaScore.Function.proxy(this.onElementRemove, this));
      
    this.history
      .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
      .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
      .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
      
    this.block_panel.unsetBlock();
  }
  
  metaScore.Dom.extend(Editor);
  
  Editor.prototype.addPlayerCSS = function(url){
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': url}).appendTo(this.player_head);
  };
  
  Editor.prototype.openGuide = function(guide){    
    metaScore.Ajax.get(this.configs.api_url +'guide/'+ guide.id +'.json', {
      'success': metaScore.Function.proxy(this.onGuideLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onGuideLoadError, this)
    });
  };
  
  Editor.prototype.onGuideLoadSuccess = function(xhr){  
    var data = JSON.parse(xhr.response);
    
    data.container = this.player_body;
    
    this.player = new metaScore.Player(data);
  };
  
  Editor.prototype.onGuideLoadError = function(evt){
  
  };
  
  Editor.prototype.onKeydown = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        this.player_body.addClass('alt-down');
        break;
      case 90: //z
        if(evt.ctrlKey){
          this.history.undo();
        }
        break;
      case 89: //y
        if(evt.ctrlKey){
          this.history.redo();
        }
        break;
    }  
  };
  
  Editor.prototype.onKeyup = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        this.player_body.removeClass('alt-down');
        break;
    }
  };
  
  Editor.prototype.onMainmenuClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        break;
      case 'open':
        new metaScore.editor.popup.GuideSelector({
          url: this.configs.api_url +'guide.json',
          selectCallback: metaScore.Function.proxy(this.openGuide, this)
        })
        .show();
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
        this.history.undo();
        break;
      case 'redo':
        this.history.redo();
        break;
      case 'edit':
        break;
      case 'settings':
        break;
      case 'help':
        break;
    }
  };
  
  Editor.prototype.onBlockAdd = function(evt){
    var block = evt.detail.block;
    
    this.block_panel.setBlock(block);
        
    this.history.add({
      'undo': metaScore.Function.proxy(this.player.removeBlock, this, [block]),
      'redo': metaScore.Function.proxy(this.player.addBlock, this, [block])
    });
  };
  
  Editor.prototype.onBlockRemove = function(evt){
  };
  
  Editor.prototype.onBlockSet = function(evt){
    var block = evt.detail.block;
    
    this.page_panel.setPage(block.getActivePage(), true);
    this.page_panel.getMenu().enableItems('[data-action="new"]');
    this.element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockUnset = function(evt){
    this.page_panel.unsetPage();
    this.page_panel.getMenu().disableItems('[data-action="new"]');
  };
  
  Editor.prototype.onBlockPanelValueChange = function(evt){
    var block = evt.detail.block,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
     
    this.history.add({
      'undo': function(cmd){this.block_panel.updateBlockProperties(block, old_values);},
      'redo': function(cmd){this.block_panel.updateBlockProperties(block, new_values);}
    });
  };
  
  Editor.prototype.onBlockPanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.player.addBlock({'container': this.player_body});
        break;
        
      case 'delete':
        var block = this.block_panel.getBlock();
        if(block){
          this.player.removeBlock(block);
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageAdd = function(evt){
  };
  
  Editor.prototype.onPageRemove = function(evt){    
  };
  
  Editor.prototype.onPageSet = function(evt){
    var page = evt.detail.page,
      block = page.dom.parents().parents().get(0)._metaScore;
    
    this.block_panel.setBlock(block, true);
    this.page_panel.getMenu().enableItems('[data-action="new"]');
    this.element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageUnset = function(evt){
    this.element_panel.unsetElement();
    this.element_panel.getMenu().disableItems('[data-action="new"]');
  };
  
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.player.addPage(this.block_panel.getBlock());
        break;
        
      case 'delete':
        var page = this.page_panel.getPage();
        
        if(page){
          this.player.removePage(page);
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementAdd = function(evt){
    var element = evt.detail.element;
    
    this.element_panel.setElement(element);
  };
  
  Editor.prototype.onElementRemove = function(evt){    
  };
  
  Editor.prototype.onElementSet = function(evt){
    var element = evt.detail.element,
      page = element.dom.parents().get(0)._metaScore,
      block = page.dom.parents().parents().get(0)._metaScore;
    
    this.page_panel.setPage(page, true);
    this.block_panel.setBlock(block, true);
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementPanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        var page = this.page_panel.getPage();
        
        this.player.addElement(page, {'type': metaScore.Dom.data(evt.target, 'type')});
        break;
        
      case 'delete':
        var element = this.element_panel.getElement();
        
        if(element){
          this.player.removeElement(element);
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementClick = function(evt){
    this.element_panel.setElement(evt.detail.element);
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageClick = function(evt){
    this.page_panel.setPage(evt.detail.page);
    this.element_panel.unsetElement();
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockClick = function(evt){
    this.block_panel.setBlock(evt.detail.block);
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPlayerClick = function(evt){
    this.block_panel.unsetBlock();
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageActivated = function(evt){
    var page = evt.detail.page;
    
    this.page_panel.setPage(page);
  };
  
  Editor.prototype.onPlayerChildRemoved = function(evt){
    var element = evt.detail.child,
      block;
  
    if(metaScore.Dom.is(element, '.page')){
      block = evt.target.parentElement._metaScore;
    
      if(block.getPageCount() === 0){
        this.addPage(block);
      }
      
      block.setActivePage(0);
    }
    else if(metaScore.Dom.is(element, '.metaScore-block')){
      block = this.block_panel.getBlock();
      if(block && (element === block.get(0))){
        this.block_panel.unsetBlock();
      }
    }
  };
  
  Editor.prototype.onHistoryAdd = function(evt){
    this.mainmenu.enableItems('[data-action="undo"]');
    this.mainmenu.disableItems('[data-action="redo"]');
  };
  
  Editor.prototype.onHistoryUndo = function(evt){
    if(this.history.hasUndo()){
      this.mainmenu.enableItems('[data-action="undo"]');
    }
    else{
      this.mainmenu.disableItems('[data-action="undo"]');
    }
    
    this.mainmenu.enableItems('[data-action="redo"]');
  };
  
  Editor.prototype.onHistoryRedo = function(evt){
    if(this.history.hasRedo()){
      this.mainmenu.enableItems('[data-action="redo"]');
    }
    else{
      this.mainmenu.disableItems('[data-action="redo"]');
    }
    
    this.mainmenu.enableItems('[data-action="undo"]');
  };
    
  return Editor;
  
})();