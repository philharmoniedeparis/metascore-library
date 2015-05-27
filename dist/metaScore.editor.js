/*! metaScore - v0.0.2 - 2015-05-27 - Oussama Mubarak */
// These constants are used in the build process to enable or disable features in the
// compiled binary.  Here's how it works:  If you have a const defined like so:
//
//   const MY_FEATURE_IS_ENABLED = false;
//
// ...And the compiler (UglifyJS) sees this in your code:
//
//   if (MY_FEATURE_IS_ENABLED) {
//     doSomeStuff();
//   }
//
// ...Then the if statement (and everything in it) is removed - it is
// considered dead code.  If it's set to a truthy value:
//
//   const MY_FEATURE_IS_ENABLED = true;
//
// ...Then the compiler leaves the if (and everything in it) alone.
//
// If you add more consts here, you need to initialize them in metaScore.core.js
// to true.  So if you add:
//
//   const MY_FEATURE_IS_ENABLED = /* any value */;
//
// Then in metaScore.core.js you need to add:
//
//   if (typeof MY_AWESOME_FEATURE_IS_ENABLED === 'undefined') {
//     MY_FEATURE_IS_ENABLED = true;
//   }

if (typeof DEBUG === 'undefined') DEBUG = true;
;(function (global) {
"use strict";

var metaScore = global.metaScore;


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

    if(block instanceof metaScore.player.component.Block){
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
      if(component instanceof metaScore.player.component.Block){
        this.updateBlockSelector();
      }
      else if(component instanceof metaScore.player.component.Page){
        this.updatePageSelector();
      }
      else if(component instanceof metaScore.player.component.Element){
        this.updateElementSelector();
      }
    }
  };

  /**
   * Description
   * @method onPlayerLoadSuccess
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerLoadSuccess = function(evt){
    var data = evt.detail.data;

    this.player = evt.detail.player;    

    this.player
      .addListener('blockadd', metaScore.Function.proxy(this.onPlayerBlockAdd, this))    
      .getBody()
        .addClass('in-editor')
        .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
        .addDelegate('.metaScore-component.block', 'pageadd', metaScore.Function.proxy(this.onBlockPageAdd, this))
        .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivate, this))
        .addDelegate('.metaScore-component.page', 'elementadd', metaScore.Function.proxy(this.onPageElementAdd, this))
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
      
    this.detailsOverlay.setValues(data);
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

    if(component instanceof metaScore.player.component.Element){
      this.panels.element.setComponent(component);
    }
    else if(component instanceof metaScore.player.component.Page){
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
      player.getBody().toggleClass('editing', metaScore.editing);
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
  
    if(block instanceof metaScore.player.component.Block){
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
        
    if(page instanceof metaScore.player.component.Page){
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

    this.removePlayer();

    new metaScore.Player({
        container: this.workspace,
        url: this.configs.api_url +'guide/'+ id +'.json'
      })
      .addListener('loadsuccess', metaScore.Function.proxy(this.onPlayerLoadSuccess, this))
      .addListener('loaderror', metaScore.Function.proxy(this.onPlayerLoadError, this));
    
    return this;
  };

  /**
   * Description
   * @method removePlayer
   * @chainable 
   */
  Editor.prototype.removePlayer = function(){
    if(this.player){
      this.player.remove();
      delete this.player;
    }

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
    
      if(component instanceof metaScore.player.component.Media){
        data['blocks'].push(metaScore.Object.extend({'type': 'media'}, component.getProperties()));
      }
      else if(component instanceof metaScore.player.component.Controller){
        data['blocks'].push(metaScore.Object.extend({'type': 'controller'}, component.getProperties()));
      }
      else if(component instanceof metaScore.player.component.Block){
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
/**
* Description
* @class Button
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').Button = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Button(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<button/>');

    this.disabled = false;

    if(this.configs.label){
      this.setLabel(this.configs.label);
    }

    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }

  Button.defaults = {
    /**
    * A text to add as a label
    */
    label: null
  };

  metaScore.Dom.extend(Button);

  /**
   * Description
   * @method onClick
   * @param {} evt
   * @return 
   */
  Button.prototype.onClick = function(evt){
    if(this.disabled){
      evt.stopPropagation();
    }
  };

  /**
   * Description
   * @method setLabel
   * @param {} text
   * @return ThisExpression
   */
  Button.prototype.setLabel = function(text){
    if(this.label === undefined){
      this.label = new metaScore.Dom('<span/>', {'class': 'label'})
        .appendTo(this);
    }

    this.label.text(text);

    return this;
  };

  /**
   * Disable the button
   * @method disable
   * @return ThisExpression
   */
  Button.prototype.disable = function(){
    this.disabled = true;

    this.addClass('disabled');

    return this;
  };

  /**
   * Enable the button
   * @method enable
   * @return ThisExpression
   */
  Button.prototype.enable = function(){
    this.disabled = false;

    this.removeClass('disabled');

    return this;
  };

  return Button;

})();
/**
* Description
* @class DropDownMenu
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').DropDownMenu = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function DropDownMenu(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
  }

  metaScore.Dom.extend(DropDownMenu);

  /**
   * Description
   * @method addItem
   * @param {} action
   * @param {} label
   * @return item
   */
  DropDownMenu.prototype.addItem = function(action, label){
    var item = new metaScore.Dom('<li/>', {'data-action': action, 'text': label})
      .appendTo(this);

    return item;
  };

  /**
   * Description
   * @method toggleItem
   * @param {} action
   * @param {} state
   * @return ThisExpression
   */
  DropDownMenu.prototype.toggleItem = function(action, state){
    this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

    return this;
  };

  return DropDownMenu;

})();
/**
* Description
* @class Field
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').Field = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Field(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<div/>', {'class': 'field'});

    this.setupUI();

    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;

    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }

    if(this.configs.disabled){
      this.disable();
    }
    else{
      this.enable();
    }

    this.readonly(this.configs.readonly);
  }

  Field.defaults = {
    /**
    * Defines the default value
    */
    value: null,

    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,

    /**
    * Defines whether the field is readonly by default
    */
    readonly: false
  };

  metaScore.Dom.extend(Field);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  Field.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method onChange
   * @param {} evt
   * @return 
   */
  Field.prototype.onChange = function(evt){
    this.value = this.input.val();

    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  Field.prototype.setValue = function(value, supressEvent){
    this.input.val(value);
    this.value = value;

    if(supressEvent !== true){
      this.input.triggerEvent('change');
    }
  };

  /**
   * Description
   * @method getValue
   * @return MemberExpression
   */
  Field.prototype.getValue = function(){
    return this.value;
  };

  /**
   * Disable the field
   * @method disable
   * @return ThisExpression
   */
  Field.prototype.disable = function(){
    this.disabled = true;

    this.addClass('disabled');
    
    if(this.input){
      this.input.attr('disabled', 'disabled');
    }

    return this;
  };

  /**
   * Enable the field
   * @method enable
   * @return ThisExpression
   */
  Field.prototype.enable = function(){
    this.disabled = false;

    this.removeClass('disabled');
    
    if(this.input){
      this.input.attr('disabled', null);
    }

    return this;
  };

  /**
   * Toggle the readonly attribute of the field
   * @method readonly
   * @return ThisExpression
   */
  Field.prototype.readonly = function(readonly){
    this.is_readonly = readonly === true;

    this.toggleClass('readonly', this.is_readonly);
    
    if(this.input){
      this.input.attr('readonly', this.is_readonly ? "readonly" : null);
    }

    return this;
  };

  return Field;

})();
/**
* Description
* @class History
* @namespace metaScore.editor
* @extends metaScore.Evented
*/

