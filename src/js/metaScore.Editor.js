/**
* The main editor class
* @class Editor
* @namespace metaScore
* @extends metaScore.Dom
*/

metaScore.Editor = (function(){

  /**
   * @constructor
   * @param {Object} configs
   */
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
    
    this.mainmenu = new metaScore.editor.MainMenu().appendTo(this)
      .addDelegate('button[data-action]:not(.disabled)', 'click', metaScore.Function.proxy(this.onMainmenuClick, this))
      .addDelegate('.time', 'valuechange', metaScore.Function.proxy(this.onMainmenuTimeFieldChange, this))
      .addDelegate('.r-index', 'valuechange', metaScore.Function.proxy(this.onMainmenuRindexFieldChange, this));
      
    
    this.sidebar_wrapper = new metaScore.Dom('<div/>', {'class': 'sidebar-wrapper'}).appendTo(this)
      .addListener('resizestart', metaScore.Function.proxy(this.onSidebarResizeStart, this))
      .addListener('resize', metaScore.Function.proxy(this.onSidebarResize, this))
      .addListener('resizeend', metaScore.Function.proxy(this.onSidebarResizeEnd, this));
      
    new metaScore.Resizable({
      target: this.sidebar_wrapper,
      directions: ['left']
    });
    
    this.sidebar =  new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this.sidebar_wrapper);
    
    this.panels = {};
    
    this.panels.block = new metaScore.editor.panel.Block().appendTo(this.sidebar)
      .addListener('componentbeforeset', metaScore.Function.proxy(this.onBlockBeforeSet, this))
      .addListener('componentset', metaScore.Function.proxy(this.onBlockSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onBlockUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this));
      
    this.panels.block.getToolbar()
      .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onBlockPanelSelectorChange, this))
      .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));
        
    this.panels.page = new metaScore.editor.panel.Page().appendTo(this.sidebar)
      .addListener('componentbeforeset', metaScore.Function.proxy(this.onPageBeforeSet, this))
      .addListener('componentset', metaScore.Function.proxy(this.onPageSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onPageUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onPagePanelValueChange, this));
      
    this.panels.page.getToolbar()
      .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onPagePanelSelectorChange, this))
      .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));
        
    this.panels.element = new metaScore.editor.panel.Element().appendTo(this.sidebar)
      .addListener('componentbeforeset', metaScore.Function.proxy(this.onElementBeforeSet, this))
      .addListener('componentset', metaScore.Function.proxy(this.onElementSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onElementUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onElementPanelValueChange, this));
      
    this.panels.element.getToolbar()
      .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onElementPanelSelectorChange, this))
      .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));
        
    this.panels.text = new metaScore.editor.panel.Text().appendTo(this.sidebar);
    
    this.grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);
    this.version = new metaScore.Dom('<div/>', {'class': 'version', 'text': 'metaScore v.'+ metaScore.getVersion() +' r.'+ metaScore.getRevision()}).appendTo(this.workspace);
    
    this.player_frame = new metaScore.Dom('<iframe/>', {'class': 'player-frame'}).appendTo(this.workspace)
      .addListener('load', metaScore.Function.proxy(this.onPlayerFrameLoadSuccess, this))
      .addListener('error', metaScore.Function.proxy(this.onPlayerFrameLoadError, this));
    
    this.history = new metaScore.editor.History()
      .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
      .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
      .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));
      
    this.detailsOverlay = new metaScore.editor.overlay.GuideDetails({
        'submit_text': metaScore.Locale.t('editor.detailsOverlay.submit_text', 'Apply')
      })
      .addListener('show', metaScore.Function.proxy(this.onDetailsOverlayShow, this))
      .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this, ['update']));
      
    this.detailsOverlay.getField('type').readonly(true);

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
    metaScore.Dom.addListener(window, 'hashchange', metaScore.Function.proxy(this.onWindowHashChange, this));
    metaScore.Dom.addListener(window, 'beforeunload', metaScore.Function.proxy(this.onWindowBeforeUnload, this));

    this
      .addDelegate('.timefield', 'valuein', metaScore.Function.proxy(this.onTimeFieldIn, this))
      .addDelegate('.timefield', 'valueout', metaScore.Function.proxy(this.onTimeFieldOut, this))
      .updateMainmenu()
      .setEditing(false)
      .loadPlayerFromHash();
  }

  metaScore.Dom.extend(Editor);

  Editor.defaults = {
    'container': 'body',
    'player_url': '',
    'api_url': '',
    'ajax': {}
  };

  /**
   * Description
   * @method onGuideCreateSuccess
   * @param {} xhr
   * @return 
   */
  Editor.prototype.onGuideCreateSuccess = function(overlay, xhr){
    var json = JSON.parse(xhr.response);
  
    this.loadmask.hide();
    delete this.loadmask;
    
    overlay.hide();
      
    this.loadPlayer(json.id, json.vid);
  };

  /**
   * Description
   * @method onGuideCreateError
   * @param {} xhr
   * @return 
   */
  Editor.prototype.onGuideCreateError = function(xhr){
    this.loadmask.hide();
    delete this.loadmask;

    new metaScore.editor.overlay.Alert({
      'text': metaScore.Locale.t('editor.onGuideCreateError.msg', 'The following error occured:<br/><strong><em>@error (@code)</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
      'buttons': {
        'ok': metaScore.Locale.t('editor.onGuideCreateError.ok', 'OK'),
      },
      'autoShow': true
    });
  };

  /**
   * Description
   * @method onGuideSaveSuccess
   * @param {} xhr
   * @return 
   */
  Editor.prototype.onGuideSaveSuccess = function(xhr){
    var player = this.getPlayer(),
      json = JSON.parse(xhr.response);
  
    this.loadmask.hide();
    delete this.loadmask;
    
    if(json.id !== player.getId()){
      this.loadPlayer(json.id, json.vid);
    }
    else{    
      this.detailsOverlay
        .clearValues(true)
        .setValues(json, true);
        
      player.setRevision(json.vid);
    }
  };

  /**
   * Description
   * @method onGuideSaveError
   * @param {} xhr
   * @return 
   */
  Editor.prototype.onGuideSaveError = function(xhr){
    this.loadmask.hide();
    delete this.loadmask;

    new metaScore.editor.overlay.Alert({
      'text': metaScore.Locale.t('editor.onGuideSaveError.msg', 'The following error occured:<br/><strong><em>@error (@code)</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
      'buttons': {
        'ok': metaScore.Locale.t('editor.onGuideSaveError.ok', 'OK'),
      },
      'autoShow': true
    });
  };

  /**
   * Description
   * @method onGuideDeleteConfirm
   * @return 
   */
  Editor.prototype.onGuideDeleteConfirm = function(){
    var id = this.getPlayer().getId(),
      component,  options;

    options = metaScore.Object.extend({}, {
      'dataType': 'json',
      'method': 'DELETE',
      'success': metaScore.Function.proxy(this.onGuideDeleteSuccess, this),
      'error': metaScore.Function.proxy(this.onGuideDeleteError, this)
    }, this.configs.ajax);

    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });

    metaScore.Ajax.send(this.configs.api_url +'guide/'+ id +'.json', options);
  };

  /**
   * Description
   * @method onGuideDeleteSuccess
   * @param {} xhr
   * @return 
   */
  Editor.prototype.onGuideDeleteSuccess = function(xhr){
    this.removePlayer();

    this.loadmask.hide();
    delete this.loadmask;
  };

  /**
   * Description
   * @method onGuideDeleteError
   * @param {} xhr
   * @return 
   */
  Editor.prototype.onGuideDeleteError = function(xhr){
    this.loadmask.hide();
    delete this.loadmask;

    new metaScore.editor.overlay.Alert({
      'text': metaScore.Locale.t('editor.onGuideDeleteError.msg', 'The following error occured:<br/><strong><em>@error (@code)</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
      'buttons': {
        'ok': metaScore.Locale.t('editor.onGuideDeleteError.ok', 'OK'),
      },
      'autoShow': true
    });
  };

  /**
   * Description
   * @method onGuideRevertConfirm
   * @return 
   */
  Editor.prototype.onGuideRevertConfirm = function(){
    var player = this.getPlayer();
  
    this.loadPlayer(player.getId(), player.getRevision());
  };

  /**
   * Description
   * @method onGuideSelectorSelect
   * @param {Object} evt
   */
  Editor.prototype.onGuideSelectorSelect = function(evt){
    this.loadPlayer(evt.detail.guide.id, evt.detail.vid);
  };
  
  /**
    * Description
    * @method onKeydown
    * @param {} evt
    * @return 
    */
  Editor.prototype.onKeydown = function(evt){
    var player;
  
    switch(evt.keyCode){
      case 18: //alt
        if(!evt.repeat){
          this.setEditing(!this.persistentEditing, false);
          evt.preventDefault();
        }
        break;
        
      case 72: //h
        if(evt.ctrlKey){ // Ctrl+h
          player = this.getPlayer();
          if(player){
            player.addClass('show-contents');
          }
          evt.preventDefault();
        }
        break;
        
      case 90: //z
        if(evt.ctrlKey){ // Ctrl+z
          this.history.undo();
          evt.preventDefault();
        }
        break;
        
      case 89: //y
        if(evt.ctrlKey){ // Ctrl+y
          this.history.redo();
          evt.preventDefault();
        }
        break;
    }
  };
  
  /**
    * Description
    * @method onKeyup
    * @param {} evt
    * @return 
    */
   Editor.prototype.onKeyup = function(evt){
    var player;
    
    switch(evt.keyCode){
      case 18: //alt
        this.setEditing(this.persistentEditing, false);
        evt.preventDefault();
        break;
        
      case 72: //h
        if(evt.ctrlKey){ // Ctrl+h
          player = this.getPlayer();
          if(player){
            player.removeClass('show-contents');
          }
          evt.preventDefault();
        }
        break;
    }
  };

  /**
   * Description
   * @method onMainmenuClick
   * @param {} evt
   * @return 
   */
  Editor.prototype.onMainmenuClick = function(evt){  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        var callback = metaScore.Function.proxy(function(){      
          new metaScore.editor.overlay.GuideDetails({
              'autoShow': true
            })
            .addListener('show', metaScore.Function.proxy(this.onDetailsOverlayShow, this))
            .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this, ['create']));
        }, this);
      
        if(this.hasOwnProperty('player')){
          new metaScore.editor.overlay.Alert({
              'text': metaScore.Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide ?<br/><strong>Any unsaved data will be lost.</strong>'),
              'buttons': {
                'confirm': metaScore.Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                'cancel': metaScore.Locale.t('editor.onMainmenuClick.open.no', 'No')
              },
              'autoShow': true
            })
            .addListener('confirmclick', callback);
        }
        else{
          callback();
        }
        break;
      case 'open':
        if(this.hasOwnProperty('player')){
          new metaScore.editor.overlay.Alert({
              'text': metaScore.Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide ?<br/><strong>Any unsaved data will be lost.</strong>'),
              'buttons': {
                'confirm': metaScore.Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                'cancel': metaScore.Locale.t('editor.onMainmenuClick.open.no', 'No')
              },
              'autoShow': true
            })
            .addListener('confirmclick', metaScore.Function.proxy(this.openGuideSelector, this));
        }
        else{
          this.openGuideSelector();
        }
        break;
      case 'edit':
        this.detailsOverlay.show();
        break;
      case 'save-draft':
        this.saveGuide('update');
        break;
      case 'publish':
        this.saveGuide('update', true);
        break;
      case 'save-copy':
        this.saveGuide('duplicate');
        break;
      case 'download':
        break;
      case 'delete':
        new metaScore.editor.overlay.Alert({
            'text': metaScore.Locale.t('editor.onMainmenuClick.delete.msg', 'Are you sure you want to delete this guide ?'),
            'buttons': {
              'confirm': metaScore.Locale.t('editor.onMainmenuClick.delete.yes', 'Yes'),
              'cancel': metaScore.Locale.t('editor.onMainmenuClick.delete.no', 'No')
            },
            'autoShow': true
          })
          .addListener('confirmclick', metaScore.Function.proxy(this.onGuideDeleteConfirm, this));
        break;
      case 'revert':
        new metaScore.editor.overlay.Alert({
            'text': metaScore.Locale.t('editor.onMainmenuClick.revert.msg', 'Are you sure you want to revert back to the last saved version ?<br/><strong>Any unsaved data will be lost.</strong>'),
            'buttons': {
              'confirm': metaScore.Locale.t('editor.onMainmenuClick.revert.yes', 'Yes'),
              'cancel': metaScore.Locale.t('editor.onMainmenuClick.revert.no', 'No')
            },
            'autoShow': true
          })
          .addListener('confirmclick', metaScore.Function.proxy(this.onGuideRevertConfirm, this));
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
    }
  };

  /**
   * Description
   * @method onMainmenuTimeFieldChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onMainmenuTimeFieldChange = function(evt){
    var field = evt.target._metaScore,
      time = field.getValue();

    this.getPlayer().media.setTime(time);
  };

  /**
   * Description
   * @method onMainmenuRindexFieldChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onMainmenuRindexFieldChange = function(evt){
    var field = evt.target._metaScore,
      value = field.getValue();

    this.getPlayer().setReadingIndex(value, true);
  };

  /**
   * Description
   * @method onTimeFieldIn
   * @param {} evt
   * @return 
   */
  Editor.prototype.onTimeFieldIn = function(evt){
    var field = evt.target._metaScore,
      time = this.getPlayer().media.getTime();

    field.setValue(time);
  };

  /**
   * Description
   * @method onTimeFieldOut
   * @param {} evt
   * @return 
   */
  Editor.prototype.onTimeFieldOut = function(evt){
    var field = evt.target._metaScore,
      time = field.getValue();

    this.getPlayer().media.setTime(time);
  };

  /**
   * Description
   * @method onSidebarResizeStart
   * @param {} evt
   * @return 
   */
  Editor.prototype.onSidebarResizeStart = function(evt){
    this.addClass('sidebar-resizing');
  };

  /**
   * Description
   * @method onSidebarResize
   * @param {} evt
   * @return 
   */
  Editor.prototype.onSidebarResize = function(evt){
    var width = parseInt(this.sidebar_wrapper.css('width'), 10);
    
    this.workspace.css('right', width +'px');
  };

  /**
   * Description
   * @method onSidebarResizeEnd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onSidebarResizeEnd = function(evt){
    this.removeClass('sidebar-resizing');
  };

  /**
   * Description
   * @method onBlockBeforeSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockBeforeSet = function(evt){
    var block = evt.detail.component;
    
    this.panels.element.unsetComponent();
    this.panels.page.unsetComponent();
  };

  /**
   * Description
   * @method onBlockSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockSet = function(evt){
    var block = evt.detail.component;

    if(block.instanceOf('Block')){
      this.panels.page.getToolbar()
        .toggleMenuItem('new', true);
      
      this.panels.page.setComponent(block.getActivePage());

      this.panels.element.getToolbar()
        .toggleMenuItem('Cursor', true)
        .toggleMenuItem('Image', true)
        .toggleMenuItem('Text', true);
    }
    
    this.updatePageSelector();

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onBlockUnset
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockUnset = function(evt){
    this.panels.page.unsetComponent();
    this.panels.page.getToolbar().toggleMenuItem('new', false);
  };

  /**
   * Description
   * @method onBlockPanelValueChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockPanelValueChange = function(evt){
    var panel = this.panels.block,
      block = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;

    this.history.add({
      'undo': function(){
        panel.updateProperties(block, old_values);
      },
      'redo': function(){
        panel.updateProperties(block, new_values);
      }
    });
  };

  /**
   * Description
   * @method onBlockPanelToolbarClick
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockPanelToolbarClick = function(evt){
    var player, panel, block, page_configs,
      action = metaScore.Dom.data(evt.target, 'action');

    switch(action){
      case 'synched':
      case 'non-synched':
        player = this.getPlayer();
        panel = this.panels.block;
        block = player.addBlock({
          'name':  metaScore.Locale.t('editor.onBlockPanelToolbarClick.defaultBlockName', 'untitled'),
          'synched': action === 'synched'
        });
        
        page_configs = {};
        
        if(action === 'synched'){
          page_configs['start-time'] = 0;
          page_configs['end-time'] = this.getPlayer().getMedia().getDuration();
        }
        
        block.addPage(page_configs);
        
        panel.setComponent(block);

        this.history.add({
          'undo': function(){
            panel.unsetComponent();
            block.remove();
          },
          'redo': function(){
            player.addBlock(block);
            panel.setComponent(block);
          }
        });
        break;

      case 'delete':
        player = this.getPlayer();
        panel = this.panels.block;
        block = this.panels.block.getComponent();

        if(block){
          panel.unsetComponent();
          block.remove();

          this.history.add({
            'undo': function(){
              player.addBlock(block);
              panel.setComponent(block);
            },
            'redo': function(){
              panel.unsetComponent();
              block.remove();
            }
          });
        }
        break;
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onBlockPanelSelectorChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockPanelSelectorChange = function(evt){
    var id = evt.detail.value,
      dom;
      
    if(!id){
      this.panels.block.unsetComponent();
    }
    else{
      dom = this.getPlayer().getComponent('.media#'+ id +', .controller#'+ id +', .block#'+ id);
      
      if(dom && dom._metaScore){
        this.panels.block.setComponent(dom._metaScore);
      }
    }
  };

  /**
   * Description
   * @method onPageBeforeSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPageBeforeSet = function(evt){
    var page = evt.detail.component,
      block = page.getBlock();

    this.panels.element.unsetComponent();    
    this.panels.block.setComponent(block);
  };

  /**
   * Description
   * @method onPageSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPageSet = function(evt){
    var page = evt.detail.component,
      block = this.panels.block.getComponent(),
      index, previous_page, next_page,
      start_time_field = this.panels.page.getField('start-time'),
      end_time_field = this.panels.page.getField('end-time');

    this.panels.page.getToolbar().toggleMenuItem('new', true);

    this.panels.element
      .unsetComponent()
      .getToolbar()
        .toggleMenuItem('Cursor', true)
        .toggleMenuItem('Image', true)
        .toggleMenuItem('Text', true);
    
    if(block.getProperty('synched')){
      index = block.getActivePageIndex();
      previous_page = block.getPage(index-1);
      next_page = block.getPage(index+1);
      
      if(previous_page){
        start_time_field.readonly(false).enable().setMin(previous_page.getProperty('start-time'));
      }
      else{        
        start_time_field.readonly(true).enable();
      }
      
      if(next_page){
        end_time_field.readonly(false).enable().setMax(next_page.getProperty('end-time'));
      }
      else{        
        end_time_field.readonly(true).enable();
      }
    }
    else{
      start_time_field.disable();
      end_time_field.disable();
    }
      
    this.updateElementSelector();

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onPageUnset
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPageUnset = function(evt){
    this.panels.element
      .unsetComponent()
      .getToolbar()
        .toggleMenuItem('Cursor', false)
        .toggleMenuItem('Image', false)
        .toggleMenuItem('Text', false);
  };

  /**
   * Description
   * @method onPagePanelValueChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPagePanelValueChange = function(evt){
    var editor = this,
      panel = this.panels.page,
      page = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values,
      block, index, previous_page, next_page;
      
    if(('start-time' in new_values) || ('end-time' in new_values)){
      if((block = page.getBlock()) && block.getProperty('synched')){
        index = block.getActivePageIndex();
        previous_page = block.getPage(index-1);
        next_page = block.getPage(index+1);
    
        if(('start-time' in new_values) && previous_page){
          previous_page.setProperty('end-time', new_values['start-time']);
        }
        
        if(('end-time' in new_values) && next_page){
          next_page.setProperty('start-time', new_values['end-time']);
        }
      }
      
      editor.updateElementSelector();
    }

    this.history.add({
      'undo': function(){
        panel.updateProperties(page, old_values);
        
        if(('start-time' in new_values) || ('end-time' in new_values)){
          if(('start-time' in new_values) && previous_page){
            previous_page.setProperty('end-time', old_values['start-time']);
          }
          
          if(('end-time' in new_values) && next_page){
            next_page.setProperty('start-time', old_values['end-time']);
          }
      
          editor.updateElementSelector();
        }
      },
      'redo': function(){
        panel.updateProperties(page, new_values);
        
        if(('start-time' in new_values) || ('end-time' in new_values)){
          if(('start-time' in new_values) && previous_page){
            previous_page.setProperty('end-time', new_values['start-time']);
          }
          
          if(('end-time' in new_values) && next_page){
            next_page.setProperty('start-time', new_values['end-time']);
          }
      
          editor.updateElementSelector();
        }
      }
    });
  };

  /**
   * Description
   * @method onPagePanelToolbarClick
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    var panel, block, page, 
      start_time, end_time, configs,
      previous_page, auto_page, index,
      action = metaScore.Dom.data(evt.target, 'action');
    
    switch(action){
      case 'new':
        panel = this.panels.page;
        block = this.panels.block.getComponent();
        configs = {};
        
        if(block.getProperty('synched')){
          index = block.getActivePageIndex();
          previous_page = block.getPage(index);
          
          start_time = this.getPlayer().media.getTime();
          end_time = previous_page.getProperty('end-time');
        
          configs['start-time'] = start_time;
          configs['end-time'] = end_time;
          
          previous_page.setProperty('end-time', start_time);
        }
        
        page = block.addPage(configs, index+1);
        panel.setComponent(page);

        this.history.add({
          'undo': function(){
            panel.unsetComponent();
            block.removePage(page);
            
            if(block.getProperty('synched')){
              previous_page.setProperty('end-time', end_time);
            }
            
            block.setActivePage(index);
          },
          'redo': function(){
            if(block.getProperty('synched')){
              previous_page.setProperty('end-time', start_time);
            }
            
            block.addPage(page, index+1);
            panel.setComponent(page);
          }
        });
        break;

      case 'delete':
        panel = this.panels.page;
        block = this.panels.block.getComponent();
        page = panel.getComponent();
        index = block.getActivePageIndex();

        if(page){
          panel.unsetComponent();
          block.removePage(page);
          index--;
          
          if(block.getPageCount() < 1){
            configs = {};
            
            if(block.getProperty('synched')){
              configs['start-time'] = 0;
              configs['end-time'] = this.getPlayer().getMedia().getDuration();
            }
            
            auto_page = block.addPage(configs);
            panel.setComponent(auto_page);
          }
            
          block.setActivePage(Math.max(0, index));

          this.history.add({
            'undo': function(){
              if(auto_page){
                block.removePage(auto_page, true);
              }
              
              block.addPage(page);
              panel.setComponent(page);
            },
            'redo': function(){
              panel.unsetComponent();
              block.removePage(page, true);
              
              if(auto_page){
                block.addPage(auto_page);
                panel.setComponent(auto_page);
              }
              
              block.setActivePage(index);
            }
          });
        }
        break;
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onPagePanelSelectorChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPagePanelSelectorChange = function(evt){
    var block = this.panels.block.getComponent(),
      id, dom;
    
    if(block){
      id = evt.detail.value;
      dom = this.getPlayer().getComponent('.page#'+ id);
    
      if(dom && dom._metaScore){
        block.setActivePage(dom._metaScore);
      }
    }
  };

  /**
   * Description
   * @method onElementBeforeSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onElementBeforeSet = function(evt){
    var element = evt.detail.component,
      page = element.parents().get(0)._metaScore;

    this.panels.page.setComponent(page);
  };

  /**
   * Description
   * @method onElementSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onElementSet = function(evt){
    var element = evt.detail.component;

    if(element.getProperty('type') === 'Text'){
      this.panels.text.setComponent(element);
    }
    else{
      this.panels.text.unsetComponent();
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onElementUnset
   * @param {} evt
   * @return 
   */
  Editor.prototype.onElementUnset = function(evt){
    this.panels.text.unsetComponent();

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onElementPanelValueChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onElementPanelValueChange = function(evt){
    var editor = this,
      panel = this.panels.element,
      element = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
      
    if(('start-time' in new_values) || ('end-time' in new_values)){
      editor.updateElementSelector();
    }

    this.history.add({
      'undo': function(){
        panel.updateProperties(element, old_values);
      
        if(('start-time' in new_values) || ('end-time' in new_values)){
          editor.updateElementSelector();
        }
      },
      'redo': function(){
        panel.updateProperties(element, new_values);
      
        if(('start-time' in new_values) || ('end-time' in new_values)){
          editor.updateElementSelector();
        }
      }
    });
  };

  /**
   * Description
   * @method onElementPanelToolbarClick
   * @param {} evt
   * @return 
   */
  Editor.prototype.onElementPanelToolbarClick = function(evt){
    var panel, page, element,
      action = metaScore.Dom.data(evt.target, 'action');

    switch(action){
      case 'Cursor':
      case 'Image':
      case 'Text':
        panel = this.panels.element;
        page = this.panels.page.getComponent();
        element = page.addElement({'type': action, 'name':  metaScore.Locale.t('editor.onElementPanelToolbarClick.defaultElementName', 'untitled')});

        panel.setComponent(element);

        this.history.add({
          'undo': function(){
            panel.unsetComponent();
            element.remove();
          },
          'redo': function(){
            page.addElement(element);
            panel.setComponent(element);
          }
        });
        break;

      case 'delete':
        panel = this.panels.element;
        page = this.panels.page.getComponent();
        element = this.panels.element.getComponent();

        if(element){
          panel.unsetComponent();
          element.remove();

          this.history.add({
            'undo': function(){
              page.addElement(element);
              panel.setComponent(element);
            },
            'redo': function(){
              panel.unsetComponent();
              element.remove();
            }
          });
        }
        break;
    }
  };

  /**
   * Description
   * @method onElementPanelSelectorChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onElementPanelSelectorChange = function(evt){
    var id = evt.detail.value,
      dom;
      
    if(!id){
      this.panels.element.unsetComponent();
    }
    else{    
      dom = this.getPlayer().getComponent('.element#'+ id);
    
      if(dom && dom._metaScore){
        this.panels.element.setComponent(dom._metaScore);
      }
    }
  };

  /**
   * Description
   * @method onPlayerIdSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerIdSet = function(evt){
    var player = evt.detail.player;

    window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
  };

  /**
   * Description
   * @method onPlayerRevisionSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerRevisionSet = function(evt){
    var player = evt.detail.player;

    window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
  };

  /**
   * Description
   * @method onPlayerTimeUpdate
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerTimeUpdate = function(evt){
    var time = evt.detail.media.getTime();

    this.mainmenu.timefield.setValue(time, true);
  };

  /**
   * Description
   * @method onPlayerReadingIndex
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerReadingIndex = function(evt){
    var rindex = evt.detail.value;

    this.mainmenu.rindexfield.setValue(rindex, true);
  };

  /**
   * Description
   * @method onPlayerBlockAdd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerBlockAdd = function(evt){
    this.updateBlockSelector();
  };

  /**
   * Description
   * @method onPlayerChildRemove
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerChildRemove = function(evt){
    var child = evt.detail.child,
      component = child._metaScore;
  
    if(component){
      if(component.instanceOf('Block')){
        this.updateBlockSelector();
      }
      else if(component.instanceOf('Page')){
        this.updatePageSelector();
      }
      else if(component.instanceOf('Element')){
        this.updateElementSelector();
      }
    }
  };

  /**
   * Description
   * @method onPlayerFrameLoadSuccess
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerFrameLoadSuccess = function(evt){    
    this.player_frame.get(0).contentWindow.player
      .addListener('loadsuccess', metaScore.Function.proxy(this.onPlayerLoadSuccess, this))
      .addListener('loaderror', metaScore.Function.proxy(this.onPlayerLoadError, this))
      .addListener('idset', metaScore.Function.proxy(this.onPlayerIdSet, this))
      .addListener('revisionset', metaScore.Function.proxy(this.onPlayerRevisionSet, this));
  };

  /**
   * Description
   * @method onPlayerFrameLoadError
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerFrameLoadError = function(evt){
    this.loadmask.hide();
    delete this.loadmask;

    new metaScore.editor.overlay.Alert({
      'text': metaScore.Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
      'buttons': {
        'ok': metaScore.Locale.t('editor.onPlayerLoadError.ok', 'OK'),
      },
      'autoShow': true
    });
  };

  /**
   * Description
   * @method onPlayerLoadSuccess
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerLoadSuccess = function(evt){
    this.player = evt.detail.player
      .addClass('in-editor')
      .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
      .addDelegate('.metaScore-component.block', 'pageadd', metaScore.Function.proxy(this.onBlockPageAdd, this))
      .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivate, this))
      .addDelegate('.metaScore-component.page', 'elementadd', metaScore.Function.proxy(this.onPageElementAdd, this))
      .addListener('blockadd', metaScore.Function.proxy(this.onPlayerBlockAdd, this))
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this))
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onPlayerTimeUpdate, this))
      .addListener('rindex', metaScore.Function.proxy(this.onPlayerReadingIndex, this))
      .addListener('childremove', metaScore.Function.proxy(this.onPlayerChildRemove, this));
      
    new metaScore.Dom(this.player_frame.get(0).contentWindow.document.body)
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));

    this
      .setEditing(true)
      .updateMainmenu()
      .updateBlockSelector();
      
    this.mainmenu
      .rindexfield.setValue(0, true);
    
    this.detailsOverlay
      .clearValues(true)
      .setValues(this.player.getData(), true);

    this.loadmask.hide();
    delete this.loadmask;
  };

  /**
   * Description
   * @method onPlayerLoadError
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerLoadError = function(evt){
    this.loadmask.hide();
    delete this.loadmask;

    new metaScore.editor.overlay.Alert({
      'text': metaScore.Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
      'buttons': {
        'ok': metaScore.Locale.t('editor.onPlayerLoadError.ok', 'OK'),
      },
      'autoShow': true
    });
  };

  /**
   * Description
   * @method onComponentClick
   * @param {} evt
   * @param {} dom
   * @return 
   */
  Editor.prototype.onComponentClick = function(evt, dom){
    var component;

    if(metaScore.editing !== true){
      return;
    }

    component = dom._metaScore;

    if(component.instanceOf('Element')){
      this.panels.element.setComponent(component);
    }
    else if(component.instanceOf('Page')){
      this.panels.page.setComponent(component);
    }
    else{
      this.panels.block.setComponent(component);
    }
    
    evt.stopImmediatePropagation();
  };

  /**
   * Description
   * @method onPlayerClick
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerClick = function(evt){
    
    if(metaScore.editing !== true){
      return;
    }

    this.panels.block.unsetComponent();

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onBlockPageAdd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockPageAdd = function(evt){
    var block = evt.detail.block;
    
    if(block === this.panels.block.getComponent()){
      this.updatePageSelector();
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onBlockPageActivate
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockPageActivate = function(evt){
    var page, basis;
  
    if(metaScore.editing !== true){
      return;
    }
    
    page = evt.detail.page;
    basis = evt.detail.basis;

    if((basis !== 'pagecuepoint') || (page.getBlock() === this.panels.block.getComponent())){
      this.panels.page.setComponent(page);
    }
  };

  /**
   * Description
   * @method onPageElementAdd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPageElementAdd = function(evt){
    var page = evt.detail.page;
    
    if(page === this.panels.page.getComponent()){
      this.updateElementSelector();
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onHistoryAdd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onHistoryAdd = function(evt){
    this.updateMainmenu();
  };

  /**
   * Description
   * @method onHistoryUndo
   * @param {} evt
   * @return 
   */
  Editor.prototype.onHistoryUndo = function(evt){
    this.updateMainmenu();
  };

  /**
   * Description
   * @method onHistoryRedo
   * @param {} evt
   * @return 
   */
  Editor.prototype.onHistoryRedo = function(evt){
    this.updateMainmenu();
  };

  /**
   * Description
   * @method onDetailsOverlayShow
   * @param {} evt
   * @return 
   */
  Editor.prototype.onDetailsOverlayShow = function(evt){
    var player = this.getPlayer();
    
    if(player){
      player.getMedia().pause();
    }
  };

  /**
   * Description
   * @method onDetailsOverlaySubmit
   * @param {} evt
   * @return 
   */
  Editor.prototype.onDetailsOverlaySubmit = function(op, evt){
    var overlay = evt.detail.overlay,
      data = evt.detail.values,
      player, callback;
    
    switch(op){
      case 'create':
        this.createGuide(data, overlay);
        break;
        
      case 'update':
        player = this.getPlayer();
      
        callback = metaScore.Function.proxy(function(){          
          player.updateData(data);
          overlay.setValues(metaScore.Object.extend({}, player.getData(), data), true).hide();
        }, this);
      
        if('media' in data){
          this.getMediaFileDuration(data['media'].url, metaScore.Function.proxy(function(new_duration){
            var old_duration = player.getMedia().getDuration(),
              blocks = [], block, page;
          
            if(new_duration !== old_duration){
              if(new_duration < old_duration){                
                player.getComponents('.block').each(function(index, block_dom){
                  if(block_dom._metaScore){
                    block = block_dom._metaScore;
                    
                    if(block.getProperty('synched')){
                      block.getPages().each(function(index, page_dom){
                        if(page_dom._metaScore){
                          page = page_dom._metaScore;
                          
                          if(page.getProperty('start-time') < new_duration){
                            blocks.push(block.getProperty('name'));
                            return false;
                          }
                        }
                      });
                    }
                  }
                });
              }
              
              if(blocks.length > 0){
                new metaScore.editor.overlay.Alert({
                  'text': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.shorter.msg', 'The duration of selected media file (!new_duration centiseconds) is less than the current one (!old_duration centiseconds).<br/><strong>This will cause some pages of the following blocks to become out of reach: !blocks</strong><br/>Please modify the start time of those pages and try again.', {'!new_duration': new_duration, '!old_duration': old_duration, '!blocks': blocks.join(', ')}),
                  'buttons': {
                    'ok': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.shorter.ok', 'OK'),
                  },
                  'autoShow': true
                });
              }
              else{
                new metaScore.editor.overlay.Alert({
                  'text': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.msg', 'The duration of selected media file (!new_duration centiseconds) differs from the current one (!old_duration centiseconds).<br/><strong>This can cause pages and elements to become desynchronized.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': new_duration, '!old_duration': old_duration}),
                  'buttons': {
                    'confirm': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.yes', 'Yes'),
                    'cancel': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.no', 'No')
                  },
                  'autoShow': true
                })
                .addListener('confirmclick', callback);
              }
            }
            else{
              callback();
            }
          }, this));
        }
        else{
          callback();
        }
        break;
    }
  };

  /**
   * Description
   * @method onWindowHashChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onWindowHashChange = function(evt){
    if(this.hasOwnProperty('player')){
      new metaScore.editor.overlay.Alert({
          'text': metaScore.Locale.t('editor.onWindowHashChange.alert.msg', 'Are you sure you want to open another guide ?<br/><strong>Any unsaved data will be lost.</strong>'),
          'buttons': {
            'confirm': metaScore.Locale.t('editor.onWindowHashChange.alert.yes', 'Yes'),
            'cancel': metaScore.Locale.t('editor.onWindowHashChange.alert.no', 'No')
          },
          'autoShow': true
        })
        .addListener('confirmclick', metaScore.Function.proxy(function(new_duration){
          this.loadPlayerFromHash();
        }, this))
        .addListener('cancelclick', metaScore.Function.proxy(function(new_duration){
          window.history.replaceState(null, null, evt.oldURL);
        }, this));
    }
    else{
      this.loadPlayerFromHash();
    }
    
    evt.preventDefault();
  };

  /**
   * Description
   * @method onWindowBeforeUnload
   * @param {} evt
   * @return 
   */
  Editor.prototype.onWindowBeforeUnload = function(evt){  
    if(this.hasOwnProperty('player')){
      evt.returnValue = metaScore.Locale.t('editor.onWindowBeforeUnload.msg', 'Any unsaved data will be lost.');
    }
  };

  /**
   * Updates the editing state
   * @method setEditing
   * @param {Boolean} editing
   * @param {Boolean} sticky
   * @chainable
   */
  Editor.prototype.setEditing = function(editing, sticky){
    var player = this.getPlayer();
  
    metaScore.editing = editing !== false;

    if(sticky !== false){
      this.persistentEditing = metaScore.editing;
    }

    metaScore.Object.each(this.panels, function(key, panel){
      if(metaScore.editing){
        panel.enable();
      }
      else{
        panel.disable();
      }
    });

    this.toggleClass('editing', metaScore.editing);

    if(player){
      player.toggleClass('editing', metaScore.editing);
    }
    
    return this;
    
  };

  /**
   * Description
   * @method loadPlayerFromHash
   * @chainable
   */
  Editor.prototype.loadPlayerFromHash = function(){
    var hash, match;
    
    hash = window.location.hash;

    if(match = hash.match(/(#|&)guide=(\d+)(:(\d+))?/)){
      this.loadPlayer(match[2], match[4]);
    }
    
    return this;
  };

  /**
   * Description
   * @method updateMainmenu
   * @chainable 
   */
  Editor.prototype.updateMainmenu = function(){
    var hasPlayer = this.hasOwnProperty('player');

    this.mainmenu.toggleButton('edit', hasPlayer);
    this.mainmenu.toggleButton('save-draft', hasPlayer);
    this.mainmenu.toggleButton('publish', hasPlayer);
    this.mainmenu.toggleButton('save-copy', hasPlayer);
    this.mainmenu.toggleButton('delete', hasPlayer);
    //this.mainmenu.toggleButton('download', hasPlayer);

    this.mainmenu.toggleButton('undo', this.history.hasUndo());
    this.mainmenu.toggleButton('redo', this.history.hasRedo());
    this.mainmenu.toggleButton('revert', hasPlayer);
    
    return this;
  };

  /**
   * Description
   * @method updateBlockSelector
   * @chainable 
   */
  Editor.prototype.updateBlockSelector = function(){
    var toolbar = this.panels.block.getToolbar(),
      selector = toolbar.getSelector(),
      block, label;
  
    selector
      .clear()
      .addOption(null, '');
        
    this.getPlayer().getComponents('.media.video, .controller, .block').each(function(index, dom){
      if(dom._metaScore){
        block = dom._metaScore;
        
        if(block.instanceOf('Block')){
          if(block.getProperty('synched')){
            label = metaScore.Locale.t('editor.blockSelectorOptionLabelSynched', '!name (synched)', {'!name': block.getName()});
          }
          else{
            label = metaScore.Locale.t('editor.blockSelectorOptionLabelNotSynched', '!name (not synched)', {'!name': block.getName()});
          }
        }
        else{
          label = block.getName();
        }
        
        selector.addOption(block.getId(), label);
      }
    }, this);
    
    block = this.panels.block.getComponent();
    selector.setValue(block ? block.getId() : null, true);
    
    return this;
  };

  /**
   * Description
   * @method updatePageSelector
   * @chainable 
   */
  Editor.prototype.updatePageSelector = function(){
    var block = this.panels.block.getComponent(),
      page = this.panels.page.getComponent(),
      toolbar = this.panels.page.getToolbar(),
      selector = toolbar.getSelector();
  
    selector.clear();
  
    if(block.instanceOf('Block')){
      this.panels.block.getComponent().getPages().each(function(index, page){
        selector.addOption(page._metaScore.getId(), index+1);
      }, this);
    }
    
    selector.setValue(page ? page.getId() : null, true);
    
    return this;
  };

  /**
   * Description
   * @method updateElementSelector
   * @chainable 
   */
  Editor.prototype.updateElementSelector = function(){
    var block = this.panels.block.getComponent(),
      page = this.panels.page.getComponent(),
      toolbar = this.panels.element.getToolbar(),
      selector = toolbar.getSelector(),
      synched = block.getProperty('synched'),
      element, out_of_range,
      page_start_time, page_end_time,
      element_start_time, element_end_time,
      rindex, optgroups = {};
      
    // clear the selector
    selector.clear();
    
    // fill the list of optgroups
    if(page.instanceOf('Page')){    
      if(synched){
        page_start_time = page.getProperty('start-time');
        page_end_time = page.getProperty('end-time');
      }
      
      page.getElements().each(function(index, dom){
        element = dom._metaScore;
        out_of_range = false;
        
        if(synched){
          element_start_time = element.getProperty('start-time');
          element_end_time = element.getProperty('end-time');
          
          out_of_range = ((element_start_time !== null) && (element_start_time < page_start_time)) || ((element_end_time !== null) && (element_end_time > page_end_time));
        }
        
        rindex = element.getProperty('r-index') || 0;
        
        if(!(rindex in optgroups)){
          optgroups[rindex] = [];
        }
        
        optgroups[rindex].push({
          'element': element,
          'out_of_range': out_of_range
        });
      }, this);
    }
    
    // create the optgroups and their options
    metaScore.Array.each(Object.keys(optgroups).sort(), function(index, rindex){
      var options = optgroups[rindex],
        optgroup, sortFn = metaScore.Array.naturalSort(true);
        
      // sort options by element names
      options.sort(function(a, b){
        return sortFn(a.element.getName(), b.element.getName());
      });
    
      // create the optgroup
      optgroup = selector.addGroup(metaScore.Locale.t('editor.elementSelectorGroupLabel', 'Reading index !rindex', {'!rindex': rindex})).attr('data-rindex', rindex);
      
      // create the options
      metaScore.Array.each(options, function(index, option){      
        var element = option.element,
          out_of_range = option.out_of_range;
          
        selector
          .addOption(element.getId(), (out_of_range ? '*' : '') + element.getName(), optgroup)
          .toggleClass('out-of-range', out_of_range);
      }, this);
    }, this);
    
    element = this.panels.element.getComponent();
    
    selector.setValue(element ? element.getId() : null, true);
    
    return this;
  };

  /**
   * Description
   * @method getPlayer
   * @return MemberExpression
   */
  Editor.prototype.getPlayer = function(){  
    return this.player;  
  };

  /**
   * Description
   * @method loadPlayer
   * @param {} id
   * @chainable 
   */
  Editor.prototype.loadPlayer = function(id, vid){
    var src = this.configs.player_url + id;
    
    src += "?in-editor";
    
    if(vid){
      src += "&vid="+ vid;
    }
  
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });
    
    this.player_frame.attr('src', src);
    
    return this;
  };

  /**
   * Description
   * @method removePlayer
   * @chainable 
   */
  Editor.prototype.removePlayer = function(){    
    delete this.player;

    this.player_frame.attr('src', 'about:blank');
    this.panels.block.unsetComponent();
    this.updateMainmenu();
    
    return this;
  };

  /**
   * Description
   * @method openGuideSelector
   * @chainable 
   */
  Editor.prototype.openGuideSelector = function(){
    new metaScore.editor.overlay.GuideSelector({
        'url': this.configs.api_url +'guide.json',
        'autoShow': true
      })
      .addListener('select', metaScore.Function.proxy(this.onGuideSelectorSelect, this));
    
    return this;
  };

  /**
   * Description
   * @method createGuide
   * @chainable 
   */
  Editor.prototype.createGuide = function(details, overlay){
    var data = new FormData(),
      options;
    
    // append values from the details overlay
    metaScore.Object.each(details, function(key, value){
      if(key === 'thumbnail' || key === 'media'){
        data.append('files['+ key +']', value.object);
      }
      else{
        data.append(key, value);
      }
    });

    // prepare the Ajax options object
    options = metaScore.Object.extend({
      'data': data,
      'dataType': 'json',
      'success': metaScore.Function.proxy(this.onGuideCreateSuccess, this, [overlay]),
      'error': metaScore.Function.proxy(this.onGuideCreateError, this)
    }, this.configs.ajax);

    // add a loading mask
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'text': metaScore.Locale.t('editor.createGuide.LoadMask.text', 'Saving...'),
      'autoShow': true
    });

    metaScore.Ajax.post(this.configs.api_url +'guide.json', options);
    
    return this;
  };

  /**
   * Description
   * @method saveGuide
   * @chainable 
   */
  Editor.prototype.saveGuide = function(action, publish){
    var player = this.getPlayer(),
      id = player.getId(),
      vid = player.getRevision(),
      components = player.getComponents('.media, .controller, .block'),
      data = new FormData(),
      details = this.detailsOverlay.getValues(),
      blocks = [],
      component, options;
    
    // append the publish flag if true
    if(publish === true){
      data.append('publish', true);
    }
    
    // append values from the details overlay
    metaScore.Object.each(details, function(key, value){
      if(key === 'thumbnail' || key === 'media'){
        data.append('files['+ key +']', value.object);
      }
      else{
        data.append(key, value);
      }
    });

    // append blocks data
    components.each(function(index, dom){
      component = dom._metaScore;
    
      if(component.instanceOf('Media')){
        data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'media'}, component.getProperties())));
      }
      else if(component.instanceOf('Controller')){
        data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'controller'}, component.getProperties())));
      }
      else if(component.instanceOf('Block')){
        data.append('blocks[]', JSON.stringify(component.getProperties()));
      }
    }, this);

    // prepare the Ajax options object
    options = metaScore.Object.extend({
      'data': data,
      'dataType': 'json',
      'success': metaScore.Function.proxy(this.onGuideSaveSuccess, this),
      'error': metaScore.Function.proxy(this.onGuideSaveError, this)
    }, this.configs.ajax);

    // add a loading mask
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'text': metaScore.Locale.t('editor.saveGuide.LoadMask.text', 'Saving...'),
      'autoShow': true
    });

    metaScore.Ajax.post(this.configs.api_url +'guide/'+ id +'/'+ action +'.json?vid='+ vid, options);
    
    return this;
  };

  /**
   * Description
   * @method getMediaFileDuration
   */
  Editor.prototype.getMediaFileDuration = function(file, callback){  
    var media = new metaScore.Dom('<audio/>', {'src': file})
      .addListener('loadedmetadata', function(evt){
        var duration = parseFloat(media.get(0).duration) * 100;
        
        callback(duration);
      });
  };

  return Editor;

})();