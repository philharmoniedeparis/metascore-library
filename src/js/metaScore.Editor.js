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
    this.panels = {};
    this.panels.block = new metaScore.editor.panel.Block().appendTo(this.sidebar);
    this.panels.page = new metaScore.editor.panel.Page().appendTo(this.sidebar);
    this.panels.element = new metaScore.editor.panel.Element().appendTo(this.sidebar);
    this.panels.text = new metaScore.editor.panel.Text().appendTo(this.sidebar);
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
    
    this.panels.block
      .addListener('componentset', metaScore.Function.proxy(this.onBlockSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onBlockUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));
    
    this.panels.page
      .addListener('componentset', metaScore.Function.proxy(this.onPageSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onPageUnset, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));
    
    this.panels.element
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
    
    this.setEditing(false);
  }
  
  metaScore.Dom.extend(Editor);
  
  Editor.defaults = {
    'ajax': {}
  };
  
  Editor.prototype.setEditing = function(editing, sticky){
    if(sticky !== false){
      metaScore.editing = editing;
    }
    
    metaScore.Object.each(this.panels, function(key, panel){
      if(editing){
        panel.enable();
      }
      else{
        panel.disable();
      }
    });
    
    this.toggleClass('editing', editing);
    
    if(this.player){
      this.player.getBody().toggleClass('editing', editing);
    }
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
      this.panels.page.setComponent(block.getActivePage(), true);
      this.panels.page.toggleMenuItems('[data-action="new"]', true);
      this.panels.element.toggleMenuItems('[data-action="new"]', true);
    }    
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockUnset = function(evt){
    this.panels.page.unsetComponent();
    this.panels.page.toggleMenuItems('[data-action="new"]', false);
  };
  
  Editor.prototype.onBlockPanelValueChange = function(evt){
    var block = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
     
    this.history.add({
      'undo': metaScore.Function.proxy(this.panels.block.updateProperties, this.panels.block, [block, old_values]),
      'redo': metaScore.Function.proxy(this.panels.block.updateProperties, this.panels.block, [block, new_values])
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
        block = this.panels.block.getComponent();
        
        if(block){
          block.remove();
          this.panels.block.unsetComponent();
            
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
          
          this.panels.block.setComponent(block);
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
          
          this.panels.block.setComponent(block);
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageSet = function(evt){
    var page = evt.detail.component,
      block = page.parents().parents().get(0)._metaScore;
    
    this.panels.block.setComponent(block, true);
    this.panels.page.toggleMenuItems('[data-action="new"]', true);
    this.panels.element.toggleMenuItems('[data-action="new"]', true);
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageUnset = function(evt){
    this.panels.element.unsetComponent();
    this.panels.element.toggleMenuItems('[data-action="new"]', false);
  };
  
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    var block, page, dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        block = this.panels.block.getComponent();
        page = this.addPage(block);
            
        this.history.add({
          'undo': metaScore.Function.proxy(page.remove, this),
          'redo': metaScore.Function.proxy(this.addPage, this, [block, page])
        });
        break;
        
      case 'delete':
        block = this.panels.block.getComponent();
        page = this.panels.page.getComponent();
        
        if(page){
          block.removePage(page).remove();
          this.panels.page.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addPage, this, [block, page]),
            'redo': metaScore.Function.proxy(page.remove, this)
          });
        }
        break;
        
      case 'previous':
        block = this.panels.block.getComponent();
        
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
        block = this.panels.block.getComponent();
        
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
    
    this.panels.page.setComponent(page, true);
    this.panels.block.setComponent(block, true);
    
    if(element.getProperty('type') === 'Text'){
      this.panels.text.setComponent(element);
    }
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementUnset = function(evt){    
    this.panels.text.unsetComponent();
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementPanelToolbarClick = function(evt){
    var page, element, dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        page = this.panels.page.getComponent();
        element = this.addElement(page, {'type': metaScore.Dom.data(evt.target, 'type')});
                
        this.history.add({
          'undo': metaScore.Function.proxy(element.remove, this),
          'redo': metaScore.Function.proxy(this.addElement, this, [page, element])
        });
        break;
        
      case 'delete':
        page = this.panels.page.getComponent();
        element = this.panels.element.getComponent();
        
        if(element){
          element.remove();
          this.panels.element.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addElement, this, [page, element]),
            'redo': metaScore.Function.proxy(element.remove, this)
          });
        }
        break;
        
      case 'previous':
        page = this.panels.page.getComponent();
        
        if(page){
          dom = new metaScore.Dom('.element', page);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') - 1;          
            if(index < 0){
              index = count - 1;
            }
            
            element = dom.get(index)._metaScore;
            
            this.panels.element.setComponent(element);
          }
        }
        break;
        
      case 'next':
        page = this.panels.page.getComponent();
        
        if(page){
          dom = new metaScore.Dom('.element', page);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') + 1;          
            if(index >= count){
              index = 0;
            }
            
            element = dom.get(index)._metaScore;
            
            this.panels.element.setComponent(element);
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
  
  Editor.prototype.onPlayerLoadSuccess = function(evt){    
    this.setEditing(true);
    
    this.loadmask.hide();
    delete this.loadmask;
  };
  
  Editor.prototype.onPlayerLoadError = function(evt){
    this.loadmask.hide();
    delete this.loadmask;
  };
  
  Editor.prototype.onComponentClick = function(evt, dom){  
    var component;
  
    if(metaScore.editing !== true){
      return;
    }
    
    component = dom._metaScore;
    
    if(component instanceof metaScore.player.component.Block){
      this.panels.block.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Controller){
      this.panels.block.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Media){
      this.panels.block.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Page){
      this.panels.page.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Element){
      this.panels.element.setComponent(component);
    }
  };
  
  Editor.prototype.onPlayerClick = function(evt){
    if(metaScore.editing !== true){
      return;
    }
    
    this.panels.block.unsetComponent();
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockPageActivated = function(evt){  
    if(metaScore.editing !== true){
      return;
    }
    
    this.panels.page.setComponent(evt.detail.page);
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
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });
  
    this.player = new metaScore.Player(metaScore.Object.extend({}, configs, {
        container: this.workspace
      }))
      .addListener('rindex', metaScore.Function.proxy(this.onPlayerReadingIndex, this))
      .addListener('loadsuccess', metaScore.Function.proxy(this.onPlayerLoadSuccess, this))
      .addListener('loaderror', metaScore.Function.proxy(this.onPlayerLoadError, this));
      
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

    this.panels.block.setComponent(block);
    
    return block;
  };
  
  Editor.prototype.addPage = function(block, page){
    if(!(page instanceof metaScore.player.component.Page)){
      page = block.addPage(page);
    }
    
    this.panels.page.setComponent(page);
    
    return page;
  };
  
  Editor.prototype.addElement = function(page, element){
    if(!(element instanceof metaScore.player.component.Element)){
      element = page.addElement(element);
    }
    
    this.panels.element.setComponent(element);
    
    return element;
  };
  
  Editor.prototype.openGuide = function(guide){    
    this.removePlayer();
    
    this.addPlayer({
      'url': this.configs.api_url +'guide/'+ guide.id +'.json'
    });
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