metaScore.namespace('editor').History = (function(){

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function History(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    History.parent.call(this);

    this.commands = [];
    this.index = -1;
    this.executing = false;
  }

  History.defaults = {
    /**
    * Maximum number of commands to store
    */
    max_commands: 30
  };

  metaScore.Evented.extend(History);

  /**
   * Description
   * @method execute
   * @param {} command
   * @param {} action
   * @return ThisExpression
   */
  History.prototype.execute = function(command, action) {
    if (command && (action in command)) {
      this.executing = true;
      command[action](command);
      this.executing = false;
    }

    return this;
  };

  /**
   * Description
   * @method add
   * @param {} command
   * @return ThisExpression
   */
  History.prototype.add = function (command){
    if (this.executing) {
      return this;
    }

    // invalidate items higher on the stack
    this.commands.splice(this.index + 1, this.commands.length - this.index);

    // insert the new command
    this.commands.push(command);

    // remove old commands
    if(this.commands.length > this.configs.max_commands){
      this.commands = this.commands.slice(this.configs.max_commands * -1);
    }

    // update the index
    this.index = this.commands.length - 1;

    this.triggerEvent('add', {'command': command});

    return this;
  };

  /**
   * Description
   * @method undo
   * @return ThisExpression
   */
  History.prototype.undo = function() {
    var command = this.commands[this.index];

    if (!command) {
      return this;
    }

    // execute the command's undo
     this.execute(command, 'undo');

    // update the index
    this.index -= 1;

    this.triggerEvent('undo', {'command': command});

    return this;
  };

  /**
   * Description
   * @method redo
   * @return ThisExpression
   */
  History.prototype.redo = function() {
    var command = this.commands[this.index + 1];

    if (!command) {
      return this;
    }

    // execute the command's redo
    this.execute(command, 'redo');

    // update the index
    this.index += 1;

    this.triggerEvent('redo', {'command': command});

    return this;
  };

  /**
   * Description
   * @method clear
   * @return 
   */
  History.prototype.clear = function () {
    var length = this.commands.length;

    this.commands = [];
    this.index = -1;

    if(length > 0) {
      this.triggerEvent('clear');
    }

  };

  /**
   * Description
   * @method hasUndo
   * @return BinaryExpression
   */
  History.prototype.hasUndo = function(){
    return this.index !== -1;
  };

  /**
   * Description
   * @method hasRedo
   * @return BinaryExpression
   */
  History.prototype.hasRedo = function(){
    return this.index < (this.commands.length - 1);
  };

  return History;

})();
/**
* Description
* @class MainMenu
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').MainMenu = (function(){

  /**
   * Description
   * @constructor
   */
  function MainMenu() {
    // call parent constructor
    MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});

    this.setupUI();
  }

  metaScore.Dom.extend(MainMenu);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  MainMenu.prototype.setupUI = function(){

    var left, right;

    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);

    new metaScore.Dom('<div/>', {'class': 'logo-philharmonie'})
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.new', 'New')
      })
      .data('action', 'new')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.open', 'Open')
      })
      .data('action', 'open')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.edit', 'Edit')
      })
      .data('action', 'edit')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.save', 'Save')
      })
      .data('action', 'save')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.delete', 'Delete')
      })
      .data('action', 'delete')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.download', 'Download')
      })
      .data('action', 'download')
      .appendTo(left);

    this.timefield = new metaScore.editor.field.Time()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.time', 'Time')
      })
      .addClass('time')
      .appendTo(left);

    this.rindexfield = new metaScore.editor.field.Number({
        min: 0,
        max: 999
      })
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.r-index', 'Reading index')
      })
      .addClass('r-index')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.edit-toggle', 'Toggle edit mode')
      })
      .data('action', 'edit-toggle')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.revert', 'Revert')
      })
      .data('action', 'revert')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.undo', 'Undo')
      })
      .data('action', 'undo')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.redo', 'Redo')
      })
      .data('action', 'redo')
      .appendTo(left);


    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.settings', 'Settings')
      })
      .data('action', 'settings')
      .appendTo(right);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.help', 'Help')
      })
      .data('action', 'help')
      .appendTo(right);

  };

  /**
   * Description
   * @method toggleButton
   * @param {} action
   * @param {} state
   * @return ThisExpression
   */
  MainMenu.prototype.toggleButton = function(action, state){
    this.find('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

    return this;
  };

  return MainMenu;

})();
/**
* Description
* @class Overlay
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').Overlay = (function(){

  /**
   * Initialize
   * @constructor
   * @param {} configs
   */
  function Overlay(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});
    
    this.setupDOM();

    if(this.configs.autoShow){
      this.show();
    }
  }

  Overlay.defaults = {

    /**
    * The parent element in which the overlay will be appended
    */
    parent: '.metaScore-editor',

    /**
    * True to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
    */
    modal: true,

    /**
    * True to make this draggable
    */
    draggable: true,

    /**
    * True to show automatically
    */
    autoShow: false,

    /**
    * True to add a toolbar with title and close button
    */
    toolbar: false,

    /**
    * The overlay's title
    */
    title: ''
  };

  metaScore.Dom.extend(Overlay);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Overlay.prototype.setupDOM = function(){

    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }

    if(this.configs.toolbar){
      this.toolbar = new metaScore.editor.overlay.Toolbar({'title': this.configs.title})
        .appendTo(this);

      this.toolbar.addButton('close')
        .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
    }

    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);

    if(this.configs.draggable){
      this.draggable = new metaScore.Draggable({'target': this, 'handle': this.configs.toolbar ? this.toolbar : this});
    }
  
  };

  /**
   * Description
   * @method show
   * @return ThisExpression
   */
  Overlay.prototype.show = function(){
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }

    this.appendTo(this.configs.parent);

    return this;
  };

  /**
   * Description
   * @method hide
   * @return ThisExpression
   */
  Overlay.prototype.hide = function(){
    if(this.configs.modal){
      this.mask.remove();
    }

    this.remove();

    return this;
  };

  /**
   * Description
   * @method getToolbar
   * @return MemberExpression
   */
  Overlay.prototype.getToolbar = function(){
    return this.toolbar;
  };

  /**
   * Description
   * @method getContents
   * @return MemberExpression
   */
  Overlay.prototype.getContents = function(){
    return this.contents;
  };

  /**
   * Description
   * @method onCloseClick
   * @return 
   */
  Overlay.prototype.onCloseClick = function(){
    this.hide();
  };

  return Overlay;

})();
/**
* Description
* @class Panel
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').Panel = (function(){

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Panel(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Panel.parent.call(this, '<div/>', {'class': 'panel'});

    // fix event handlers scope
    this.onComponentDragStart = metaScore.Function.proxy(this.onComponentDragStart, this);
    this.onComponentDrag = metaScore.Function.proxy(this.onComponentDrag, this);
    this.onComponentDragEnd = metaScore.Function.proxy(this.onComponentDragEnd, this);
    this.onComponentResizeStart = metaScore.Function.proxy(this.onComponentResizeStart, this);
    this.onComponentResize = metaScore.Function.proxy(this.onComponentResize, this);
    this.onComponentResizeEnd = metaScore.Function.proxy(this.onComponentResizeEnd, this);

    this.toolbar = new metaScore.editor.panel.Toolbar(this.configs.toolbarConfigs)
      .appendTo(this);

    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));

    this.contents = new metaScore.Dom('<div/>', {'class': 'fields'})
      .appendTo(this);

    this
      .addDelegate('.fields .field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
      .unsetComponent();
  }

  Panel.defaults = {
    toolbarConfigs: {
      buttons: [
        'previous',
        'next'
      ]
    }
  };

  metaScore.Dom.extend(Panel);

  /**
   * Description
   * @method setupFields
   * @param {} properties
   * @return ThisExpression
   */
  Panel.prototype.setupFields = function(properties){
    var configs, fieldType, field;

    this.fields = {};
    this.contents.empty();

    metaScore.Object.each(properties, function(key, prop){
      if(prop.editable !== false){
        configs = prop.configs || {};

        field = new metaScore.editor.field[prop.type](configs)
          .data('name', key)
          .appendTo(this.contents);

        this.fields[key] = field;
      }
    }, this);

    return this;
  };

  /**
   * Description
   * @method getToolbar
   * @return MemberExpression
   */
  Panel.prototype.getToolbar = function(){
    return this.toolbar;
  };

  /**
   * Description
   * @method getField
   * @param {} key
   * @return MemberExpression
   */
  Panel.prototype.getField = function(key){
    if(key === undefined){
      return this.fields;
    }

    return this.fields[key];
  };

  /**
   * Description
   * @method enableFields
   * @return 
   */
  Panel.prototype.enableFields = function(){
    metaScore.Object.each(this.fields, function(key, field){
      field.enable();
    }, this);
  };

  /**
   * Description
   * @method showField
   * @param {} name
   * @return ThisExpression
   */
  Panel.prototype.showField = function(name){
    this.getField(name).show();
    
    return this;
  };

  /**
   * Description
   * @method hideField
   * @param {} name
   * @return ThisExpression
   */
  Panel.prototype.hideField = function(name){
    this.getField(name).hide();
    
    return this;
  };

  /**
   * Description
   * @method toggleState
   * @return ThisExpression
   */
  Panel.prototype.toggleState = function(){
    this.toggleClass('collapsed');
    
    return this;
  };

  /**
   * Description
   * @method disable
   * @return ThisExpression
   */
  Panel.prototype.disable = function(){
    this.addClass('disabled');
    
    return this;
  };

  /**
   * Description
   * @method enable
   * @return ThisExpression
   */
  Panel.prototype.enable = function(){
    this.removeClass('disabled');
    
    return this;
  };

  /**
   * Description
   * @method getComponent
   * @return MemberExpression
   */
  Panel.prototype.getComponent = function(){
    return this.component;
  };

  /**
   * Description
   * @method getDraggable
   * @return Literal
   */
  Panel.prototype.getDraggable = function(){
    return false;
  };

  /**
   * Description
   * @method getResizable
   * @return Literal
   */
  Panel.prototype.getResizable = function(){
    return false;
  };

  /**
   * Description
   * @method setComponent
   * @param {} component
   * @param {} supressEvent
   * @return ThisExpression
   */
  Panel.prototype.setComponent = function(component, supressEvent){
    var draggable, resizable;

    if(component !== this.getComponent()){
      if(!component){
        return this.unsetComponent();
      }
      
      this.unsetComponent(true);
      
      this.triggerEvent('componentbeforeset', {'component': component}, false);

      this.component = component;

      this
        .setupFields(this.component.configs.properties)
        .updateFieldValues(this.getValues(Object.keys(this.getField())), true)
        .updateDraggable()
        .updateResizable()
        .addClass('has-component')
        .getToolbar().setSelectorValue(component.getId(), true);

      if(!(component instanceof metaScore.player.component.Controller)){
        this.getToolbar().toggleMenuItem('delete', true);
      }

      component.addClass('selected');

      if(supressEvent !== true){
        this.triggerEvent('componentset', {'component': component}, false);
      }
    }

    return this;
  };

  /**
   * Description
   * @method unsetComponent
   * @param {} supressEvent
   * @return ThisExpression
   */
  Panel.prototype.unsetComponent = function(supressEvent){
    var component = this.getComponent();

    this
      .removeClass('has-component')
      .getToolbar().toggleMenuItem('delete', false);

    if(component){
      this
        .updateDraggable(false)
        .updateResizable(false)
        .getToolbar().setSelectorValue(null, true);

      component.removeClass('selected');

      delete this.component;

      if(supressEvent !== true){
        this.triggerEvent('componentunset', {'component': component}, false);
      }
    }

    return this;
  };

  /**
   * Description
   * @method updateDraggable
   * @param {} draggable
   * @return ThisExpression
   */
  Panel.prototype.updateDraggable = function(draggable){
    var component = this.getComponent();
      
    if(draggable === undefined){
      draggable = this.getDraggable();
    }
    
    if(draggable){
      if(!component._draggable){
        component._draggable = new metaScore.Draggable(draggable);
        component
          .addListener('dragstart', this.onComponentDragStart)
          .addListener('drag', this.onComponentDrag)
          .addListener('dragend', this.onComponentDragEnd);
      }
    }
    else if(component._draggable){
      component._draggable.destroy();
      delete component._draggable;
      
      component
        .removeListener('dragstart', this.onComponentDragStart)
        .removeListener('drag', this.onComponentDrag)
        .removeListener('dragend', this.onComponentDragEnd);
    }
    
    this.toggleFields(['x', 'y'], draggable);
    
    return this;
  };

  /**
   * Description
   * @method updateResizable
   * @param {} resizable
   * @return ThisExpression
   */
  Panel.prototype.updateResizable = function(resizable){
    var component = this.getComponent();
      
    if(resizable === undefined){
      resizable = this.getResizable();
    }
    
    if(resizable){
      if(!component._resizable){
        component._resizable = new metaScore.Resizable(resizable);
        component
          .addListener('resizestart', this.onComponentResizeStart)
          .addListener('resize', this.onComponentResize)
          .addListener('resizeend', this.onComponentResizeEnd);
      }
    }
    else if(component._resizable){
      component._resizable.destroy();
      delete component._resizable;
      
      component
        .removeListener('resizestart', this.onComponentResizeStart)
        .removeListener('resize', this.onComponentResize)
        .removeListener('resizeend', this.onComponentResizeEnd);
    }
    
    this.toggleFields(['width', 'height'], resizable);
    
    return this;
  };

  /**
   * Description
   * @method onComponentDragStart
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentDragStart = function(evt){
    var fields = ['x', 'y'];

    this._beforeDragValues = this.getValues(fields);
  };

  /**
   * Description
   * @method onComponentDrag
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentDrag = function(evt){
    var fields = ['x', 'y'];

    this.updateFieldValues(fields, true);
  };

  /**
   * Description
   * @method onComponentDragEnd
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentDragEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y'];

    this.updateFieldValues(fields, true);

    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);

    delete this._beforeDragValues;
  };

  /**
   * Description
   * @method onComponentResizeStart
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentResizeStart = function(evt){
    var fields = ['x', 'y', 'width', 'height'];

    this._beforeResizeValues = this.getValues(fields);
  };

  /**
   * Description
   * @method onComponentResize
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentResize = function(evt){
    var fields = ['x', 'y', 'width', 'height'];

    this.updateFieldValues(fields, true);
  };

  /**
   * Description
   * @method onComponentResizeEnd
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentResizeEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y', 'width', 'height'];

    this.updateFieldValues(fields, true);

    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);

    delete this._beforeResizeValues;
  };

  /**
   * Description
   * @method onFieldValueChange
   * @param {} evt
   * @return 
   */
  Panel.prototype.onFieldValueChange = function(evt){
    var component = this.getComponent(),
      name, value, old_values;

    if(!component){
      return;
    }

    name = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues([name]);

    component.setProperty(name, value);
    
    switch(name){
      case 'locked':
        this.updateDraggable();
        this.updateResizable();
        break;
        
      case 'name':
        this.getToolbar().updateSelectorOption(component.getId(), value);
        break;
        
      case 'start-time':
        this.getField('end-time').setMin(value);
        break;
        
      case 'end-time':
        this.getField('start-time').setMax(value);
        break;
    }

    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
  };

  /**
   * Description
   * @method updateFieldValue
   * @param {} name
   * @param {} value
   * @param {} supressEvent
   * @return ThisExpression
   */
  Panel.prototype.updateFieldValue = function(name, value, supressEvent){
    this.getField(name).setValue(value, supressEvent);
    
    return this;
  };

  /**
   * Description
   * @method updateFieldValues
   * @param {} values
   * @param {} supressEvent
   * @return ThisExpression
   */
  Panel.prototype.updateFieldValues = function(values, supressEvent){
    if(metaScore.Var.is(values, 'array')){
      metaScore.Array.each(values, function(index, field){
        this.updateFieldValue(field, this.getValue(field), supressEvent);
      }, this);
    }
    else{
      metaScore.Object.each(values, function(field, value){
        this.updateFieldValue(field, value, supressEvent);
      }, this);
    }

    return this;
  };

  /**
   * Description
   * @method updateProperties
   * @param {} component
   * @param {} values
   * @return ThisExpression
   */
  Panel.prototype.updateProperties = function(component, values){
    metaScore.Object.each(values, function(name, value){
      if(!this.getField(name).disabled){
        component.setProperty(name, value);
      }
    }, this);

    this.updateFieldValues(values, true);

    return this;
  };

  /**
   * Description
   * @method toggleFields
   * @param {} names
   * @param {} toggle
   * @return ThisExpression
   */
  Panel.prototype.toggleFields = function(names, toggle){
    var field;
  
    metaScore.Array.each(names, function(index, name){
      if(field = this.getField(name)){
        if(toggle){
          field.enable();
        }
        else{
          field.disable();
        }
      }
    }, this);

    return this;
  };

  /**
   * Description
   * @method getValue
   * @param {} name
   * @return CallExpression
   */
  Panel.prototype.getValue = function(name){
    return this.getComponent().getProperty(name);
  };

  /**
   * Description
   * @method getValues
   * @param {} fields
   * @return values
   */
  Panel.prototype.getValues = function(fields){
    var values = {};

    fields = fields || Object.keys(this.getField());

    metaScore.Array.each(fields, function(index, name){
      if(!this.getField(name).disabled){
        values[name] = this.getValue(name);
      }
    }, this);

    return values;
  };

  return Panel;

})();
/**
* Description
* @class Boolean
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Boolean = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function BooleanField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BooleanField.parent.call(this, this.configs);

    this.addClass('booleanfield');
    
    this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
  }

  BooleanField.defaults = {

    /**
    * Defines whether the field is checked by default
    */
    checked: false,

    /**
    * Defines the value when checked
    */
    checked_value: true,

    /**
    * Defines the value when unchecked
    */
    unchecked_value: false
  };

  metaScore.editor.Field.extend(BooleanField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  BooleanField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<input/>', {'type': 'checkbox', 'id': uid})
      .addListener('click', metaScore.Function.proxy(this.onClick, this))
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method onClick
   * @param {} evt
   * @return 
   */
  BooleanField.prototype.onClick = function(evt){
    if(this.is_readonly){
      evt.preventDefault();
    }
  };

  /**
   * Description
   * @method onChange
   * @param {} evt
   * @return 
   */
  BooleanField.prototype.onChange = function(evt){
    if(this.is_readonly){
      evt.preventDefault();
      return;
    }
    
    if(this.input.is(":checked")){
      this.value = this.configs.checked_value;
      this.addClass('checked');
    }
    else{
      this.value = this.configs.unchecked_value;
      this.removeClass('checked');
    }
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  BooleanField.prototype.setValue = function(value, supressEvent){
    this.input.get(0).checked = value === this.configs.checked_value;

    if(supressEvent !== true){
      this.input.triggerEvent('change');
    }
  };

  return BooleanField;

})();
/**
* Description
* @class BorderRadius
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').BorderRadius = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function BorderRadiusrField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BorderRadiusrField.parent.call(this, this.configs);

    this.addClass('borderradiusrfield');
  }

  metaScore.editor.Field.extend(BorderRadiusrField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  BorderRadiusrField.prototype.setupUI = function(){
    BorderRadiusrField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.overlay = new metaScore.editor.overlay.BorderRadius()
      .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  BorderRadiusrField.prototype.setValue = function(value, supressEvent){
    BorderRadiusrField.parent.prototype.setValue.call(this, value, supressEvent);

    this.input.attr('title', value);
  };

  /**
   * Description
   * @method onClick
   * @param {} evt
   * @return 
   */
  BorderRadiusrField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }

    this.overlay
      .setValue(this.value)
      .show();
  };

  /**
   * Description
   * @method onOverlaySubmit
   * @param {} evt
   * @return 
   */
  BorderRadiusrField.prototype.onOverlaySubmit = function(evt){
    var value = evt.detail.value,
      overlay = evt.detail.overlay;

    this.setValue(value);
  };

  /**
   * Description
   * @method onClearClick
   * @param {} evt
   * @return 
   */
  BorderRadiusrField.prototype.onClearClick = function(evt){
    this.setValue('0px');
  };

  return BorderRadiusrField;

})();
/**
* Description
* @class Buttons
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Buttons = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function ButtonsField(configs) {
    this.configs = this.getConfigs(configs);
    
    this.buttons = {};

    // fix event handlers scope
    this.onClick = metaScore.Function.proxy(this.onClick, this);

    // call parent constructor
    ButtonsField.parent.call(this, this.configs);

    this.addClass('buttonsfield');
  }

  ButtonsField.defaults = {
    buttons: {}
  };

  metaScore.editor.Field.extend(ButtonsField);

  /**
   * Description
   * @method setValue
   * @return 
   */
  ButtonsField.prototype.setValue = function(){
  };

  /**
   * Description
   * @method setupUI
   * @return 
   */
  ButtonsField.prototype.setupUI = function(){
    var field = this;

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    metaScore.Object.each(this.configs.buttons, function(key, attr){
      this.buttons[key] = new metaScore.Dom('<button/>', attr)
        .addListener('click', function(){
          field.triggerEvent('valuechange', {'field': field, 'value': key}, true, false);
        })
        .appendTo(this.input_wrapper);
    }, this);
  };
  
  /**
   * Description
   * @method getButtons
   * @return MemberExpression
   */
  ButtonsField.prototype.getButtons = function(){
    return this.buttons;
  };
  
  /**
   * Description
   * @method getButton
   * @param {} key
   * @return MemberExpression
   */
  ButtonsField.prototype.getButton = function(key){
    return this.buttons[key];
  };

  return ButtonsField;

})();
/**
* Description
* @class Color
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Color = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function ColorField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    ColorField.parent.call(this, this.configs);

    this.addClass('colorfield');
  }

  ColorField.defaults = {
    /**
    * Defines the default value
    */
    value: {
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }
  };

  metaScore.editor.Field.extend(ColorField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  ColorField.prototype.setupUI = function(){
    ColorField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this.input_wrapper);

    this.overlay = new metaScore.editor.overlay.ColorSelector()
      .addListener('select', metaScore.Function.proxy(this.onColorSelect, this));
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  ColorField.prototype.setValue = function(value, supressEvent){
    var rgba;
  
    this.value = value ? metaScore.Color.parse(value) : null;
    
    rgba = this.value ? 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')' : null;

    this.input
      .attr('title', rgba)
      .css('background-color', rgba);

    if(supressEvent !== true){
      this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
    }

  };

  /**
   * Description
   * @method onClick
   * @param {} evt
   * @return 
   */
  ColorField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }

    this.overlay
      .setValue(metaScore.Object.copy(this.value))
      .show();
  };

  /**
   * Description
   * @method onColorSelect
   * @param {} evt
   * @return 
   */
  ColorField.prototype.onColorSelect = function(evt){
    var value = evt.detail.value,
      overlay = evt.detail.overlay;

    this.setValue(value);
  };

  /**
   * Description
   * @method onClearClick
   * @param {} evt
   * @return 
   */
  ColorField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };

  return ColorField;

})();
/**
* Description
* @class Image
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Image = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function ImageField(configs) {
    this.configs = this.getConfigs(configs);

    // fix event handlers scope
    this.onFileSelect = metaScore.Function.proxy(this.onFileSelect, this);

    // call parent constructor
    ImageField.parent.call(this, this.configs);

    this.addClass('imagefield');
  }

  ImageField.defaults = {
    /**
    * Defines the placeholder
    */
    placeholder: metaScore.Locale.t('editor.field.Image.placeholder', 'Browse...')
  };

  metaScore.editor.Field.extend(ImageField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  ImageField.prototype.setupUI = function(){
    ImageField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .attr('placeholder', this.configs.placeholder)
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  ImageField.prototype.setValue = function(value, supressEvent){
    ImageField.parent.prototype.setValue.call(this, value, supressEvent);

    this.input.attr('title', value);
  };

  /**
   * Description
   * @method onClick
   * @param {} evt
   * @return 
   */
  ImageField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }
    
    this.triggerEvent('filebrowser', {'callback': this.onFileSelect}, true, false);
  };

  /**
   * Description
   * @method onClearClick
   * @param {} evt
   * @return 
   */
  ImageField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };

  /**
   * Description
   * @method onFileSelect
   * @param {} url
   * @return 
   */
  ImageField.prototype.onFileSelect = function(url){
    this.setValue(url);
  };

  return ImageField;

})();
/**
* Description
* @class Number
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Number = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function NumberField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    NumberField.parent.call(this, this.configs);

    this.addClass('numberfield');
  }

  NumberField.defaults = {
    /**
    * Defines the default value
    */
    value: 0,

    /**
    * Defines the minimum value allowed
    */
    min: null,

    /**
    * Defines the maximum value allowed
    */
    max: null
  };

  metaScore.editor.Field.extend(NumberField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  NumberField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<input/>', {'type': 'number', 'id': uid, 'min': this.configs.min, 'max': this.configs.max, 'step': this.configs.step})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);
  };

  return NumberField;

})();
/**
* Description
* @class Select
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Select = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function SelectField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    SelectField.parent.call(this, this.configs);

    this.addClass('selectfield');
  }

  SelectField.defaults = {
    /**
    * Defines the maximum value allowed
    */
    options: {}
  };

  metaScore.editor.Field.extend(SelectField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  SelectField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<select/>', {'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);

      metaScore.Object.each(this.configs.options, function(key, value){
        this.addOption(key, value);
      }, this);
  };

  /**
   * Description
   * @method addOption
   * @param {} value
   * @param {} text
   * @chainable
   */
  SelectField.prototype.addOption = function(value, text){
    var option = new metaScore.Dom('<option/>', {'value': value, 'text': text});
    
    this.input.append(option);

    return option;
  };

  /**
   * Description
   * @method updateOption
   * @param {} value
   * @param {} text
   * @chainable
   */
  SelectField.prototype.updateOption = function(value, text, attr){
    var option = this.input.child('option[value="'+ value +'"]');
    
    option.text(text);

    return option;
  };

  /**
   * Description
   * @method removeOption
   * @param {} value
   * @chainable
   */
  SelectField.prototype.removeOption = function(value){
    var option = this.input.child('option[value="'+ value +'"]');
    
    option.remove();

    return option;
  };

  /**
   * Description
   * @method removeOptions
   * @return ThisExpression
   */
  SelectField.prototype.removeOptions = function(){
    this.input.empty();

    return this;
  };

  return SelectField;

})();
/**
* Description
* @class Text
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Text = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function TextField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    TextField.parent.call(this, this.configs);

    this.addClass('textfield');
  }

  TextField.defaults = {
    /**
    * Defines the default value
    */
    value: ''
  };

  metaScore.editor.Field.extend(TextField);

  return TextField;

})();
/**
* Description
* @class Textarea
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Textarea = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function TextareaField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    TextareaField.parent.call(this, this.configs);

    this.addClass('textareafield');
  }

  TextareaField.defaults = {
    /**
    * Defines the default value
    */
    value: ''
  };

  metaScore.editor.Field.extend(TextareaField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  TextareaField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<textarea/>', {'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);
  };

  return TextareaField;

})();
/**
* Description
* @class Time
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Time = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function TimeField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    TimeField.parent.call(this, this.configs);

    this.addClass('timefield');
  }

  TimeField.defaults = {
    /**
    * Defines the default value
    */
    value: 0,

    /**
    * Defines the minimum value allowed
    */
    min: 0,

    /**
    * Defines the maximum value allowed
    */
    max: null,

    checkbox: false,

    inButton: false,

    outButton: false
  };

  metaScore.editor.Field.extend(TimeField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  TimeField.prototype.setupUI = function(){
    var buttons;

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    if(this.configs.checkbox){
      this.checkbox = new metaScore.Dom('<input/>', {'type': 'checkbox'})
        .addListener('change', metaScore.Function.proxy(this.onInput, this))
        .appendTo(this.input_wrapper);
     }

    this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this.input_wrapper);

    this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this.input_wrapper);

    this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'})
      .appendTo(this.input_wrapper);

    this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this.input_wrapper);

    if(this.configs.inButton || this.configs.outButton){
      buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
        .appendTo(this.input_wrapper);

      if(this.configs.inButton){
        this.in = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'in'})
          .addListener('click', metaScore.Function.proxy(this.onInClick, this))
          .appendTo(buttons);
      }

      if(this.configs.outButton){
        this.out = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'out'})
          .addListener('click', metaScore.Function.proxy(this.onOutClick, this))
          .appendTo(buttons);
      }
    }

    this.addListener('change', metaScore.Function.proxy(this.onChange, this));

  };

  /**
   * Description
   * @method onChange
   * @param {} evt
   * @return 
   */
  TimeField.prototype.onChange = function(evt){
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  /**
   * Description
   * @method onInput
   * @param {} evt
   * @return 
   */
  TimeField.prototype.onInput = function(evt){
    var active = this.isActive(),
      centiseconds_val, seconds_val, minutes_val, hours_val;

    if(active){
      centiseconds_val = parseInt(this.centiseconds.val(), 10) || 0;
      seconds_val = parseInt(this.seconds.val(), 10) || 0;
      minutes_val = parseInt(this.minutes.val(), 10) || 0;
      hours_val = parseInt(this.hours.val(), 10) || 0;

      this.setValue(centiseconds_val + (seconds_val * 100) + (minutes_val * 6000) + (hours_val * 360000));
    }
    else{
      this.setValue(null);
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onInClick
   * @param {} evt
   * @return 
   */
  TimeField.prototype.onInClick = function(evt){
    this.triggerEvent('valuein');
  };

  /**
   * Description
   * @method onOutClick
   * @param {} evt
   * @return 
   */
  TimeField.prototype.onOutClick = function(evt){
    this.triggerEvent('valueout');
  };

  /**
   * Description
   * @method setValue
   * @param {} centiseconds
   * @param {} supressEvent
   * @return 
   */
  TimeField.prototype.setValue = function(centiseconds, supressEvent){
    var centiseconds_val, seconds_val, minutes_val, hours_val;

    centiseconds = parseFloat(centiseconds);

    if(isNaN(centiseconds)){
      this.value = null;

      this.centiseconds.val(0);
      this.seconds.val(0);
      this.minutes.val(0);
      this.hours.val(0);

      if(!this.disabled){
        this.hours.attr('disabled', 'disabled');
        this.minutes.attr('disabled', 'disabled');
        this.seconds.attr('disabled', 'disabled');
        this.centiseconds.attr('disabled', 'disabled');

        if(this.in){
          this.in.attr('disabled', 'disabled');
        }
        if(this.out){
          this.out.attr('disabled', 'disabled');
        }
      }

      if(this.checkbox){
        this.checkbox.attr('checked', null);
      }
    }
    else{
      this.value = Math.floor(centiseconds);

      if(this.configs.min !== null){
        this.value = Math.max(this.value, this.configs.min);
      }
      if(this.configs.max !== null){
        this.value = Math.min(this.value, this.configs.max);
      }

      centiseconds_val = parseInt((this.value) % 100, 10) || 0;
      seconds_val = parseInt((this.value / 100) % 60, 10) || 0;
      minutes_val = parseInt((this.value / 6000) % 60, 10) || 0;
      hours_val = parseInt((this.value / 360000), 10) || 0;

      if(!this.disabled){
        this.hours.attr('disabled', null);
        this.minutes.attr('disabled', null);
        this.seconds.attr('disabled', null);
        this.centiseconds.attr('disabled', null);

        if(this.in){
          this.in.attr('disabled', null);
        }
        if(this.out){
          this.out.attr('disabled', null);
        }
      }

      this.centiseconds.val(centiseconds_val);
      this.seconds.val(seconds_val);
      this.minutes.val(minutes_val);
      this.hours.val(hours_val);

      if(this.checkbox){
        this.checkbox.attr('checked', 'checked');
      }
    }

    if(supressEvent !== true){
      this.triggerEvent('change');
    }
  };

  /**
   * Description
   * @method setMin
   * @param {} min
   * @return ThisExpression
   */
  TimeField.prototype.setMin = function(min){
    this.configs.min = min;
    
    if(this.getValue() < min){
      this.setValue(min);
    }
  
    return this;
  };

  /**
   * Description
   * @method setMax
   * @param {} max
   * @return ThisExpression
   */
  TimeField.prototype.setMax = function(max){
    this.configs.max = max;
    
    if(this.getValue() > max){
      this.setValue(max);
    }
  
    return this;
  };

  /**
   * Description
   * @method isActive
   * @return LogicalExpression
   */
  TimeField.prototype.isActive = function(){
    return !this.checkbox || this.checkbox.is(":checked");
  };

  /**
   * Disable the button
   * @method disable
   * @return ThisExpression
   */
  TimeField.prototype.disable = function(){
    this.disabled = true;

    if(this.checkbox){
      this.checkbox.attr('disabled', 'disabled');
    }

    this.hours.attr('disabled', 'disabled');
    this.minutes.attr('disabled', 'disabled');
    this.seconds.attr('disabled', 'disabled');
    this.centiseconds.attr('disabled', 'disabled');

    if(this.in){
      this.in.attr('disabled', 'disabled');
    }
    if(this.out){
      this.out.attr('disabled', 'disabled');
    }

    this.addClass('disabled');

    return this;
  };

  /**
   * Enable the button
   * @method enable
   * @return ThisExpression
   */
  TimeField.prototype.enable = function(){
    var active = this.isActive();

    this.disabled = false;

    if(this.checkbox){
      this.checkbox.attr('disabled', null);
    }

    this.hours.attr('disabled', active ? null : 'disabled');
    this.minutes.attr('disabled', active ? null : 'disabled');
    this.seconds.attr('disabled', active ? null : 'disabled');
    this.centiseconds.attr('disabled', active ? null : 'disabled');

    if(this.in){
      this.in.attr('disabled', active ? null : 'disabled');
    }
    if(this.out){
      this.out.attr('disabled', active ? null : 'disabled');
    }

    this.removeClass('disabled');

    return this;
  };

  return TimeField;

})();
/**
* Description
* @class Block
* @namespace metaScore.editor.panel
* @extends metaScore.editor.Panel
*/

metaScore.namespace('editor.panel').Block = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function BlockPanel(configs) {
    // call parent constructor
    BlockPanel.parent.call(this, configs);
  }

  BlockPanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Block.title', 'Block'),
      menuItems: {
        'synched': metaScore.Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
        'non-synched': metaScore.Locale.t('editor.panel.Block.menuItems.non-synched', 'Add an non-synchronized block'),
        'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
      }
    })
  };

  metaScore.editor.Panel.extend(BlockPanel);

  /**
   * Description
   * @method getDraggable
   * @return Literal
   */
  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
    
    if(component.getProperty('locked')){
      return false;
    }

    if(component instanceof metaScore.player.component.Controller){
      return {
        'target': component,
        'handle': component.child('.timer'),
        'container': component.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      };
    }
    else if(component instanceof metaScore.player.component.Media){
      return {
        'target': component,
        'handle': component.child('video'),
        'container': component.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      };
    }
    else if(component instanceof metaScore.player.component.Block){
      return {
        'target': component,
        'handle': component.child('.pager'),
        'container': component.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      };
    }

    return false;
  };

  /**
   * Description
   * @method getResizable
   * @return ObjectExpression
   */
  BlockPanel.prototype.getResizable = function(){
    var component = this.getComponent();

    if(component instanceof metaScore.player.component.Controller || component.getProperty('locked')){
      return false;
    }

    return {
      'target': component,
      'container': component.parents()
    };
  };

  return BlockPanel;

})();
/**
* Description
* @class Element
* @namespace metaScore.editor.panel
* @extends metaScore.editor.Panel
*/

