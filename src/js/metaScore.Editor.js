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
      
    this.detailsOverlay = new metaScore.editor.overlay.GuideInfo()
      .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this));

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
   
    new metaScore.Dom(window)
      .addListener('beforeunload', metaScore.Function.proxy(this.onBeforeUnload, this));

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
    'api_url': '',
    'ajax': {}
  };

  /**
   * Description
   * @method onGuideSaveSuccess
   * @param {} xhr
   * @return 
   */
  Editor.prototype.onGuideSaveSuccess = function(xhr){
    this.loadmask.hide();
    delete this.loadmask;
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
      'text': metaScore.Locale.t('editor.onGuideSaveError.msg', 'An error occured while trying to save the guide. Please try again.'),
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
      'text': metaScore.Locale.t('editor.onGuideDeleteError.msg', 'An error occured while trying to delete the guide. Please try again.'),
      'buttons': {
        'ok': metaScore.Locale.t('editor.onGuideSaveError.ok', 'OK'),
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
    this.addPlayer(this.getPlayer().getId());
  };

  /**
   * Description
   * @method onGuideSelectorSelect
   * @param {Object} evt
   */
  Editor.prototype.onGuideSelectorSelect = function(evt){
    this.addPlayer(evt.detail.guide.id);
  };
  
  /**
    * Description
    * @method onKeydown
    * @param {} evt
    * @return 
    */
   Editor.prototype.onKeydown = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        if(!evt.repeat){
          this.setEditing(!this.persistentEditing, false);
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
    switch(evt.keyCode){
      case 18: //alt
        this.setEditing(this.persistentEditing, false);
        evt.preventDefault();
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
      case 'save':
        this.saveGuide();
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
    var player, panel, blocks, block, count, index, page_configs,
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

      case 'previous':
        blocks = this.getPlayer().getComponents('.media.video, .controller, .block');
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
        blocks = this.getPlayer().getComponents('.media.video, .controller, .block');
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
      previous_page, auto_page,
      dom, count, index,
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
          
          if(block.getPageCount() < 1){
            configs = {};
            
            if(block.getProperty('synched')){
              configs['start-time'] = 0;
              configs['end-time'] = this.getPlayer().getMedia().getDuration();
            }
            
            auto_page = block.addPage(configs);
            panel.setComponent(auto_page);
          }
            
          block.setActivePage(index);

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
    var panel, page, element, dom, count, index,
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
      .addListener('loaderror', metaScore.Function.proxy(this.onPlayerLoadError, this));
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

    this
      .setEditing(true)
      .updateMainmenu()
      .updateBlockSelector();
      
    //this.detailsOverlay.setValues(data);
    this.mainmenu.rindexfield.setValue(0, true);

    window.history.replaceState(null, null, '#guide='+ this.player.getId());

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
   * @method onDetailsOverlaySubmit
   * @param {} evt
   * @return 
   */
  Editor.prototype.onDetailsOverlaySubmit = function(evt){
    var values = evt.detail.values;

    this.getPlayer().updateCSS(values.css);
  };

  /**
   * Description
   * @method onBeforeUnload
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBeforeUnload = function(evt){  
    if(this.hasOwnProperty('player')){
      evt.returnValue = metaScore.Locale.t('editor.onBeforeUnload.msg', 'Any unsaved data will be lost.');
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
    var match;

    if(match = window.location.hash.match(/(#|&)guide=(\d+)/)){
      this.addPlayer(match[2]);
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
    this.mainmenu.toggleButton('save', hasPlayer);
    this.mainmenu.toggleButton('delete', hasPlayer);
    this.mainmenu.toggleButton('download', hasPlayer);

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
    var block = this.panels.block.getComponent(),
      toolbar = this.panels.block.getToolbar();
  
    toolbar.emptySelector().addSelectorOption(null, '');
        
    this.getPlayer().getComponents('.media.video, .controller, .block').each(function(index, block){
      if(block._metaScore){
        toolbar.addSelectorOption(block._metaScore.getId(), block._metaScore.getName());
      }
    }, this);
    
    toolbar.setSelectorValue(block ? block.getId() : null, true);
    
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
      toolbar = this.panels.page.getToolbar();
  
    toolbar.emptySelector();
  
    if(block.instanceOf('Block')){
      this.panels.block.getComponent().getPages().each(function(index, page){
        toolbar.addSelectorOption(page._metaScore.getId(), index+1);
      }, this);
    }
    
    toolbar.setSelectorValue(page ? page.getId() : null, true);
    
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
      synched = block.getProperty('synched'),
      element, out_of_range,
      page_start_time, page_end_time,
      element_start_time, element_end_time;
      
    toolbar.emptySelector().addSelectorOption(null, '');
    
    if(synched){
      page_start_time = page.getProperty('start-time');
      page_end_time = page.getProperty('end-time');
    }
        
    if(page.instanceOf('Page')){
      page.getElements().each(function(index, dom){
        element = dom._metaScore;
        out_of_range = false;
        
        if(synched){
          element_start_time = element.getProperty('start-time');
          element_end_time = element.getProperty('end-time');
          
          out_of_range = ((element_start_time !== null) && (element_start_time < page_start_time)) || ((element_end_time !== null) && (element_end_time > page_end_time));
        }
        
        toolbar.addSelectorOption(element.getId(), (out_of_range ? '*' : '') + element.getName()).toggleClass('out-of-range', out_of_range);
      }, this);
    }
    
    element = this.panels.element.getComponent();
    
    toolbar.setSelectorValue(element ? element.getId() : null, true);
    
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
   * @method addPlayer
   * @param {} id
   * @chainable 
   */
  Editor.prototype.addPlayer = function(id){
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });
    
    this.player_frame.attr('src', 'http://metascore.localhost/player/'+ id);
    
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
   * @method saveGuide
   * @chainable 
   */
  Editor.prototype.saveGuide = function(){
    var player = this.getPlayer(),
      id = player.getId(),
      components = player.getComponents('.media, .controller, .block'),
      data = this.detailsOverlay.getValues(),
      component, options;
      
    data['blocks'] = [];

    components.each(function(index, dom){
      component = dom._metaScore;
    
      if(component.instanceOf('Media')){
        data['blocks'].push(metaScore.Object.extend({'type': 'media'}, component.getProperties()));
      }
      else if(component.instanceOf('Controller')){
        data['blocks'].push(metaScore.Object.extend({'type': 'controller'}, component.getProperties()));
      }
      else if(component.instanceOf('Block')){
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
    
    return this;
  };

  return Editor;

})();