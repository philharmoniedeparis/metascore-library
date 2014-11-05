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
    this.h_ruler = new metaScore.Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this.workspace);
    this.v_ruler = new metaScore.Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this.workspace);
    this.mainmenu = new metaScore.editor.MainMenu().appendTo(this);     
    this.sidebar =  new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this);    
    this.block_panel = new metaScore.editor.panel.Block().appendTo(this.sidebar);
    this.page_panel = new metaScore.editor.panel.Page().appendTo(this.sidebar);
    this.element_panel = new metaScore.editor.panel.Element().appendTo(this.sidebar);
    this.player_wrapper = new metaScore.Dom('<iframe/>', {'class': 'player-wrapper'}).appendTo(this.workspace);
    this.player_head = new metaScore.Dom(this.player_wrapper.get(0).contentDocument.head);
    this.player_body = new metaScore.Dom(this.player_wrapper.get(0).contentDocument.body).addClass('metaScore-player-wrapper');
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
      .addDelegate('button[data-action]:not(.disabled)', 'click', metaScore.Function.proxy(this.onMainmenuClick, this))
      .addDelegate('.timefield', 'valuechange', metaScore.Function.proxy(this.onMainmenuTimeFieldChange, this));
    
    this.sidebar
      .addDelegate('.timefield', 'valuein', metaScore.Function.proxy(this.onTimeFieldIn, this))
      .addDelegate('.timefield', 'valueout', metaScore.Function.proxy(this.onTimeFieldOut, this));
    
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
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));
    
    this.player_body
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onPlayerTimeUpdate, this))
      .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
      .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivated, this));
      
    this.history
      .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
      .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
      .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
    this.block_panel.unsetComponent();
  }
  
  metaScore.Dom.extend(Editor);
  
  Editor.defaults = {
    'ajax': {}
  };
  
  Editor.prototype.setEditing = function(editing){
    metaScore.editing = editing;
    
    this.toggleClass('editing', editing);
    this.player_body.toggleClass('editing', editing);
  };
  
  Editor.prototype.onGuideLoadSuccess = function(xhr){  
    var data = JSON.parse(xhr.response);
    
    this.removePlayer();
    this.addPlayer(data);
    
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
  
  Editor.prototype.onKeydown = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        this.setEditing(!this.editToggle);
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
        this.setEditing(this.editToggle);
        break;
    }
  };
  
  Editor.prototype.onMainmenuClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        break;
      case 'open':
        new metaScore.editor.overlay.popup.GuideSelector({
          'url': this.configs.api_url +'guide.json',
          'selectCallback': metaScore.Function.proxy(this.openGuide, this),
          'autoShow': true
        })
        .show();
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
        this.editToggle = !this.editToggle;
        this.setEditing(this.editToggle);
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
    
    this.player.media.setCurrentTime(time);
  };
  
  Editor.prototype.onTimeFieldIn = function(evt){
    var field = evt.target._metaScore,
      time = this.player.media.getCurrentTime();
    
    field.setValue(time, true);
  };
  
  Editor.prototype.onTimeFieldOut = function(evt){
    var field = evt.target._metaScore,
      time = field.getValue();
    
    this.player.media.setCurrentTime(time);
  };
  
  Editor.prototype.onBlockSet = function(evt){
    var block = evt.detail.component;
    
    if(block instanceof metaScore.player.component.Block){
      this.page_panel.setComponent(block.getActivePage(), true);
      this.page_panel.getMenu().enableItems('[data-action="new"]');
      this.element_panel.getMenu().enableItems('[data-action="new"]');
    }    
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockUnset = function(evt){
    this.page_panel.unsetComponent();
    this.page_panel.getMenu().disableItems('[data-action="new"]');
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
    var block,
      dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){        
      case 'new':
        block = this.addBlock({'container': this.player_body});
            
        this.history.add({
          'undo': metaScore.Function.proxy(block.destroy, this),
          'redo': metaScore.Function.proxy(this.addBlock, this, [block])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getComponent();
        
        if(block){
          block.destroy();
          this.block_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addBlock, this, [block]),
            'redo': metaScore.Function.proxy(block.destroy, this)
          });
        }
        break;
        
      case 'previous':
        dom = new metaScore.Dom('.metaScore-block', this.player_body);
        count = dom.count();
        
        if(count > 0){
          index = dom.index('.selected') - 1;          
          if(index < 0){
            index = count - 1;
          }
          
          block = dom.get(index)._metaScore;
          
          this.block_panel.setComponent(block);
        }
        break;
        
      case 'next':
        dom = new metaScore.Dom('.metaScore-block', this.player_body);
        count = dom.count();
        
        if(count > 0){
          index = dom.index('.selected') + 1;          
          if(index >= count){
            index = 0;
          }
          
          block = dom.get(index)._metaScore;
          
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
    this.page_panel.getMenu().enableItems('[data-action="new"]');
    this.element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageUnset = function(evt){
    this.element_panel.unsetComponent();
    this.element_panel.getMenu().disableItems('[data-action="new"]');
  };
  
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    var block, page,
      dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        block = this.block_panel.getComponent();
        page = this.addPage(block);
            
        this.history.add({
          'undo': metaScore.Function.proxy(page.destroy, this),
          'redo': metaScore.Function.proxy(this.addPage, this, [block, page])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getComponent();
        page = this.page_panel.getComponent();
        
        if(page){
          page.destroy();
          this.page_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addPage, this, [block, page]),
            'redo': metaScore.Function.proxy(page.destroy, this)
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
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementPanelToolbarClick = function(evt){
    var page, element,
      dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        page = this.page_panel.getComponent();
        element = this.addElement(page, {'type': metaScore.Dom.data(evt.target, 'type')});
    
        this.element_panel.setComponent(element);
            
        this.history.add({
          'undo': metaScore.Function.proxy(element.destroy, this),
          'redo': metaScore.Function.proxy(this.addElement, this, [page, element])
        });
        break;
        
      case 'delete':
        page = this.page_panel.getComponent();
        element = this.element_panel.getComponent();
        
        if(element){
          element.destroy();
          this.element_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addElement, this, [page, element]),
            'redo': metaScore.Function.proxy(element.destroy, this)
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
    var currentTime = evt.detail.media.getCurrentTime();
    
    this.mainmenu.timefield.setValue(currentTime);
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
  
  Editor.prototype.addPlayerCSS = function(url){
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': url}).appendTo(this.player_head);
  };
  
  Editor.prototype.addPlayer = function(configs){  
    this.player = new metaScore.Player(metaScore.Object.extend({}, configs, {
      'container': this.player_body
    }));
  };
  
  Editor.prototype.removePlayer = function(){
    if(this.player){
      this.player.destroy(this.player_body);
    }
    
    delete this.player;
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
  
    this.loadmask = new metaScore.editor.overlay.Alert({
      'text': metaScore.String.t('Loading...'),
      'autoShow': true
    });
    
    options = metaScore.Object.extend({}, {
      'success': metaScore.Function.proxy(this.onGuideLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onGuideLoadError, this)
    }, this.configs.ajax);
  
    metaScore.Ajax.get(this.configs.api_url +'guide/'+ guide.id +'.json', options);
  };
  
  Editor.prototype.saveGuide = function(){
    var components = this.player.getComponents(this.player_body),
      id = this.player.id,
      options,
      data = {};
    
    metaScore.Array.each(components, function(index, component){
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
  
    this.loadmask = new metaScore.editor.overlay.Alert({
      'text': metaScore.String.t('Saving...'),
      'autoShow': true
    });
  
    metaScore.Ajax.put(this.configs.api_url +'guide/'+ id +'.json', options);    
  };
    
  return Editor;
  
})();