metaScore.namespace('editor.panel').Element = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function ElementPanel(configs) {
    // call parent constructor
    ElementPanel.parent.call(this, configs);
  }

  ElementPanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Element.title', 'Element'),
      menuItems: {
        'Cursor': metaScore.Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
        'Image': metaScore.Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
        'Text': metaScore.Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
        'delete': metaScore.Locale.t('editor.panel.Element.menuItems.delete', 'Delete the active element')
      }
    })
  };

  metaScore.editor.Panel.extend(ElementPanel);

  /**
   * Description
   * @method getDraggable
   * @return ObjectExpression
   */
  ElementPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
    
    if(component.getProperty('locked')){
      return false;
    }

    return {
      'target': component,
      'handle': component,
      'container': component.parents()
    };
  };

  /**
   * Description
   * @method getResizable
   * @return ObjectExpression
   */
  ElementPanel.prototype.getResizable = function(){
    var component = this.getComponent();
    
    if(component.getProperty('locked')){
      return false;
    }

    return {
      'target': component,
      'container': component.parents()
    };
  };

  return ElementPanel;

})();
/**
* Description
* @class Page
* @namespace metaScore.editor.panel
* @extends metaScore.editor.Panel
*/

metaScore.namespace('editor.panel').Page = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function PagePanel(configs) {
    // call parent constructor
    PagePanel.parent.call(this, configs);
  }

  PagePanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Page.title', 'Page'),
      menuItems: {
        'new': metaScore.Locale.t('editor.panel.Page.menuItems.new', 'Add a new page'),
        'delete': metaScore.Locale.t('editor.panel.Page.menuItems.delete', 'Delete the active page')
      }
    })
  };

  metaScore.editor.Panel.extend(PagePanel);

  return PagePanel;

})();
/**
* Description
* @class Text
* @namespace metaScore.editor.panel
* @extends metaScore.editor.Panel
*/

