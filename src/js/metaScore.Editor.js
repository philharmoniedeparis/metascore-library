/**
 * Editor
 *
 * @requires ../helpers/metaScore.Dom.js
 * @requires ../player/metaScore.Player.js
 * @requires metaScore.editor.MainMenu.js
 * @requires metaScore.editor.History.js
 * @requires panel/metaScore.editor.panel.Block.js
 * @requires panel/metaScore.editor.panel.Page.js
 * @requires panel/metaScore.editor.panel.Element.js
 * @requires panel/metaScore.editor.panel.Text.js
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
    this.h_ruler = new metaScore.Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this);
    this.v_ruler = new metaScore.Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this);
    this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);
    this.mainmenu = new metaScore.editor.MainMenu().appendTo(this);     
    this.sidebar =  new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this);    
    this.block_panel = new metaScore.editor.panel.Block().appendTo(this.sidebar);
    this.page_panel = new metaScore.editor.panel.Page().appendTo(this.sidebar);
    this.element_panel = new metaScore.editor.panel.Element().appendTo(this.sidebar);
    this.text_panel = new metaScore.editor.panel.Text().appendTo(this.sidebar);
    this.grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);
    this.version = new metaScore.Dom('<div/>', {'class': 'version', 'text': 'metaScore v.'+ metaScore.getVersion() +' r.'+ metaScore.getRevision()}).appendTo(this.workspace);
    this.history = new metaScore.editor.History();
      
    // add event listeners    
    this
      .addDelegate('.timefield', 'valuein', metaScore.Function.proxy(this.onTimeFieldIn, this))
      .addDelegate('.timefield', 'valueout', metaScore.Function.proxy(this.onTimeFieldOut, this));
      
    this.mainmenu
      .addDelegate('button[data-action]:not(.disabled)', 'click', metaScore.Function.proxy(this.onMainmenuClick, this))
      .addDelegate('.time', 'valuechange', metaScore.Function.proxy(this.onMainmenuTimeFieldChange, this))
      .addDelegate('.r-index', 'valuechange', metaScore.Function.proxy(this.onMainmenuRindexFieldChange, this));
    
    this.block_panel
      .addListener('componentset', metaScore.Function.proxy(this.onBlockSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onBlockUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));
    
    this.page_panel
      .addListener('componentset', metaScore.Function.proxy(this.onPageSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onPageUnset, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));
    
    this.element_panel
      .addListener('componentset', metaScore.Function.proxy(this.onElementSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onElementUnset, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));
      
    this.history
      .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
      .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
      .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
    this.block_panel.unsetComponent();
    
    metaScore.editing = false;
  }
  
  metaScore.Dom.extend(Editor);
  
  Editor.defaults = {
    'ajax': {}
  };
  
  Editor.prototype.setEditing = function(editing, sticky){
    if(sticky !== false){
      metaScore.editing = editing;
    }
    
    this.toggleClass('editing', editing);
    this.player.getBody().toggleClass('editing', editing);
  };
  
  Editor.prototype.onGuideLoadSuccess = function(xhr){  
    var data = JSON.parse(xhr.response);
    
    this.removePlayer();
    this.addPlayer(data);
    
    this.setEditing(true);
    
    this.loadmask.hide();
    delete this.loadmask;
  };
  
  Editor.prototype.onGuideLoadError = function(xhr){
  
  };
  
  Editor.prototype.onGuideSaveSuccess = function(xhr){
    this.loadmask.hide();
    delete this.loadmask;
  };
  
  Editor.prototype.onGuideSaveError = function(xhr){
  
  };
  
  Editor.prototype.onPlayerKeydown = Editor.prototype.onKeydown = function(evt){  
    switch(evt.keyCode){
      case 18: //alt
        if(!evt.repeat){
          this.setEditing(!metaScore.editing, false);
          evt.preventDefault();
        }
        break;
      case 90: //z
        if(evt.ctrlKey){
          this.history.undo();
          evt.preventDefault();
        }
        break;
      case 89: //y
        if(evt.ctrlKey){
          this.history.redo();
          evt.preventDefault();
        }
        break;
    }  
  };
  
  Editor.prototype.onPlayerKeyup = Editor.prototype.onKeyup = function(evt){    
    switch(evt.keyCode){
      case 18: //alt
        this.setEditing(metaScore.editing, false);
        evt.preventDefault();
        break;
    }
  };
  
  Editor.prototype.onMainmenuClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        break;
      case 'open':
        new metaScore.editor.overlay.GuideSelector({
          'url': this.configs.api_url +'guide.json',
          'selectCallback': metaScore.Function.proxy(this.openGuide, this),
          'autoShow': true
        });
        break;
      case 'edit':
        break;
      case 'save':
        this.saveGuide();
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
      case 'edit-toggle':
        this.setEditing(!metaScore.editing);
        break;
      case 'settings':
        break;
      case 'help':
        break;
    }
  };
  
  Editor.prototype.onMainmenuTimeFieldChange = function(evt){
    var field = evt.target._metaScore,
      time = field.getValue();
    
    this.player.media.setTime(time);
  };
  
  Editor.prototype.onMainmenuRindexFieldChange = function(evt){   
    var field = evt.target._metaScore,
      value = field.getValue();
      
    this.player.setReadingIndex(value, true);
  };
  
  Editor.prototype.onTimeFieldIn = function(evt){
    var field = evt.target._metaScore,
      time = this.player.media.getTime();
    
    field.setValue(time);
  };
  
  Editor.prototype.onTimeFieldOut = function(evt){
    var field = evt.target._metaScore,
      time = field.getValue();
    
    this.player.media.setTime(time);
  };
  
  Editor.prototype.onBlockSet = function(evt){
    var block = evt.detail.component;
    
    if(block instanceof metaScore.player.component.Block){
      this.page_panel.setComponent(block.getActivePage(), true);
      this.page_panel.toggleMenuItems('[data-action="new"]', true);
      this.element_panel.toggleMenuItems('[data-action="new"]', true);
    }    
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockUnset = function(evt){
    this.page_panel.unsetComponent();
    this.page_panel.toggleMenuItems('[data-action="new"]', false);
  };
  
  Editor.prototype.onBlockPanelValueChange = function(evt){
    var block = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
     
    this.history.add({
      'undo': metaScore.Function.proxy(this.block_panel.updateProperties, this.block_panel, [block, old_values]),
      'redo': metaScore.Function.proxy(this.block_panel.updateProperties, this.block_panel, [block, new_values])
    });
  };
  
  Editor.prototype.onBlockPanelToolbarClick = function(evt){
    var blocks, block, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){        
      case 'new':
        block = this.player.addBlock();
            
        this.history.add({
          'undo': metaScore.Function.proxy(block.remove, this),
          'redo': metaScore.Function.proxy(this.addBlock, this, [block])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getComponent();
        
        if(block){
          block.remove();
          this.block_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addBlock, this, [block]),
            'redo': metaScore.Function.proxy(block.remove, this)
          });
        }
        break;
        
      case 'previous':
        blocks = this.player.getComponents('block');
        count = blocks.count();
        
        if(count > 0){
          index = blocks.index('.selected') - 1;          
          if(index < 0){
            index = count - 1;
          }
          
          block = blocks.get(index)._metaScore;
          
          this.block_panel.setComponent(block);
        }
        break;
        
      case 'next':
        blocks = this.player.getComponents('block');
        count = blocks.count();
        
        if(count > 0){
          index = blocks.index('.selected') + 1;          
          if(index >= count){
            index = 0;
          }
          
          block = blocks.get(index)._metaScore;
          
          this.block_panel.setComponent(block);
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageSet = function(evt){
    var page = evt.detail.component,
      block = page.parents().parents().get(0)._metaScore;
    
    this.block_panel.setComponent(block, true);
    this.page_panel.toggleMenuItems('[data-action="new"]', true);
    this.element_panel.toggleMenuItems('[data-action="new"]', true);
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageUnset = function(evt){
    this.element_panel.unsetComponent();
    this.element_panel.toggleMenuItems('[data-action="new"]', false);
  };
  
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    var block, page, dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        block = this.block_panel.getComponent();
        page = this.addPage(block);
            
        this.history.add({
          'undo': metaScore.Function.proxy(page.remove, this),
          'redo': metaScore.Function.proxy(this.addPage, this, [block, page])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getComponent();
        page = this.page_panel.getComponent();
        
        if(page){
          block.removePage(page).remove();
          this.page_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addPage, this, [block, page]),
            'redo': metaScore.Function.proxy(page.remove, this)
          });
        }
        break;
        
      case 'previous':
        block = this.block_panel.getComponent();
        
        if(block){
          dom = new metaScore.Dom('.page', block);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') - 1;          
            if(index < 0){
              index = count - 1;
            }
            
            page = dom.get(index)._metaScore;
            
            block.setActivePage(page);
          }
        }
        break;
        
      case 'next':
        block = this.block_panel.getComponent();
        
        if(block){
          dom = new metaScore.Dom('.page', block);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') + 1;          
            if(index >= count){
              index = 0;
            }
            
            page = dom.get(index)._metaScore;
            
            block.setActivePage(page);
          }
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementSet = function(evt){
    var element = evt.detail.component,
      page = element.parents().get(0)._metaScore,
      block = page.parents().parents().get(0)._metaScore;
    
    this.page_panel.setComponent(page, true);
    this.block_panel.setComponent(block, true);
    
    if(element.getProperty('type') === 'Text'){
      this.text_panel.setComponent(element);
    }
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementUnset = function(evt){    
    this.text_panel.unsetComponent();
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementPanelToolbarClick = function(evt){
    var page, element, dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        page = this.page_panel.getComponent();
        element = this.addElement(page, {'type': metaScore.Dom.data(evt.target, 'type')});
                
        this.history.add({
          'undo': metaScore.Function.proxy(element.remove, this),
          'redo': metaScore.Function.proxy(this.addElement, this, [page, element])
        });
        break;
        
      case 'delete':
        page = this.page_panel.getComponent();
        element = this.element_panel.getComponent();
        
        if(element){
          element.remove();
          this.element_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addElement, this, [page, element]),
            'redo': metaScore.Function.proxy(element.remove, this)
          });
        }
        break;
        
      case 'previous':
        page = this.page_panel.getComponent();
        
        if(page){
          dom = new metaScore.Dom('.element', page);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') - 1;          
            if(index < 0){
              index = count - 1;
            }
            
            element = dom.get(index)._metaScore;
            
            this.element_panel.setComponent(element);
          }
        }
        break;
        
      case 'next':
        page = this.page_panel.getComponent();
        
        if(page){
          dom = new metaScore.Dom('.element', page);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') + 1;          
            if(index >= count){
              index = 0;
            }
            
            element = dom.get(index)._metaScore;
            
            this.element_panel.setComponent(element);
          }
        }
        break;
    }
  };
  
  Editor.prototype.onPlayerTimeUpdate = function(evt){
    var time = evt.detail.media.getTime();
    
    this.mainmenu.timefield.setValue(time, true);
  };
  
  Editor.prototype.onPlayerReadingIndex = function(evt){
    var rindex = evt.detail.value;
    
    this.mainmenu.rindexfield.setValue(rindex, true);
  };
  
  Editor.prototype.onComponentClick = function(evt, dom){  
    var component;
  
    if(metaScore.editing !== true){
      return;
    }
    
    component = dom._metaScore;
    
    if(component instanceof metaScore.player.component.Block){
      this.element_panel.unsetComponent();
      this.block_panel.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Controller){
      this.element_panel.unsetComponent();
      this.block_panel.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Media){
      this.element_panel.unsetComponent();
      this.block_panel.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Page){
      this.element_panel.unsetComponent();
      this.page_panel.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Element){
      this.element_panel.setComponent(component);
    }
  };
  
  Editor.prototype.onPlayerClick = function(evt){
    if(metaScore.editing !== true){
      return;
    }
    
    this.block_panel.unsetComponent();
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockPageActivated = function(evt){  
    if(metaScore.editing !== true){
      return;
    }
    
    this.page_panel.setComponent(evt.detail.page);
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
  
  Editor.prototype.addPlayer = function(configs){  
    this.player = new metaScore.Player(metaScore.Object.extend({}, configs, {
      container: this.workspace
    }));
      
    this.player.getBody()
      .addClass('in-editor')
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addListener('keydown', metaScore.Function.proxy(this.onPlayerKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onPlayerKeyup, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onPlayerTimeUpdate, this))
      .addListener('rindex', metaScore.Function.proxy(this.onPlayerReadingIndex, this))
      .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
      .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivated, this));
  };
  
  Editor.prototype.removePlayer = function(){
    if(this.player){
      this.player.remove();
      delete this.player;
    }
  };
  
  Editor.prototype.addBlock = function(block){
    if(!(block instanceof metaScore.player.component.Block)){
      block = this.player.addBlock(block);
    }

    this.block_panel.setComponent(block);
    
    return block;
  };
  
  Editor.prototype.addPage = function(block, page){
    if(!(page instanceof metaScore.player.component.Page)){
      page = block.addPage(page);
    }
    
    this.page_panel.setComponent(page);
    
    return page;
  };
  
  Editor.prototype.addElement = function(page, element){
    if(!(element instanceof metaScore.player.component.Element)){
      element = page.addElement(element);
    }
    
    this.element_panel.setComponent(element);
    
    return element;
  };
  
  Editor.prototype.openGuide = function(guide){
    var options;
  
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });
    
    options = metaScore.Object.extend({}, {
      'success': metaScore.Function.proxy(this.onGuideLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onGuideLoadError, this)
    }, this.configs.ajax);
  
    metaScore.Ajax.get(this.configs.api_url +'guide/'+ guide.id +'.json', options);
  };
  
  Editor.prototype.saveGuide = function(){
    var components = this.player.getComponents(),
      id = this.player.getId(),
      component,  options,
      data = {};
    
    components.each(function(index, dom){
      component = dom._metaScore;
      
      if(component instanceof metaScore.player.component.Media){
        data['media'] = component.getProperties();
      }      
      else if(component instanceof metaScore.player.component.Controller){        
        data['controller'] = component.getProperties();
      }      
      else if(component instanceof metaScore.player.component.Block){
        if(!('blocks' in data)){
          data['blocks'] = [];
        }
        
        data['blocks'].push(component.getProperties());
      }
    }, this);
    
    options = metaScore.Object.extend({}, {
      'data': JSON.stringify(data),
      'dataType': 'json',
      'success': metaScore.Function.proxy(this.onGuideSaveSuccess, this),
      'error': metaScore.Function.proxy(this.onGuideSaveError, this)
    }, this.configs.ajax);
  
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });
  
    metaScore.Ajax.put(this.configs.api_url +'guide/'+ id +'.json', options);    
  };
    
  return Editor;
  
})();