metaScore.namespace('editor.panel').Text = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function TextPanel(configs) {
    // call parent constructor
    TextPanel.parent.call(this, configs);

    // fix event handlers scope
    this.onComponentContentsDblClick = metaScore.Function.proxy(this.onComponentContentsDblClick, this);
    this.onComponentContentsClick = metaScore.Function.proxy(this.onComponentContentsClick, this);
    this.onComponentContentsKey = metaScore.Function.proxy(this.onComponentContentsKey, this);
    this.onComponentContentsMouseup = metaScore.Function.proxy(this.onComponentContentsMouseup, this);
  }

  TextPanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Text.title', 'Text'),
      buttons: [],
      selector: false
    }),

    properties: {
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.locked', 'Locked ?')
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          if(value){
            this.lock();
          }
          else{
            this.unlock();
          }
        }
      },
      'foreColor': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.fore-color', 'Font color')
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.execCommand('foreColor', value ? 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')' : 'inherit');
        }
      },
      'backColor': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.back-color', 'Background color')
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.execCommand('backColor', value ? 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')' : 'inherit');
        }
      },
      'fontName': {
        'type': 'Select',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.font', 'Font'),
          'options': {
            "inherit": '',
            "Georgia, serif": 'Georgia',
            "'Times New Roman', Times, serif": 'Times New Roman',
            "Arial, Helvetica, sans-serif": 'Arial',
            "'Comic Sans MS', cursive, sans-serif": 'Comic Sans MS',
            "Impact, Charcoal, sans-serif": 'Impact',
            "'Lucida Sans Unicode', 'Lucida Grande', sans-serif": 'Lucida Sans Unicode',
            "Tahoma, Geneva, sans-serif": 'Tahoma',
            "Verdana, Geneva, sans-serif": 'Verdana',
            "'Courier New', Courier, monospace": 'Courier New',
            "'Lucida Console', Monaco, monospace": 'Lucida Console'
          }
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.execCommand('fontName', value);
        }
      },
      'formatBlock': {
        'type': 'Select',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.formatBlock', 'Format'),
          'options': {
            "p": metaScore.Locale.t('editor.panel.Text.formatBlock.p', 'Normal'),
            "h1": metaScore.Locale.t('editor.panel.Text.formatBlock.h1', 'Heading 1'),
            "h2": metaScore.Locale.t('editor.panel.Text.formatBlock.h2', 'Heading 2'),
            "h3": metaScore.Locale.t('editor.panel.Text.formatBlock.h3', 'Heading 3'),
            "h4": metaScore.Locale.t('editor.panel.Text.formatBlock.h4', 'Heading 4'),
            "pre": metaScore.Locale.t('editor.panel.Text.formatBlock.pre', 'Formatted')
          }
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.execCommand('formatBlock', value);
        }
      },
      'fontSize': {
        'type': 'Select',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.font-size', 'Font size'),
          'options': {
            "1": '1',
            "2": '2',
            "3": '3',
            "4": '4',
            "5": '5',
            "6": '6'
          }
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.execCommand('fontSize', value);
        }
      },
      'formatting': {
        'type': 'Buttons',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.formatting', 'Formatting'),
          'buttons': {
            'bold': {
              'data-action': 'bold',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.bold', 'Bold')
            },
            'italic': {
              'data-action': 'italic',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.italic', 'Italic')
            },
            'strikeThrough': {
              'data-action': 'strikeThrough',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.strikeThrough', 'Strikethrough')
            },
            'underline': {
              'data-action': 'underline',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.underline', 'Underline')
            },
            'subscript': {
              'data-action': 'subscript',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.subscript', 'Subscript')
            },
            'superscript': {
              'data-action': 'superscript',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.superscript', 'Superscript')
            },
            'justifyLeft': {
              'data-action': 'justifyLeft',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.justifyLeft', 'Left')
            },
            'justifyCenter': {
              'data-action': 'justifyCenter',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.justifyCenter', 'Center')
            },
            'justifyRight': {
              'data-action': 'justifyRight',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.justifyRight', 'Right')
            },
            'justifyFull': {
              'data-action': 'justifyFull',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.justifyFull', 'Justify')
            },
            'link': {
              'data-action': 'link',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.link', 'Add/Modify link')
            },
            'unlink': {
              'data-action': 'unlink',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.unlink', 'Remove link')
            },
            'insertImage': {
              'data-action': 'insertImage',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.insertImage', 'Add/Modify image')
            },
            'removeFormat': {
              'data-action': 'removeFormat',
              'title': metaScore.Locale.t('editor.panel.Text.formatting.removeFormat', 'Remove formatting')
            }
          }
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var selected, element;
        
          switch(value){
            case 'link':
              selected = this.getSelectedElement();
              element = metaScore.Dom.is(selected, 'a') ? selected : null;
                
              if(element){
                this.setSelectedElement(element);
              }

              new metaScore.editor.overlay.InsertLink({
                  link: element,
                  autoShow: true
                })
                .addListener('submit', metaScore.Function.proxy(this.onLinkOverlaySubmit, this));
              break;
              
            case 'unlink':
              selected = this.getSelectedElement();
              element = metaScore.Dom.is(selected, 'a') ? selected : null;
                
              if(element){
                this.setSelectedElement(element);
              }
              
              this.execCommand(value);
              break;
            
            case 'insertImage':
              new metaScore.editor.overlay.InsertImage({
                  autoShow: true
                })
                .addListener('submit', metaScore.Function.proxy(this.onImageOverlaySubmit, this));
              break;
              
            default:
              this.execCommand(value);
          }
        }
      }
    }
  };

  metaScore.editor.Panel.extend(TextPanel);

  /**
   * Description
   * @method onFieldValueChange
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.onFieldValueChange = function(evt){
    var component = this.getComponent(),
      name, value;

    if(!component){
      return;
    }

    name = evt.detail.field.data('name');
    value = evt.detail.value;

    if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
      this.configs.properties[name].setter.call(this, value);
    }
  };

  /**
   * Description
   * @method setComponent
   * @param {} component
   * @param {} supressEvent
   * @return ThisExpression
   */
  TextPanel.prototype.setComponent = function(component, supressEvent){
    if(component !== this.getComponent()){
      if(!component){
        return this.unsetComponent();
      }
      
      this.unsetComponent(true);

      this.component = component;

      this
        .setupFields(this.configs.properties)
        .updateFieldValue('locked', true)
        .addClass('has-component');

      if(supressEvent !== true){
        this.triggerEvent('componentset', {'component': component}, false);
      }
    }

    return this;
  };

  /**
   * Description
   * @method unsetComponent
   * @param {} supressEvent
   * @return ThisExpression
   */
  TextPanel.prototype.unsetComponent = function(supressEvent){
    var component = this.getComponent();
    
    this.lock().removeClass('has-component');

    if(component){        
      this.component = null;

      if(supressEvent !== true){
        this.triggerEvent('componentunset', {'component': component}, false);
      }
    }

    return this;
  };

  /**
   * Description
   * @method lock
   * @return ThisExpression
   */
  TextPanel.prototype.lock = function(){
    var component = this.getComponent();
    
    if(component){      
      component.contents
        .attr('contenteditable', null)
        .addListener('dblclick', this.onComponentContentsDblClick)
        .removeListener('click', this.onComponentContentsClick)
        .removeListener('keydown', this.onComponentContentsKey)
        .removeListener('keypress', this.onComponentContentsKey)
        .removeListener('keyup', this.onComponentContentsKey)
        .removeListener('mouseup', this.onComponentContentsMouseup);
        
      this.toggleFields(metaScore.Array.remove(Object.keys(this.getField()), 'locked'), false);
        
      if(component._draggable){
        component._draggable.enable();
      }
      if(component._resizable){
        component._resizable.enable();
      }
    }
    
    return this;
  };

  /**
   * Description
   * @method unlock
   * @return ThisExpression
   */
  TextPanel.prototype.unlock = function(){
    var component = this.getComponent();
    
    if(component){
      if(component._draggable){
        component._draggable.disable();
      }
      if(component._resizable){
        component._resizable.disable();
      }
      
      component.contents
        .attr('contenteditable', 'true')
        .removeListener('dblclick', this.onComponentContentsDblClick)
        .addListener('click', this.onComponentContentsClick)
        .addListener('keydown', this.onComponentContentsKey)
        .addListener('keypress', this.onComponentContentsKey)
        .addListener('keyup', this.onComponentContentsKey)
        .addListener('mouseup', this.onComponentContentsMouseup)
        .focus();

      this
        .toggleFields(metaScore.Array.remove(Object.keys(this.getField()), 'locked'), true)
        .execCommand("styleWithCSS", true)
        .execCommand("enableObjectResizing", true);
    }
    
    return this;
  };

  /**
   * Description
   * @method disable
   * @return CallExpression
   */
  TextPanel.prototype.disable = function(){    
    this.lock();
    
    return TextPanel.parent.prototype.disable.call(this);
  };

  /**
   * Description
   * @method onComponentContentsDblClick
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.onComponentContentsDblClick = function(evt){
    this.updateFieldValue('locked', false);
  };

  /**
   * Description
   * @method onComponentContentsClick
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.onComponentContentsClick = function(evt){
    evt.stopPropagation();
  };

  /**
   * Description
   * @method onComponentContentsKey
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.onComponentContentsKey = function(evt){
    if(evt.type === 'keyup'){
      this.updateButtons();
    }
    
    evt.stopPropagation();
  };

  /**
   * Description
   * @method onComponentContentsMouseup
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.onComponentContentsMouseup = function(evt){
    this.updateButtons();
  };

  /**
   * Description
   * @method updateButtons
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.updateButtons = function(evt){
     var component = this.getComponent(),
      document =  component.contents.get(0).ownerDocument,
      selected, is_link;
    
    selected = this.getSelectedElement();
    is_link = metaScore.Dom.is(selected, 'a');
    
    metaScore.Object.each(this.getField(), function(field_key, field){
      switch(field_key){
        case 'formatting':
          metaScore.Object.each(field.getButtons(), function(button_key, button){
            switch(button_key){
              case 'link':
                button.toggleClass('pressed', is_link);
                break;
                
              default:
                button.toggleClass('pressed', document.queryCommandState(button_key));
            }
          });
          break;
                
        default:
          field.setValue(document.queryCommandValue(field_key), true);
      }
    }, this);
  };

  /**
   * Description
   * @method onLinkOverlaySubmit
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.onLinkOverlaySubmit = function(evt){
    var url = evt.detail.url;

    this.execCommand('createLink', url);
  };

  /**
   * Description
   * @method onImageOverlaySubmit
   * @param {} evt
   * @return 
   */
  TextPanel.prototype.onImageOverlaySubmit = function(evt){
    var url = evt.detail.url,
      width = evt.detail.width,
      height = evt.detail.height,
      alignment = evt.detail.alignment;
    
    this.execCommand('insertHTML', '<img src="'+ url +'" style="width: '+ width +'px; height: '+ height +'px'+ (alignment ? '; float: '+ alignment : "") +';" />');
  };

  /**
   * Description
   * @method getSelectedElement
   * @return element
   */
  TextPanel.prototype.getSelectedElement = function(){
     var component = this.getComponent(),
      document =  component.contents.get(0).ownerDocument,
      selection, range, element;
    
    selection = document.getSelection();
    element = selection.anchorNode;
    
    if(element) {
      return (element.nodeName === "#text" ? element.parentNode : element);
    }
  };


  /**
   * Description
   * @method setSelectedElement
   */
  TextPanel.prototype.setSelectedElement = function(element){
     var component = this.getComponent(),
      document =  component.contents.get(0).ownerDocument,
      selection, range;
    
    selection = document.getSelection();
    
    range = document.createRange();
    range.selectNodeContents(element);
    
    selection.removeAllRanges();
    selection.addRange(range);
  };
  
  /**
   * Insert some html at the current caret position
   * @method pasteHtmlAtCaret
   */
  TextPanel.prototype.insertHtmlAtCaret = function(html){
     var component = this.getComponent(),
      document =  component.contents.get(0).ownerDocument,
      selection, range,
      element, fragment,
      node, lastNode;
      
    selection = document.getSelection();

    if(selection.getRangeAt && selection.rangeCount) {
      range = selection.getRangeAt(0);
      range.deleteContents();
      
      fragment = range.createContextualFragment(html);

      range.insertNode(fragment);
    
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return this;
  };

  /**
   * Description
   * @method execCommand
   * @param {} command
   * @param {} value
   * @return 
   */
  TextPanel.prototype.execCommand = function(command, value){
     var component = this.getComponent(),
      contents =  component.contents.get(0);

    contents.focus();
    
    switch(command){
      case 'insertHTML':
        this.insertHtmlAtCaret(value);
        break;
        
      default:
        contents.ownerDocument.execCommand(command, false, value);
    }
    
    this.updateButtons();
    
    return this;
  };

  return TextPanel;

})();
/**
* Description
* @class Toolbar
* @namespace metaScore.editor.panel
* @extends metaScore.Dom
*/

metaScore.namespace('editor.panel').Toolbar = (function(){

  /**
   * Initialize
   * @constructor
   * @param {} configs
   */
  function Toolbar(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

    this.title = new metaScore.Dom('<div/>', {'class': 'title', 'text': this.configs.title})
      .appendTo(this);

    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);

    metaScore.Array.each(this.configs.buttons, function(index, action){
      this.addButton(action);
    }, this);

    if(this.configs.selector){
      this.selector = new metaScore.editor.field.Select()
        .addClass('selector')
        .appendTo(this);
        
      this.emptySelector();
    }

    if(!metaScore.Var.isEmpty(this.configs.menuItems)){
      this.menu = new metaScore.editor.DropDownMenu();

      metaScore.Object.each(this.configs.menuItems, function(action, label){
        this.menu.addItem(action, label);
      }, this);

      this.addButton('menu')
        .append(this.menu);
    }
  }

  Toolbar.defaults = {
    /**
    * A text to add as a title
    */
    title: '',

    buttons: [],

    /**
    * Whether to replace the title with a selector
    */
    selector: true,

    menuItems: {}
  };

  metaScore.Dom.extend(Toolbar);

  /**
   * Description
   * @method getToggle
   * @return MemberExpression
   */
  Toolbar.prototype.getToggle = function(){
    return this.toggle;
  };

  /**
   * Description
   * @method getTitle
   * @return MemberExpression
   */
  Toolbar.prototype.getTitle = function(){
    return this.title;
  };

  /**
   * Description
   * @method getSelector
   * @return MemberExpression
   */
  Toolbar.prototype.getSelector = function(){
    return this.selector;
  };

  /**
   * Description
   * @method getMenu
   * @return MemberExpression
   */
  Toolbar.prototype.getMenu = function(){
    return this.menu;
  };

  /**
   * Description
   * @method addButton
   * @param {} action
   * @return button
   */
  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  /**
   * Description
   * @method getButton
   * @param {} action
   * @return CallExpression
   */
  Toolbar.prototype.getButton = function(action){
    return this.buttons.children('[data-action="'+ action +'"]');
  };

  /**
   * Description
   * @method emptySelector
   * @return ThisExpression
   */
  Toolbar.prototype.emptySelector = function(){
    if(this.selector){
      this.selector.removeOptions();
    }
    
    return this;
  };

  /**
   * Description
   * @method addSelectorOption
   * @param {} value
   * @param {} text
   * @return ThisExpression
   */
  Toolbar.prototype.addSelectorOption = function(value, text){
    var option;
  
    if(this.selector){
      option = this.selector.addOption(value, text);
    }
    
    return option;
  };

  /**
   * Description
   * @method addSelectorOption
   * @param {} value
   * @param {} text
   * @return ThisExpression
   */
  Toolbar.prototype.updateSelectorOption = function(value, text){
    var option;
    
    if(this.selector){
      option = this.selector.updateOption(value, text);
    }
    
    return option;
  };

  /**
   * Description
   * @method setSelectorValue
   * @param {} value
   * @param {} supressEvent
   * @return ThisExpression
   */
  Toolbar.prototype.setSelectorValue = function(value, supressEvent){
    if(this.selector){
      this.selector.setValue(value, supressEvent);
    }
    
    return this;
  };

  /**
   * Description
   * @method toggleMenuItem
   * @param {} action
   * @param {} state
   * @return ThisExpression
   */
  Toolbar.prototype.toggleMenuItem = function(action, state){
    var menu = this.getMenu();

    if(menu){
      menu.toggleItem(action, state);
    }

    return this;
  };

  return Toolbar;

})();
/**
* Description
* @class Alert
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').Alert = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Alert(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Alert.parent.call(this, this.configs);

    this.addClass('alert');
  }

  Alert.defaults = {
    /**
    * True to make this draggable
    */
    draggable: false,

    text: '',

    buttons: []
  };

  metaScore.editor.Overlay.extend(Alert);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Alert.prototype.setupDOM = function(){
    // call parent method
    Alert.parent.prototype.setupDOM.call(this);

    this.text = new metaScore.Dom('<div/>', {'class': 'text'})
      .appendTo(this.contents);

    if(this.configs.text){
      this.setText(this.configs.text);
    }

    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .addDelegate('button', 'click', metaScore.Function.proxy(this.onButtonClick, this))
      .appendTo(this.contents);

    if(this.configs.buttons){
      metaScore.Object.each(this.configs.buttons, function(action, label){
        this.addButton(action, label);
      }, this);
    }
    
  };

  /**
   * Description
   * @method setText
   * @param {} str
   * @return 
   */
  Alert.prototype.setText = function(str){
    this.text.text(str);
  };

  /**
   * Description
   * @method addButton
   * @param {} action
   * @param {} label
   * @return button
   */
  Alert.prototype.addButton = function(action, label){
    var button = new metaScore.editor.Button()
      .setLabel(label)
      .data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  /**
   * Description
   * @method onButtonClick
   * @param {} evt
   * @return 
   */
  Alert.prototype.onButtonClick = function(evt){
    var action = new metaScore.Dom(evt.target).data('action');

    this.hide();

    this.triggerEvent(action +'click', {'alert': this}, false);

    evt.stopPropagation();
  };

  return Alert;

})();
/**
* Description
* @class BorderRadius
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').BorderRadius = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function BorderRadius(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BorderRadius.parent.call(this, this.configs);

    this.addClass('border-radius');
  }

  BorderRadius.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.BorderRadius.title', 'Border Radius')
  };

  metaScore.editor.Overlay.extend(BorderRadius);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  BorderRadius.prototype.setupDOM = function(){
    var contents;

    // call parent method
    BorderRadius.parent.prototype.setupDOM.call(this);

    contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    this.preview = new metaScore.Dom('<div/>', {'class': 'preview'})
      .appendTo(contents);

    this.fields.tlw = new metaScore.editor.field.Number({min: 0})
      .addClass('tlw')
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .appendTo(this.preview);

    this.fields.tlh = new metaScore.editor.field.Number({min: 0})
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .addClass('tlh')
      .appendTo(this.preview);

    this.fields.trw = new metaScore.editor.field.Number({min: 0})
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .addClass('trw')
      .appendTo(this.preview);

    this.fields.trh = new metaScore.editor.field.Number({min: 0})
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .addClass('trh')
      .appendTo(this.preview);

    this.fields.brw = new metaScore.editor.field.Number({min: 0})
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .addClass('brw')
      .appendTo(this.preview);

    this.fields.brh = new metaScore.editor.field.Number({min: 0})
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .addClass('brh')
      .appendTo(this.preview);

    this.fields.blw = new metaScore.editor.field.Number({min: 0})
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .addClass('blw')
      .appendTo(this.preview);

    this.fields.blh = new metaScore.editor.field.Number({min: 0})
      .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
      .addClass('blh')
      .appendTo(this.preview);

    // Buttons
    this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(contents);

    this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(contents);

  };

  /**
   * Description
   * @method onValueChange
   * @return 
   */
  BorderRadius.prototype.onValueChange = function(){  
    var radius  = '';
    
    radius += this.fields.tlw.getValue() +'px ';
    radius += this.fields.trw.getValue() +'px ';
    radius += this.fields.brw.getValue() +'px ';
    radius += this.fields.blw.getValue() +'px ';
    radius += '/ ';
    radius += this.fields.tlh.getValue() +'px ';
    radius += this.fields.trh.getValue() +'px ';
    radius += this.fields.brh.getValue() +'px ';
    radius += this.fields.blh.getValue() +'px';
    
    this.preview.css('border-radius', radius);
  };

  /**
   * Description
   * @method setValue
   * @param {} val
   * @return ThisExpression
   */
  BorderRadius.prototype.setValue = function(val){
    var matches,
      values = {
        tlw: 0, tlh: 0,
        trw: 0, trh: 0,
        blw: 0, blh: 0,
        brw: 0, brh: 0
      };
    
    this.preview.css('border-radius', val);
    
    if(matches = this.preview.css('border-top-left-radius', undefined, true).match(/(\d*)px/g)){
      if(matches.length > 1){
        values.tlw = matches[0];
        values.tlh = matches[1];
      }
      else{
        values.tlw = values.tlh = matches[0];
      }
    }
    
    if(matches = this.preview.css('border-top-right-radius', undefined, true).match(/(\d*)px/g)){
      if(matches.length > 1){
        values.trw = matches[0];
        values.trh = matches[1];
      }
      else{
        values.trw = values.trh = matches[0];
      }
    }
    
    if(matches = this.preview.css('border-bottom-left-radius', undefined, true).match(/(\d*)px/g)){
      if(matches.length > 1){
        values.blw = matches[0];
        values.blh = matches[1];
      }
      else{
        values.blw = values.blh = matches[0];
      }
    }
    
    if(matches = this.preview.css('border-bottom-right-radius', undefined, true).match(/(\d*)px/g)){
      if(matches.length > 1){
        values.brw = matches[0];
        values.brh = matches[1];
      }
      else{
        values.brw = values.brh = matches[0];
      }
    }
    
    metaScore.Object.each(this.fields, function(key, field){
      field.setValue(parseInt(values[key], 10), true);
    });
    
    return this;
  };

  /**
   * Description
   * @method getValue
   * @return CallExpression
   */
  BorderRadius.prototype.getValue = function(){
    return this.preview.css('border-radius');
  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  BorderRadius.prototype.onApplyClick = function(evt){  
    this.triggerEvent('submit', {'overlay': this, 'value': this.getValue()}, true, false);
    this.hide();
  };

  BorderRadius.prototype.onCancelClick = BorderRadius.prototype.onCloseClick;

  return BorderRadius;

})();
/**
* Description
* @class ColorSelector
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').ColorSelector = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function ColorSelector(configs) {
    this.configs = this.getConfigs(configs);

    // fix event handlers scope
    this.onGradientMousemove = metaScore.Function.proxy(this.onGradientMousemove, this);
    this.onAlphaMousemove = metaScore.Function.proxy(this.onAlphaMousemove, this);

    // call parent constructor
    ColorSelector.parent.call(this, this.configs);

    this.addClass('color-selector');
  }

  ColorSelector.defaults = {

    /**
    * The parent element in which the overlay will be appended
    */
    parent: '.metaScore-editor',

    /**
    * True to make this draggable
    */
    draggable: false
  };

  metaScore.editor.Overlay.extend(ColorSelector);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  ColorSelector.prototype.setupDOM = function(){
    // call parent method
    ColorSelector.parent.prototype.setupDOM.call(this);

    this.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(this.contents);
    this.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
      .addListener('click', metaScore.Function.proxy(this.onGradientClick, this))
      .addListener('mousedown', metaScore.Function.proxy(this.onGradientMousedown, this))
      .addListener('mouseup', metaScore.Function.proxy(this.onGradientMouseup, this))
      .appendTo(this.gradient);
    this.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.gradient);

    this.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(this.contents);
    this.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
      .addListener('click', metaScore.Function.proxy(this.onAlphaClick, this))
      .addListener('mousedown', metaScore.Function.proxy(this.onAlphaMousedown, this))
      .addListener('mouseup', metaScore.Function.proxy(this.onAlphaMouseup, this))
      .appendTo(this.alpha);
    this.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.alpha);

    this.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(this.contents);

    this.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(this.controls.r)
      .appendTo(this.controls);

    this.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(this.controls.g)
      .appendTo(this.controls);

    this.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(this.controls.b)
      .appendTo(this.controls);

    this.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(this.controls.a)
      .appendTo(this.controls);

    this.controls.current = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
      .append(this.controls.current)
      .appendTo(this.controls);

    this.controls.previous = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
      .append(this.controls.previous)
      .appendTo(this.controls);

    this.controls.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(this.controls);

    this.controls.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(this.controls);

    this.fillGradient();

  };

  /**
   * Description
   * @method setValue
   * @param {} val
   * @return ThisExpression
   */
  ColorSelector.prototype.setValue = function(val){
    this.previous_value = val;

    this.fillPrevious();

    this.updateValue(val);

    return this;
  };

  /**
   * Description
   * @method updateValue
   * @param {} val
   * @param {} refillAlpha
   * @param {} updatePositions
   * @param {} updateInputs
   * @return 
   */
  ColorSelector.prototype.updateValue = function(val, refillAlpha, updatePositions, updateInputs){

    var hsv;

    this.value = this.value || {};

    if(!metaScore.Var.is(val, 'object')){
      val = metaScore.Color.parse(val);
    }

    if('r' in val){
      this.value.r = parseInt(val.r, 10);
    }
    if('g' in val){
      this.value.g = parseInt(val.g, 10);
    }
    if('b' in val){
      this.value.b = parseInt(val.b, 10);
    }
    if('a' in val){
      this.value.a = parseFloat(val.a);
    }

    if(refillAlpha !== false){
      this.fillAlpha();
    }

    if(updateInputs !== false){
      this.controls.r.val(this.value.r);
      this.controls.g.val(this.value.g);
      this.controls.b.val(this.value.b);
      this.controls.a.val(this.value.a);
    }

    if(updatePositions !== false){
      hsv = metaScore.Color.rgb2hsv(this.value);

      this.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
      this.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');

      this.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
    }

    this.fillCurrent();

  };

  /**
   * Description
   * @method fillPrevious
   * @return 
   */
  ColorSelector.prototype.fillPrevious = function(){
    var context = this.controls.previous.get(0).getContext('2d');

    context.fillStyle = "rgba("+ this.previous_value.r +","+ this.previous_value.g +","+ this.previous_value.b +","+ this.previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

  /**
   * Description
   * @method fillCurrent
   * @return 
   */
  ColorSelector.prototype.fillCurrent = function(){
    var context = this.controls.current.get(0).getContext('2d');

    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

  /**
   * Description
   * @method fillGradient
   * @return 
   */
  ColorSelector.prototype.fillGradient = function(){
    var context = this.gradient.canvas.get(0).getContext('2d'),
      fill;

    // Create color gradient
    fill = context.createLinearGradient(0, 0, context.canvas.width, 0);
    fill.addColorStop(0, "rgb(255, 0, 0)");
    fill.addColorStop(0.15, "rgb(255, 0, 255)");
    fill.addColorStop(0.33, "rgb(0, 0, 255)");
    fill.addColorStop(0.49, "rgb(0, 255, 255)");
    fill.addColorStop(0.67, "rgb(0, 255, 0)");
    fill.addColorStop(0.84, "rgb(255, 255, 0)");
    fill.addColorStop(1, "rgb(255, 0, 0)");

    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // Create semi transparent gradient (white -> trans. -> black)
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgba(255, 255, 255, 1)");
    fill.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    fill.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    fill.addColorStop(1, "rgba(0, 0, 0, 1)");

    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

  /**
   * Description
   * @method fillAlpha
   * @return 
   */
  ColorSelector.prototype.fillAlpha = function(){
    var context = this.alpha.canvas.get(0).getContext('2d'),
      fill;

    // Create color gradient
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgb("+ this.value.r +","+ this.value.g +","+ this.value.b +")");
    fill.addColorStop(1, "transparent");

    // Apply gradient to canvas
    context.fillStyle = fill;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

  /**
   * Description
   * @method onControlInput
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onControlInput = function(evt){
    var rgba, hsv;

    this.updateValue({
      'r': this.controls.r.val(),
      'g': this.controls.g.val(),
      'b': this.controls.b.val(),
      'a': this.controls.a.val()
    }, true, true, false);
  };

  /**
   * Description
   * @method onGradientMousedown
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onGradientMousedown = function(evt){
    this.gradient.canvas.addListener('mousemove', this.onGradientMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onGradientMouseup
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onGradientMouseup = function(evt){
    this.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onGradientClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onGradientClick = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorX = evt.pageX - offset.left,
      colorY = evt.pageY - offset.top,
      context = this.gradient.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(colorX, colorY, 1, 1),
      value = this.value;

    this.gradient.position.css('left', colorX +'px');
    this.gradient.position.css('top', colorY +'px');

    value.r = imageData.data[0];
    value.g = imageData.data[1];
    value.b =  imageData.data[2];

    this.updateValue(value, true, false);

    evt.stopPropagation();
  };

  ColorSelector.prototype.onGradientMousemove = ColorSelector.prototype.onGradientClick;

  /**
   * Description
   * @method onAlphaMousedown
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onAlphaMousedown = function(evt){
    this.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onAlphaMouseup
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onAlphaMouseup = function(evt){
    this.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onAlphaClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onAlphaClick = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorY = evt.pageY - offset.top,
      context = this.alpha.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(0, colorY, 1, 1),
      value = this.value;

    this.alpha.position.css('top', colorY +'px');

    value.a = Math.round(imageData.data[3] / 255 * 100) / 100;

    this.updateValue(value, false, false);

    evt.stopPropagation();
  };

  ColorSelector.prototype.onAlphaMousemove = ColorSelector.prototype.onAlphaClick;

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onApplyClick = function(evt){
    this.triggerEvent('select', {'overlay': this, 'value': this.value}, true, false);

    this.hide();
  };

  /**
   * Description
   * @method onCancelClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return ColorSelector;

})();
/**
* Description
* @class GuideInfo
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').GuideInfo = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function GuideInfo(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    GuideInfo.parent.call(this, this.configs);

    this.addClass('guide-details');
  }

  GuideInfo.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.GuideInfo.title', 'Guide Info')
  };

  metaScore.editor.Overlay.extend(GuideInfo);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  GuideInfo.prototype.setupDOM = function(){
    var contents;

    // call parent method
    GuideInfo.parent.prototype.setupDOM.call(this);

    contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    this.fields.title = new metaScore.editor.field.Text({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.title', 'Title')
      })
      .appendTo(contents);

    this.fields.description = new metaScore.editor.field.Textarea({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.description', 'Description')
      })
      .appendTo(contents);

    /*this.fields.thumbnail = new metaScore.editor.field.Image({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.thumbnail', 'Thumbnail')
      })
      .appendTo(contents);*/

    this.fields.css = new metaScore.editor.field.Textarea({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.css', 'CSS')
      })
      .appendTo(contents);

    // Buttons
    this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(contents);

    this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(contents);

  };

  /**
   * Description
   * @method setValues
   * @param {} data
   * @return 
   */
  GuideInfo.prototype.setValues = function(data){
    this.fields.title.setValue(data.title || null);
    this.fields.description.setValue(data.description || null);
    //this.fields.thumbnail.setValue(data.thumbnail || null);
    this.fields.css.setValue(data.css || null);
  };

  /**
   * Description
   * @method getValues
   * @return ObjectExpression
   */
  GuideInfo.prototype.getValues = function(){
    return {
      'title': this.fields.title.getValue(),
      'description': this.fields.description.getValue(),
      //'thumbnail': this.fields.thumbnail.getValue(),
      'css': this.fields.css.getValue()
    };
  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  GuideInfo.prototype.onApplyClick = function(evt){
    this.triggerEvent('submit', {'overlay': this, 'values': this.getValues()}, true, false);
    this.hide();
  };

  GuideInfo.prototype.onCancelClick = 
/**
  * Description
  * @method onCloseClick
  * @param {} evt
  * @return 
  */
 GuideInfo.prototype.onCloseClick = function(evt){
    this.setValues(this.previousValues);
    this.hide();
  };

  /**
   * Description
   * @method show
   * @return CallExpression
   */
  GuideInfo.prototype.show = function(){
    this.previousValues = this.getValues();

    return GuideInfo.parent.prototype.show.call(this);
  };

  return GuideInfo;

})();
/**
* Description
* @class GuideSelector
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').GuideSelector = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function GuideSelector(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    GuideSelector.parent.call(this, this.configs);

    this.addClass('guide-selector');
  }

  GuideSelector.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.GuideSelector.title', 'Select a guide'),

    /**
    * The text to display when no guides are available
    */
    emptyText: metaScore.Locale.t('editor.overlay.GuideSelector.emptyText', 'No guides available'),

    /**
    * The url from which to retreive the list of guides
    */
    url: null
  };

  metaScore.editor.Overlay.extend(GuideSelector);

  /**
   * Description
   * @method show
   * @return 
   */
  GuideSelector.prototype.show = function(){
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });

    metaScore.Ajax.get(this.configs.url, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    });
  };

  /**
   * Description
   * @method onLoadSuccess
   * @param {} xhr
   * @return 
   */
  GuideSelector.prototype.onLoadSuccess = function(xhr){
    var contents = this.getContents(),
      data = JSON.parse(xhr.response),
      table, row;

    table = new metaScore.Dom('<table/>', {'class': 'guides'})
      .appendTo(contents);

    if(metaScore.Var.isEmpty(data)){
      contents.text(this.configs.emptyText);
    }
    else{
      metaScore.Object.each(data, function(key, guide){
        row = new metaScore.Dom('<tr/>', {'class': 'guide guide-'+ guide.id})
          .addListener('click', metaScore.Function.proxy(this.onGuideClick, this, [guide]))
          .appendTo(table);

        new metaScore.Dom('<td/>', {'class': 'thumbnail'})
          .append(new metaScore.Dom('<img/>', {'src': guide.thumbnail}))
          .appendTo(row);

        new metaScore.Dom('<td/>', {'class': 'details'})
          .append(new metaScore.Dom('<h1/>', {'class': 'title', 'text': guide.title}))
          .append(new metaScore.Dom('<p/>', {'class': 'description', 'text': guide.description}))
          .append(new metaScore.Dom('<h2/>', {'class': 'author', 'text': guide.author.name}))
          .appendTo(row);
      }, this);
    }

    this.loadmask.hide();
    delete this.loadmask;

    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }

    this.appendTo(this.configs.parent);
  };

  /**
   * Description
   * @method onLoadError
   * @return 
   */
  GuideSelector.prototype.onLoadError = function(){
  };

  /**
   * Description
   * @method onGuideClick
   * @param {} guide
   * @return 
   */
  GuideSelector.prototype.onGuideClick = function(guide){
    this.triggerEvent('select', {'overlay': this, 'guide': guide}, true, false);

    this.hide();
  };

  return GuideSelector;

})();
/**
* Description
* @class InsertImage
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').InsertImage = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function InsertImage(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    InsertImage.parent.call(this, this.configs);

    this.addClass('insert-image');

    if(this.configs.image){
      this.setValuesFromImage(this.configs.image);
    }
  }

  InsertImage.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.InsertImage.title', 'Insert Image'),

    /**
    * The current image
    */
    image: null
  };

  metaScore.editor.Overlay.extend(InsertImage);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  InsertImage.prototype.setupDOM = function(){
    var contents, size_wrapper, size_buttons;

    // call parent method
    InsertImage.parent.prototype.setupDOM.call(this);

    contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    // URL
    this.fields.image = new metaScore.editor.field.Image({
        'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.image', 'Image')
      })
      .addClass('image')
      .addListener('valuechange', metaScore.Function.proxy(this.onURLChange, this))
      .appendTo(contents);
    
    size_wrapper = new metaScore.Dom('<div/>', {'class': 'size-wrapper clearfix'})
      .appendTo(contents);
      
    // Width
    this.fields.width = new metaScore.editor.field.Number({
        'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.width', 'Width'),
        'min': 0
      })
      .addClass('width')
      .addListener('valuechange', metaScore.Function.proxy(this.onWidthChange, this))
      .appendTo(size_wrapper);
    
    size_buttons = new metaScore.Dom('<div/>', {'class': 'size-buttons'})
      .appendTo(size_wrapper);
      
    // Lock ratio
    this.fields.lock_ratio = new metaScore.editor.field.Boolean({
        'checked': true,
        'label': '&nbsp;'
      })
      .addClass('lock-ratio')
      .attr('title', metaScore.Locale.t('editor.overlay.InsertImage.lock-ratio', 'Lock ratio'))
      .addListener('valuechange', metaScore.Function.proxy(this.onLockRatioChange, this))
      .appendTo(size_buttons);
      
    // Reset
    this.fields.reset_size = new metaScore.editor.Button({
      })
      .addClass('reset-size')
      .attr('title', metaScore.Locale.t('editor.overlay.InsertImage.reset-size', 'Reset size'))
      .addListener('click', metaScore.Function.proxy(this.onRevertSizeClick, this))
      .appendTo(size_buttons);
      
    // Height
    this.fields.height = new metaScore.editor.field.Number({
        'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.height', 'Height'),
        'min': 0
      })
      .addClass('height')
      .addListener('valuechange', metaScore.Function.proxy(this.onHeightChange, this))
      .appendTo(size_wrapper);
      
    // Alignment
    this.fields.alignment = new metaScore.editor.field.Select({
        'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment', 'Alignment'),
        'options': {
          '': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.unset', '&lt;not set&gt;'),
          'left': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.left', 'Left'),
          'right': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.right', 'Right')
        }
      })
      .addClass('alignment')
      .appendTo(contents);

    // Buttons
    this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(contents);

    this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(contents);

  };

  /**
   * Description
   * @method setValuesFromLink
   * @param {} link
   * @return 
   */
  InsertImage.prototype.setValuesFromImage = function(image){
    this.fields.image.setValue(image.url);
  };

  /**
   * Description
   * @method onURLChange
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onURLChange = function(evt){
    var url = evt.detail.value;
    
    if(url){
      new metaScore.Dom('<img/>')
        .addListener('load', metaScore.Function.proxy(function(evt){
          this.img = evt.target;
          
          this.fields.width.setValue(this.img.width, true);
          this.fields.height.setValue(this.img.height, true);
        }, this))
        .attr('src', url);
    }
  };

  /**
   * Description
   * @method onWidthChange
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onWidthChange = function(evt){
    var lock_ratio = this.fields.lock_ratio.getValue(),
      width, height;
    
    if(lock_ratio && this.img){
      width = this.fields.width.getValue();
      height = Math.round(width * this.img.height / this.img.width);
      
      this.fields.height.setValue(height, true);
    }
  };

  /**
   * Description
   * @method onHeightChange
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onHeightChange = function(evt){
    var lock_ratio = this.fields.lock_ratio.getValue(),
      width, height;
    
    if(lock_ratio && this.img){
      height = this.fields.height.getValue();
      width = Math.round(height * this.img.width / this.img.height);
      
      this.fields.width.setValue(width, true);
    }
  };

  /**
   * Description
   * @method onRatioChange
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onLockRatioChange = function(evt){
    var lock_ratio = evt.detail.value;
    
    if(lock_ratio && this.img){      
      this.fields.width.setValue(this.fields.width.getValue());
    }
  };

  /**
   * Description
   * @method onRevertSizeClick
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onRevertSizeClick = function(evt){    
    if(this.img){      
      this.fields.width.setValue(this.img.width);
      this.fields.height.setValue(this.img.height);
    }
  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onApplyClick = function(evt){
    var url, width, height, alignment;
    
    url = this.fields.image.getValue();
    width = this.fields.width.getValue();
    height = this.fields.height.getValue();
    alignment = this.fields.alignment.getValue();

    this.triggerEvent('submit', {'overlay': this, 'url': url, 'width': width, 'height': height, 'alignment': alignment}, true, false);

    this.hide();
  };

  /**
   * Description
   * @method onCancelClick
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return InsertImage;

})();
/**
* Description
* @class InsertLink
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').InsertLink = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function InsertLink(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    InsertLink.parent.call(this, this.configs);

    this.addClass('insert-link');

    this.toggleFields();

    if(this.configs.link){
      this.setValuesFromLink(this.configs.link);
    }
  }

  InsertLink.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.InsertLink.title', 'Insert Link'),

    /**
    * The current link
    */
    link: null
  };

  metaScore.editor.Overlay.extend(InsertLink);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  InsertLink.prototype.setupDOM = function(){
    var contents;

    // call parent method
    InsertLink.parent.prototype.setupDOM.call(this);

    contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    this.fields.type = new metaScore.editor.field.Select({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.type', 'Type'),
        options: {
          'url': metaScore.Locale.t('editor.overlay.InsertLink.fields.type.url', 'URL'),
          'page': metaScore.Locale.t('editor.overlay.InsertLink.fields.type.page', 'Page'),
          'time': metaScore.Locale.t('editor.overlay.InsertLink.fields.type.time', 'Time')
        }
      })
      .addListener('valuechange', metaScore.Function.proxy(this.onTypeChange, this))
      .appendTo(contents);

    // URL
    this.fields.url = new metaScore.editor.field.Text({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.url', 'URL')
      })
      .appendTo(contents);

    // Page
    this.fields.page = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.page', 'Page')
      })
      .appendTo(contents);

    // Time
    this.fields.inTime = new metaScore.editor.field.Time({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.in-time', 'Start time'),
        inButton: true
      })
      .appendTo(contents);

    this.fields.outTime = new metaScore.editor.field.Time({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.out-time', 'End time'),
        inButton: true
      })
      .appendTo(contents);

    this.fields.rIndex = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.r-index', 'Reading index')
      })
      .appendTo(contents);

    // Buttons
    this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(contents);

    this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(contents);

  };

  /**
   * Description
   * @method setValuesFromLink
   * @param {} link
   * @return 
   */
  InsertLink.prototype.setValuesFromLink = function(link){
    var matches;

    if(matches = link.hash.match(/^#p=(\d+)/)){
      this.fields.type.setValue('page');
      this.fields.page.setValue(matches[1]);
    }
    else if(matches = link.hash.match(/^#t=(\d+),(\d+)&r=(\d+)/)){
      this.fields.type.setValue('time');
      this.fields.inTime.setValue(matches[1]);
      this.fields.outTime.setValue(matches[2]);
      this.fields.rIndex.setValue(matches[3]);
    }
    else{
      this.fields.type.setValue('url');
      this.fields.url.setValue(link.href);
    }
  };

  /**
   * Description
   * @method toggleFields
   * @return 
   */
  InsertLink.prototype.toggleFields = function(){
    var type = this.fields.type.getValue();

    switch(type){
      case 'page':
        this.fields.url.hide();
        this.fields.page.show();
        this.fields.inTime.hide();
        this.fields.outTime.hide();
        this.fields.rIndex.hide();
        break;

      case 'time':
        this.fields.url.hide();
        this.fields.page.hide();
        this.fields.inTime.show();
        this.fields.outTime.show();
        this.fields.rIndex.show();
        break;

      default:
        this.fields.url.show();
        this.fields.page.hide();
        this.fields.inTime.hide();
        this.fields.outTime.hide();
        this.fields.rIndex.hide();
    }

  };

  /**
   * Description
   * @method onTypeChange
   * @param {} evt
   * @return 
   */
  InsertLink.prototype.onTypeChange = function(evt){
    this.toggleFields();
  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  InsertLink.prototype.onApplyClick = function(evt){
    var type = this.fields.type.getValue(),
      url;

    switch(type){
      case 'page':
        url = '#p='+ this.fields.page.getValue();
        break;

      case 'time':
        url = '#t='+ this.fields.inTime.getValue() +','+ this.fields.outTime.getValue();
        url += '&r='+ this.fields.rIndex.getValue();
        break;

      default:
        url = this.fields.url.getValue();
    }

    this.triggerEvent('submit', {'overlay': this, 'url': url}, true, false);

    this.hide();
  };

  /**
   * Description
   * @method onCancelClick
   * @param {} evt
   * @return 
   */
  InsertLink.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return InsertLink;

})();
/**
* Description
* @class LoadMask
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').LoadMask = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function LoadMask(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    LoadMask.parent.call(this, this.configs);

    this.addClass('loadmask');

    this.text = new metaScore.Dom('<div/>', {'class': 'text', 'text': this.configs.text})
      .appendTo(this.contents);
  }

  LoadMask.defaults = {
    /**
    * True to make this draggable
    */
    draggable: false,

    text: metaScore.Locale.t('editor.overlay.LoadMask.text', 'Loading...')
  };

  metaScore.editor.Overlay.extend(LoadMask);

  return LoadMask;

})();
/**
* Description
* @class Toolbar
* @namespace metaScore.editor.overlay
* @extends metaScore.Dom
*/

metaScore.namespace('editor.overlay').Toolbar = (function(){

  /**
   * Initialize
   * @constructor
   * @param {} configs
   */
  function Toolbar(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

    this.title = new metaScore.Dom('<div/>', {'class': 'title'})
      .appendTo(this);

    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);

    if(this.configs.title){
      this.title.text(this.configs.title);
    }
  }

  Toolbar.defaults = {
    /**
    * A text to add as a title
    */
    title: null
  };

  metaScore.Dom.extend(Toolbar);

  /**
   * Description
   * @method getTitle
   * @return MemberExpression
   */
  Toolbar.prototype.getTitle = function(){
    return this.title;
  };

  /**
   * Description
   * @method addButton
   * @param {} action
   * @return button
   */
  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  /**
   * Description
   * @method getButton
   * @param {} action
   * @return CallExpression
   */
  Toolbar.prototype.getButton = function(action){
    return this.buttons.children('[data-action="'+ action +'"]');
  };

  return Toolbar;

})();
/**
* Description
* @class iFrame
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').iFrame = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function iFrame(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    iFrame.parent.call(this, this.configs);

    this.addClass('iframe');
  }

  iFrame.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The iframe url
    */
    url: null
  };

  metaScore.editor.Overlay.extend(iFrame);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  iFrame.prototype.setupDOM = function(){
    // call parent method
    iFrame.parent.prototype.setupDOM.call(this);
    
    this.frame = new metaScore.Dom('<iframe/>', {'src': this.configs.url})
      .appendTo(this.contents);
  };

  return iFrame;

})();


} (this));