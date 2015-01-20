/*! metaScore - v0.0.2 - 2015-01-20 - Oussama Mubarak */
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
    this.detailsOverlay = new metaScore.editor.overlay.GuideInfo();

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
      .addListener('valueschange', metaScore.Function.proxy(this.onPagePanelValueChange, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));

    this.panels.element
      .addListener('componentset', metaScore.Function.proxy(this.onElementSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onElementUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onElementPanelValueChange, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));

    this.history
      .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
      .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
      .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));

    this.detailsOverlay
      .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this));

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
   
   new metaScore.Dom(window)
      .addListener('beforeunload', metaScore.Function.proxy(this.onBeforeUnload, this));

    this.updateMainmenu();
    this.setEditing(false);
    this.loadPlayerFromHash();
  }

  metaScore.Dom.extend(Editor);

  Editor.defaults = {
    'ajax': {}
  };

  Editor.prototype.setEditing = function(editing, sticky){
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

    if(this.player){
      this.player.toggleClass('editing', metaScore.editing);
    }
  };

  Editor.prototype.loadPlayerFromHash = function(){
    var match;

    if(match = window.location.hash.match(/(#|&)guide=(\d+)/)){
      this.addPlayer(match[2]);
    }
  };

  Editor.prototype.onGuideSaveSuccess = function(xhr){
    this.loadmask.hide();
    delete this.loadmask;
  };

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

  Editor.prototype.onGuideDeleteConfirm = function(){
    var id = this.player.getId(),
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

  Editor.prototype.onGuideDeleteSuccess = function(xhr){
    this.removePlayer();

    this.loadmask.hide();
    delete this.loadmask;
  };

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

  Editor.prototype.onGuideRevertConfirm = function(){
    this.addPlayer(this.player.getId());
  };

  Editor.prototype.onPlayerKeydown = Editor.prototype.onKeydown = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        if(!evt.repeat){
          this.setEditing(!this.persistentEditing, false);
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
        this.setEditing(this.persistentEditing, false);
        evt.preventDefault();
        break;
    }
  };

  Editor.prototype.onMainmenuClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
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
      this.panels.page.getToolbar().toggleMenuItem('new', true);

      this.panels.element.getToolbar()
        .toggleMenuItem('Cursor', true)
        .toggleMenuItem('Image', true)
        .toggleMenuItem('Text', true);
    }

    evt.stopPropagation();
  };

  Editor.prototype.onBlockUnset = function(evt){
    this.panels.page.unsetComponent();
    this.panels.page.getToolbar().toggleMenuItem('new', false);
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
        blocks = this.player.getComponents(['media', 'controller', 'block']);
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
        blocks = this.player.getComponents(['media', 'controller', 'block']);
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

    this.panels.block.setComponent(block);

    this.panels.page.getToolbar().toggleMenuItem('new', true);

    this.panels.element.getToolbar()
      .toggleMenuItem('Cursor', true)
      .toggleMenuItem('Image', true)
      .toggleMenuItem('Text', true);

    evt.stopPropagation();
  };

  Editor.prototype.onPageUnset = function(evt){
    this.panels.element.unsetComponent();
    this.panels.element.getToolbar()
      .toggleMenuItem('Cursor', false)
      .toggleMenuItem('Image', false)
      .toggleMenuItem('Text', false);
  };

  Editor.prototype.onPagePanelValueChange = function(evt){
    var page = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;

    this.history.add({
      'undo': metaScore.Function.proxy(this.panels.page.updateProperties, this.panels.page, [page, old_values]),
      'redo': metaScore.Function.proxy(this.panels.page.updateProperties, this.panels.page, [page, new_values])
    });
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
          block.removePage(page);
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

    this.panels.page.setComponent(page);
    this.panels.block.setComponent(block);

    if(element.getProperty('type') === 'Text'){
      this.panels.text.setComponent(element);
    }

    evt.stopPropagation();
  };

  Editor.prototype.onElementUnset = function(evt){
    this.panels.text.unsetComponent();

    evt.stopPropagation();
  };

  Editor.prototype.onElementPanelValueChange = function(evt){
    var element = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;

    this.history.add({
      'undo': metaScore.Function.proxy(this.panels.element.updateProperties, this.panels.element, [element, old_values]),
      'redo': metaScore.Function.proxy(this.panels.element.updateProperties, this.panels.element, [element, new_values])
    });
  };

  Editor.prototype.onElementPanelToolbarClick = function(evt){
    var page, element, dom, count, index,
      action = metaScore.Dom.data(evt.target, 'action');

    switch(action){
      case 'Cursor':
      case 'Image':
      case 'Text':
        page = this.panels.page.getComponent();
        element = this.addElement(page, {'type': action});

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

  Editor.prototype.onPlayerMediaAdd = function(evt){
    var media = evt.detail.media;

    this.panels.block.getToolbar().addComponent(media);
  };

  Editor.prototype.onPlayerControllerAdd = function(evt){
    var controller = evt.detail.controller;

    this.panels.block.getToolbar().addComponent(controller);
  };

  Editor.prototype.onPlayerBlockAdd = function(evt){
    var block = evt.detail.block;

    this.panels.block.getToolbar().addComponent(block);
  };

  Editor.prototype.onPlayerLoadSuccess = function(evt){
    var player = evt.detail.player,
      data = evt.detail.data;

    this.player = player;

    this.player
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addListener('keydown', metaScore.Function.proxy(this.onPlayerKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onPlayerKeyup, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onPlayerTimeUpdate, this))
      .addListener('rindex', metaScore.Function.proxy(this.onPlayerReadingIndex, this))
      .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
      .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivated, this));

    this.setEditing(true);
    this.updateMainmenu();
    this.detailsOverlay.setValues(data);

    window.history.replaceState(null, null, '#guide='+ this.player.getId());

    this.loadmask.hide();
    delete this.loadmask;
  };

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
    this.updateMainmenu();
  };

  Editor.prototype.onHistoryUndo = function(evt){
    this.updateMainmenu();
  };

  Editor.prototype.onHistoryRedo = function(evt){
    this.updateMainmenu();
  };

  Editor.prototype.onDetailsOverlaySubmit = function(evt){
    var values = evt.detail.values;

    this.player.updateCSS(values.css);
  };

  Editor.prototype.onBeforeUnload = function(evt){  
    if(this.hasOwnProperty('player')){
      evt.returnValue = metaScore.Locale.t('editor.onBeforeUnload.msg', 'Any unsaved data will be lost.');
    }
  };

  Editor.prototype.updateMainmenu = function(){
    var hasPlayer = this.hasOwnProperty('player');

    this.mainmenu.toggleButton('edit', hasPlayer);
    this.mainmenu.toggleButton('save', hasPlayer);
    this.mainmenu.toggleButton('delete', hasPlayer);
    this.mainmenu.toggleButton('download', hasPlayer);

    this.mainmenu.toggleButton('undo', this.history.hasUndo());
    this.mainmenu.toggleButton('redo', this.history.hasRedo());
    this.mainmenu.toggleButton('revert', hasPlayer);
  };

  Editor.prototype.addPlayer = function(id){
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });

    this.removePlayer();

    new metaScore.Player({
        container: this.workspace,
        url: this.configs.api_url +'guide/'+ id +'.json'
      })
      .addClass('in-editor')
      .addListener('mediaadd', metaScore.Function.proxy(this.onPlayerMediaAdd, this))
      .addListener('controlleradd', metaScore.Function.proxy(this.onPlayerControllerAdd, this))
      .addListener('blockadd', metaScore.Function.proxy(this.onPlayerBlockAdd, this))
      .addListener('loadsuccess', metaScore.Function.proxy(this.onPlayerLoadSuccess, this))
      .addListener('loaderror', metaScore.Function.proxy(this.onPlayerLoadError, this));
  };

  Editor.prototype.removePlayer = function(){
    if(this.player){
      this.player.remove();
      delete this.player;
    }

    this.panels.block.unsetComponent();
    this.updateMainmenu();
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

  Editor.prototype.openGuideSelector = function(){
    new metaScore.editor.overlay.GuideSelector({
        'url': this.configs.api_url +'guide.json',
        'autoShow': true
      })
      .addListener('select', metaScore.Function.proxy(this.openGuide, this));
  };

  Editor.prototype.openGuide = function(evt){
    this.addPlayer(evt.detail.guide.id);
  };

  Editor.prototype.saveGuide = function(){
    var components = this.player.getComponents(),
      id = this.player.getId(),
      component,  options,
      data = this.detailsOverlay.getValues();

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
/**
 * Button
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('editor').Button = (function () {

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

  Button.prototype.onClick = function(evt){
    if(this.disabled){
      evt.stopPropagation();
    }
  };

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
  * @returns {object} the XMLHttp object
  */
  Button.prototype.disable = function(){
    this.disabled = true;

    this.addClass('disabled');

    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Button.prototype.enable = function(){
    this.disabled = false;

    this.removeClass('disabled');

    return this;
  };

  return Button;

})();
/**
 * DropDownMenu
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('editor').DropDownMenu = (function () {

  function DropDownMenu(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
  }

  metaScore.Dom.extend(DropDownMenu);

  DropDownMenu.prototype.addItem = function(action, label){
    var item = new metaScore.Dom('<li/>', {'data-action': action, 'text': label})
      .appendTo(this);

    return item;
  };

  DropDownMenu.prototype.toggleItem = function(action, state){
    this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

    return this;
  };

  return DropDownMenu;

})();
/**
 * Field
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('editor').Field = (function () {

  function Field(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<div/>', {'class': 'field'});

    this.setupUI();

    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;

    this.disabled = false;

    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }

    if(this.configs.disabled){
      this.disable();
    }
  }

  Field.defaults = {
    /**
    * Defines the default value
    */
    value: null,

    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };

  metaScore.Dom.extend(Field);

  Field.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }

    this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
  };

  Field.prototype.onChange = function(evt){
    this.value = this.input.val();

    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  Field.prototype.setValue = function(value, supressEvent){
    this.input.val(value);
    this.value = value;

    if(supressEvent !== true){
      this.input.triggerEvent('change');
    }
  };

  Field.prototype.getValue = function(){
    return this.value;
  };

  /**
  * Disable the field
  * @returns {object} the XMLHttp object
  */
  Field.prototype.disable = function(){
    this.disabled = true;

    this.addClass('disabled');
    this.input.attr('disabled', 'disabled');

    return this;
  };

  /**
  * Enable the field
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Field.prototype.enable = function(){
    this.disabled = false;

    this.removeClass('disabled');
    this.input.attr('disabled', null);

    return this;
  };

  return Field;

})();
/**
 * Undo
 *
 * @requires ../metaScore.evented.js
 */

metaScore.namespace('editor').History = (function(){

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

  History.prototype.execute = function(command, action) {
    if (command && (action in command)) {
      this.executing = true;
      command[action](command);
      this.executing = false;
    }

    return this;
  };

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

  History.prototype.clear = function () {
    var length = this.commands.length;

    this.commands = [];
    this.index = -1;

    if(length > 0) {
      this.triggerEvent('clear');
    }

  };

  History.prototype.hasUndo = function(){
    return this.index !== -1;
  };

  History.prototype.hasRedo = function(){
    return this.index < (this.commands.length - 1);
  };

  return History;

})();
/**
 * MainMenu
 *
 * @requires metaScore.editor.button.js
 * @requires field/metaScore.editor.field.timefield.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.namespace('editor').MainMenu = (function(){

  function MainMenu() {
    // call parent constructor
    MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});

    this.setupUI();
  }

  metaScore.Dom.extend(MainMenu);

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
        min: 0
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

  MainMenu.prototype.toggleButton = function(action, state){
    this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

    return this;
  };

  return MainMenu;

})();
/**
 * Overlay
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('editor').Overlay = (function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  function Overlay(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});

    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }

    if(this.configs.autoShow){
      this.show();
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

  Overlay.prototype.show = function(){
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }

    this.appendTo(this.configs.parent);

    return this;
  };

  Overlay.prototype.hide = function(){
    if(this.configs.modal){
      this.mask.remove();
    }

    this.remove();

    return this;
  };

  Overlay.prototype.getToolbar = function(){
    return this.toolbar;
  };

  Overlay.prototype.getContents = function(){
    return this.contents;
  };

  Overlay.prototype.onCloseClick = function(){
    this.hide();
  };

  return Overlay;

})();
/**
 * Panel
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */

metaScore.namespace('editor').Panel = (function(){

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

    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);

    this
      .addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
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

  Panel.prototype.setupFields = function(properties){
    var row, uuid, configs, fieldType, field;

    this.fields = {};
    this.contents.empty();

    metaScore.Object.each(properties, function(key, prop){
      if(prop.editable !== false){
        row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper '+ key})
          .appendTo(this.contents);

        uuid = 'field-'+ metaScore.String.uuid(5);

        configs = prop.configs || {};

        field = new metaScore.editor.field[prop.type](configs)
          .attr('id', uuid)
          .data('name', key);

        new metaScore.Dom('<td/>')
          .appendTo(row)
          .append(new metaScore.Dom('<label/>', {'text': prop.label, 'for': uuid}));

        new metaScore.Dom('<td/>')
          .appendTo(row)
          .append(field);

        this.fields[key] = field;
      }
    }, this);

    return this;
  };

  Panel.prototype.getToolbar = function(){
    return this.toolbar;
  };

  Panel.prototype.getField = function(key){
    if(key === undefined){
      return this.fields;
    }

    return this.fields[key];
  };

  Panel.prototype.enableFields = function(){
    metaScore.Object.each(this.fields, function(key, field){
      field.enable();
    }, this);
  };

  Panel.prototype.showField = function(key){
    this.contents.children('tr.field-wrapper.'+ key).show();
  };

  Panel.prototype.hideField = function(key){
    this.contents.children('tr.field-wrapper.'+ key).hide();
  };

  Panel.prototype.toggleState = function(){
    this.toggleClass('collapsed');
  };

  Panel.prototype.disable = function(){
    this.addClass('disabled');
  };

  Panel.prototype.enable = function(){
    this.removeClass('disabled');
  };

  Panel.prototype.getComponent = function(){
    return this.component;
  };

  Panel.prototype.getDraggable = function(){
    return false;
  };

  Panel.prototype.getResizable = function(){
    return false;
  };

  Panel.prototype.setComponent = function(component, supressEvent){
    var draggable, resizable;

    if(component !== this.getComponent()){
      this.unsetComponent(true);

      this.component = component;

      this
        .setupFields(this.component.configs.properties)
        .updateFieldValues(this.getValues(Object.keys(this.getField())), true)
        .addClass('has-component');

      if(!(component instanceof metaScore.player.component.Controller)){
        this.getToolbar().toggleMenuItem('delete', true);
      }

      draggable = this.getDraggable();
      if(draggable){
        component._draggable = new metaScore.Draggable(draggable);
        component
          .addListener('dragstart', this.onComponentDragStart)
          .addListener('drag', this.onComponentDrag)
          .addListener('dragend', this.onComponentDragEnd);
      }

      resizable = this.getResizable();
      if(resizable){
        component._resizable = new metaScore.Resizable(resizable);
        component
          .addListener('resizestart', this.onComponentResizeStart)
          .addListener('resize', this.onComponentResize)
          .addListener('resizeend', this.onComponentResizeEnd);
      }

      this.getToolbar().setComponent(component, true);

      component.addClass('selected');

      if(supressEvent !== true){
        this.triggerEvent('componentset', {'component': component}, false);
      }
    }

    return this;
  };

  Panel.prototype.unsetComponent = function(supressEvent){
    var component = this.getComponent();

    this.getToolbar().toggleMenuItem('delete', false);
    this.removeClass('has-component');

    if(component){
      if(component._draggable){
        component._draggable.destroy();
        delete component._draggable;

        component
          .removeListener('dragstart', this.onComponentDragStart)
          .removeListener('drag', this.onComponentDrag)
          .removeListener('dragend', this.onComponentDragEnd);
      }

      if(component._resizable){
        component._resizable.destroy();
        delete component._resizable;

        component
          .removeListener('resizestart', this.onComponentResizeStart)
          .removeListener('resize', this.onComponentResize)
          .removeListener('resizeend', this.onComponentResizeEnd);
      }

      component.removeClass('selected');

      this.getToolbar().setComponent(null, true);

      delete this.component;

      if(supressEvent !== true){
        this.triggerEvent('componentunset', {'component': component}, false);
      }
    }

    return this;
  };

  Panel.prototype.onComponentDragStart = function(evt){
    var fields = ['x', 'y'];

    this._beforeDragValues = this.getValues(fields);
  };

  Panel.prototype.onComponentDrag = function(evt){
    var fields = ['x', 'y'];

    this.updateFieldValues(fields, true);
  };

  Panel.prototype.onComponentDragEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y'];

    this.updateFieldValues(fields, true);

    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);

    delete this._beforeDragValues;
  };

  Panel.prototype.onComponentResizeStart = function(evt){
    var fields = ['x', 'y', 'width', 'height'];

    this._beforeResizeValues = this.getValues(fields);
  };

  Panel.prototype.onComponentResize = function(evt){
    var fields = ['x', 'y', 'width', 'height'];

    this.updateFieldValues(fields, true);
  };

  Panel.prototype.onComponentResizeEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y', 'width', 'height'];

    this.updateFieldValues(fields, true);

    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);

    delete this._beforeResizeValues;
  };

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

    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
  };

  Panel.prototype.updateFieldValue = function(name, value, supressEvent){
    this.getField(name).setValue(value, supressEvent);
  };

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

  Panel.prototype.updateProperties = function(component, values){
    metaScore.Object.each(values, function(name, value){
      if(!this.getField(name).disabled){
        component.setProperty(name, value);
      }
    }, this);

    this.updateFieldValues(values, true);

    return this;
  };

  Panel.prototype.getValue = function(name){
    return this.getComponent().getProperty(name);
  };

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
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Boolean = (function () {

  function BooleanField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BooleanField.parent.call(this, this.configs);

    this.addClass('booleanfield');

    if(this.configs.checked){
      this.input.attr('checked', 'checked');
    }
  }

  BooleanField.defaults = {
    /**
    * Defines the default value
    */
    value: true,

    /**
    * Defines the value when checked
    */
    checked_value: true,

    /**
    * Defines the value when unchecked
    */
    unchecked_value: false,

    /**
    * Defines whether the field is checked by default
    */
    checked: false
  };

  metaScore.editor.Field.extend(BooleanField);

  BooleanField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }

    this.input = new metaScore.Dom('<input/>', {'type': 'checkbox', 'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
  };

  BooleanField.prototype.onChange = function(evt){
    this.value = this.input.is(":checked") ? this.input.val() : this.configs.unchecked_value;

    this.triggerEvent('valuechange', {'field': this, 'value': this.value ? this.configs.checked_value : this.configs.unchecked_value}, true, false);
  };

  BooleanField.prototype.setValue = function(value, supressEvent){
    this.input.attr('checked', value ? 'checked' : '');

    if(supressEvent !== true){
      this.input.triggerEvent('change');
    }
  };

  return BooleanField;

})();
/**
 * BorderRadiusrField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').BorderRadius = (function () {

  function BorderRadiusrField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BorderRadiusrField.parent.call(this, this.configs);

    this.addClass('borderradiusrfield');
  }

  metaScore.editor.Field.extend(BorderRadiusrField);

  BorderRadiusrField.prototype.setupUI = function(){
    BorderRadiusrField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.overlay = new metaScore.editor.overlay.BorderRadius()
      .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this);
  };

  BorderRadiusrField.prototype.setValue = function(value, supressEvent){
    BorderRadiusrField.parent.prototype.setValue.call(this, value, supressEvent);

    this.input.attr('title', value);
  };

  BorderRadiusrField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }

    this.overlay
      .setValue(this.value)
      .show();
  };

  BorderRadiusrField.prototype.onOverlaySubmit = function(evt){
    var value = evt.detail.value,
      overlay = evt.detail.overlay;

    this.setValue(value);
  };

  BorderRadiusrField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };

  return BorderRadiusrField;

})();
/**
 * ButtonsField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Buttons = (function () {

  function ButtonsField(configs) {
    this.configs = this.getConfigs(configs);

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

  ButtonsField.prototype.setValue = function(){
  };

  ButtonsField.prototype.setupUI = function(){
    var field = this;

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
        .appendTo(this);
    }

    metaScore.Object.each(this.configs.buttons, function(key, attr){
      new metaScore.Dom('<button/>', attr)
        .addListener('click', function(){
          field.triggerEvent('valuechange', {'field': field, 'value': key}, true, false);
        })
        .appendTo(this);
    }, this);
  };

  return ButtonsField;

})();
/**
 * ColorField
 *
 * @requires ../metaScore.editor.field.js
 * @requires ../../helpers/metaScore.object.js
 */

metaScore.namespace('editor.field').Color = (function () {

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

  ColorField.prototype.setupUI = function(){
    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
        .appendTo(this);
    }

    this.button = new metaScore.editor.Button()
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.overlay = new metaScore.editor.overlay.ColorSelector()
      .addListener('select', metaScore.Function.proxy(this.onColorSelect, this));

    this.button.appendTo(this);
  };

  ColorField.prototype.setValue = function(val, supressEvent){

    this.value = metaScore.Color.parse(val);

    this.button.css('background-color', 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')');

    if(supressEvent !== true){
      this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
    }

  };

  ColorField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }

    this.overlay
      .setValue(metaScore.Object.copy(this.value))
      .show();
  };

  ColorField.prototype.onColorSelect = function(evt){
    var value = evt.detail.value,
      overlay = evt.detail.overlay;

    this.setValue(value);
  };

  return ColorField;

})();
/* global Drupal */
/**
 * ImageField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Image = (function () {

  function ImageField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    ImageField.parent.call(this, this.configs);

    this.addClass('imagefield');
  }

  metaScore.editor.Field.extend(ImageField);

  ImageField.prototype.setupUI = function(){
    ImageField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this);
  };

  ImageField.prototype.setValue = function(value, supressEvent){
    ImageField.parent.prototype.setValue.call(this, value, supressEvent);

    this.input.attr('title', value);
  };

  ImageField.prototype.onClick = function(evt){
    Drupal.media.popups.mediaBrowser(metaScore.Function.proxy(this.onFileSelect, this));
  };

  ImageField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };

  ImageField.prototype.onFileSelect = function(files){
    if(files.length > 0){
      this.setValue(files[0].url +'?fid='+ files[0].fid);
    }
  };

  return ImageField;

})();
/**
 * NumberField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Number = (function () {

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

  NumberField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }

    this.input = new metaScore.Dom('<input/>', {'type': 'number', 'id': uid, 'min': this.configs.min, 'max': this.configs.max, 'step': this.configs.step})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
  };

  return NumberField;

})();
/**
 * SelectField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Select = (function () {

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

  SelectField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }

    this.input = new metaScore.Dom('<select/>', {'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);

      metaScore.Object.each(this.configs.options, function(key, value){
        this.addOption(key, value);
      }, this);
  };

  SelectField.prototype.addOption = function(value, text){
    this.input.append(new metaScore.Dom('<option/>', {'value': value, 'text': text}));

    return this;
  };

  SelectField.prototype.removeOption = function(value){
    this.input.child('[value="'+ value +'"]').remove();

    return this;
  };

  return SelectField;

})();
/**
 * TextField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Text = (function () {

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
 * TextareaField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Textarea = (function () {

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

  TextareaField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }

    this.input = new metaScore.Dom('<textarea/>', {'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
  };

  return TextareaField;

})();
/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Time = (function () {

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

  TimeField.prototype.setupUI = function(){
    var buttons;

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
        .appendTo(this);
    }

    if(this.configs.checkbox){
      this.checkbox = new metaScore.Dom('<input/>', {'type': 'checkbox'})
        .addListener('change', metaScore.Function.proxy(this.onInput, this))
        .appendTo(this);
     }

    this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);

    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this);

    this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);

    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this);

    this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);

    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'})
      .appendTo(this);

    this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);

    if(this.configs.inButton || this.configs.outButton){
      buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
        .appendTo(this);

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

  TimeField.prototype.onChange = function(evt){
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  TimeField.prototype.onInput = function(evt){
    var active = this.isActive(),
      centiseconds_val, seconds_val, minutes_val, hours_val;

    if(active){
      centiseconds_val = parseInt(this.centiseconds.val(), 10);
      seconds_val = parseInt(this.seconds.val(), 10);
      minutes_val = parseInt(this.minutes.val(), 10);
      hours_val = parseInt(this.hours.val(), 10);

      this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
    }
    else{
      this.setValue(null);
    }

    evt.stopPropagation();
  };

  TimeField.prototype.onInClick = function(evt){
    this.triggerEvent('valuein');
  };

  TimeField.prototype.onOutClick = function(evt){
    this.triggerEvent('valueout');
  };

  TimeField.prototype.setValue = function(milliseconds, supressEvent){
    var centiseconds_val, seconds_val, minutes_val, hours_val;

    milliseconds = parseFloat(milliseconds);

    if(isNaN(milliseconds)){
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
      this.value = milliseconds;

      if(this.configs.min !== null){
        this.value = Math.max(this.value, this.configs.min);
      }
      if(this.configs.max !== null){
        this.value = Math.min(this.value, this.configs.max);
      }

      centiseconds_val = parseInt((this.value / 10) % 100, 10);
      seconds_val = parseInt((this.value / 1000) % 60, 10);
      minutes_val = parseInt((this.value / 60000) % 60, 10);
      hours_val = parseInt((this.value / 3600000), 10);

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
  *
  */
  TimeField.prototype.isActive = function(){
    return !this.checkbox || this.checkbox.is(":checked");
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
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
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
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
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.numberfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 * @requires ../../helpers/metaScore.string.js
 * @requires ../../helpers/metaScore.resizable.js
 * @requires ../../helpers/metaScore.resizable.js
 */

metaScore.namespace('editor.panel').Block = (function () {

  function BlockPanel(configs) {
    // call parent constructor
    BlockPanel.parent.call(this, configs);
  }

  BlockPanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Block.title', 'Block'),
      menuItems: {
        'new': metaScore.Locale.t('editor.panel.Block.menuItems.new', 'Add a new block'),
        'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
      }
    })
  };

  metaScore.editor.Panel.extend(BlockPanel);

  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();

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

  BlockPanel.prototype.getResizable = function(){
    var component = this.getComponent();

    if(component instanceof metaScore.player.component.Controller){
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
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.numberfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 * @requires ../../helpers/metaScore.string.js
 * @requires ../../helpers/metaScore.resizable.js
 * @requires ../../helpers/metaScore.resizable.js
 */

metaScore.namespace('editor.panel').Element = (function () {

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

  ElementPanel.prototype.getDraggable = function(){
    var component = this.getComponent();

    return {
      'target': component,
      'handle': component,
      'container': component.parents()
    };
  };

  ElementPanel.prototype.getResizable = function(){
    var component = this.getComponent();

    return {
      'target': component,
      'container': component.parents()
    };
  };

  return ElementPanel;

})();
/**
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.numberfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 * @requires ../../helpers/metaScore.string.js
 * @requires ../../helpers/metaScore.resizable.js
 * @requires ../../helpers/metaScore.resizable.js
 */

metaScore.namespace('editor.panel').Page = (function () {

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
 * Block
 *
 * @requires ../metaScore.editor.Panel.js
 * @requires ../field/metaScore.editor.field.Color.js
 * @requires ../field/metaScore.editor.field.Select.js
 * @requires ../field/metaScore.editor.field.Buttons.js
 * @requires ../../helpers/metaScore.String.js
 * @requires ../../helpers/metaScore.Function.js
 * @requires ../../helpers/metaScore.Color.js
 */

metaScore.namespace('editor.panel').Text = (function () {

  function TextPanel(configs) {
    // call parent constructor
    TextPanel.parent.call(this, configs);

    // fix event handlers scope
    this.onComponentContentsClick = metaScore.Function.proxy(this.onComponentContentsClick, this);
    this.onComponentContentsDblClick = metaScore.Function.proxy(this.onComponentContentsDblClick, this);
  }

  TextPanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Text.title', 'Text'),
      buttons: [],
      selector: false
    }),

    properties: {
      'fore-color': {
        'type': 'Color',
        'label': metaScore.Locale.t('editor.panel.Text.fore-color', 'Font color'),
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.execCommand('foreColor', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'back-color': {
        'type': 'Color',
        'label': metaScore.Locale.t('editor.panel.Text.back-color', 'Background color'),
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.execCommand('backColor', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'font': {
        'type': 'Select',
        'label': metaScore.Locale.t('editor.panel.Text.font', 'Font'),
        'configs': {
          'options': {
            'Georgia, serif': 'Georgia',
            '"Times New Roman", Times, serif': 'Times New Roman',
            'Arial, Helvetica, sans-serif': 'Arial',
            '"Comic Sans MS", cursive, sans-serif': 'Comic Sans MS',
            'Impact, Charcoal, sans-serif': 'Impact',
            '"Lucida Sans Unicode", "Lucida Grande", sans-serif': 'Lucida Sans Unicode',
            'Tahoma, Geneva, sans-serif': 'Tahoma',
            'Verdana, Geneva, sans-serif': 'Verdana',
            '"Courier New", Courier, monospace': 'Courier New',
            '"Lucida Console", Monaco, monospace': 'Lucida Console'
          }
        },
        'setter': function(value){
          this.execCommand('fontName', value);
        }
      },
      'font-style': {
        'type': 'Buttons',
        'label': metaScore.Locale.t('editor.panel.Text.font-style', 'Font style'),
        'configs': {
          'buttons': {
            'bold': {
              'data-action': 'bold',
              'title': metaScore.Locale.t('editor.panel.Text.font-style.bold', 'Bold')
            },
            'italic': {
              'data-action': 'italic',
              'title': metaScore.Locale.t('editor.panel.Text.font-style.italic', 'Italic')
            }
          }
        },
        'setter': function(value){
          this.execCommand(value);
        }
      },
      'font-style2': {
        'type': 'Buttons',
        'label': '&nbsp;',
        'configs': {
          'buttons': {
            'strikeThrough': {
              'data-action': 'strikethrough',
              'title': metaScore.Locale.t('editor.panel.Text.font-style.strikeThrough', 'Strikethrough')
            },
            'underline': {
              'data-action': 'underline',
              'title': metaScore.Locale.t('editor.panel.Text.font-style.underline', 'Underline')
            },
            'subscript': {
              'data-action': 'subscript',
              'title': metaScore.Locale.t('editor.panel.Text.font-style.subscript', 'Subscript')
            },
            'superscript': {
              'data-action': 'superscript',
              'title': metaScore.Locale.t('editor.panel.Text.font-style.superscript', 'Superscript')
            }
          }
        },
        'setter': function(value){
          this.execCommand(value);
        }
      },
      'link': {
        'type': 'Buttons',
        'label': metaScore.Locale.t('editor.panel.Text.link', 'Link'),
        'configs': {
          'buttons': {
            'link': {
              'data-action': 'link',
              'title': metaScore.Locale.t('editor.panel.Text.link.link', 'Add/Modify')
            },
            'unlink': {
              'data-action': 'unlink',
              'title': metaScore.Locale.t('editor.panel.Text.link.unlink', 'Remove')
            }
          }
        },
        'setter': function(value){
          if(value === 'link'){
            var link = this.getSelectedElement();

            new metaScore.editor.overlay.LinkEditor({
                link: link && metaScore.Dom.is(link, 'a') ? link : null,
                autoShow: true
              })
              .addListener('submit', metaScore.Function.proxy(this.onLinkOverlaySubmit, this));
          }
          else{
            this.execCommand(value);
          }
        }
      }
    }
  };

  metaScore.editor.Panel.extend(TextPanel);

  TextPanel.prototype.onFieldValueChange = function(evt){
    var component = this.getComponent(),
      name, value, old_values;

    if(!component){
      return;
    }

    name = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues([name]);

    if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
      this.configs.properties[name].setter.call(this, value);
    }

    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
  };

  TextPanel.prototype.setComponent = function(component, supressEvent){
    if(component !== this.getComponent()){
      this.unsetComponent(true);

      this.component = component;

      this.addClass('has-component');

      component.contents.addListener('dblclick',this.onComponentContentsDblClick);
    }

    if(supressEvent !== true){
      this.triggerEvent('componentset', {'component': component}, false);
    }

    return this;
  };

  TextPanel.prototype.unsetComponent = function(supressEvent){
    var component = this.getComponent();

    this.removeClass('has-component');

    if(component){
      component.contents
        .attr('contenteditable', 'null')
        .removeListener('dblclick', this.onComponentContentsDblClick)
        .removeListener('click', this.onComponentContentsClick);

      this.component = null;

      if(supressEvent !== true){
        this.triggerEvent('componentunset', {'component': component}, false);
      }
    }

    return this;
  };

  TextPanel.prototype.onComponentContentsDblClick = function(evt){
    var component = this.getComponent();

    if(component._draggable){
      component._draggable.disable();
    }

    component.contents
      .attr('contenteditable', 'true')
      .removeListener('dblclick', this.onComponentContentsDblClick)
      .addListener('click', this.onComponentContentsClick);

    this.execCommand("styleWithCSS", true);

    this.setupFields(this.configs.properties);
    this.enable();
    this.updateFieldValues(this.getValues(Object.keys(this.getField())), true);
  };

  TextPanel.prototype.onComponentContentsClick = function(evt){
    evt.stopPropagation();
  };

  TextPanel.prototype.onLinkOverlaySubmit = function(evt){
    var url = evt.detail.url;

    this.execCommand('createLink', url);
  };

  TextPanel.prototype.getSelectedElement = function(){
     var component = this.getComponent(),
      contents =  component.contents.get(0),
      document = contents.ownerDocument,
      selection , element;

    if(document.selection){
      selection = document.selection;
    	element = selection.createRange().parentElement();
    }
    else{
    	selection = document.getSelection();
    	if(selection.rangeCount > 0){
        element = selection.getRangeAt(0).startContainer.parentNode;
      }
    }

    return element;
  };

  TextPanel.prototype.execCommand = function(command, value){
     var component = this.getComponent(),
      contents =  component.contents.get(0),
      document = contents.ownerDocument;

    contents.focus();

    return document.execCommand(command, false, value);
  };

  return TextPanel;

})();
/**
 * Toolbar
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('editor.panel').Toolbar = (function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
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
        .addOption(null, '')
        .appendTo(this);
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
    selector: false,

    menuItems: {}
  };

  metaScore.Dom.extend(Toolbar);

  Toolbar.prototype.getToggle = function(){
    return this.toggle;
  };

  Toolbar.prototype.getTitle = function(){
    return this.title;
  };

  Toolbar.prototype.getSelector = function(){
    return this.selector;
  };

  Toolbar.prototype.getMenu = function(){
    return this.menu;
  };

  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  Toolbar.prototype.getButton = function(action){
    return this.buttons.children('[data-action="'+ action +'"]');
  };

  Toolbar.prototype.addComponent = function(component){
    if(this.selector){
      this.selector.addOption(component.getId(), component.getName());
    }
  };

  Toolbar.prototype.setComponent = function(component, supressEvent){
    if(this.selector){
      this.selector.setValue(component ? component.getId() : null, supressEvent);
    }
  };

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
 * Alert
 *
 * @requires ./metaScore.editor.Overlay.js
 */

metaScore.namespace('editor.overlay').Alert = (function () {

  function Alert(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Alert.parent.call(this, this.configs);

    this.addClass('alert');

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

  Alert.prototype.setText = function(str){
    this.text.text(str);
  };

  Alert.prototype.addButton = function(action, label){
    var button = new metaScore.editor.Button()
      .setLabel(label)
      .data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  Alert.prototype.onButtonClick = function(evt){
    var action = new metaScore.Dom(evt.target).data('action');

    this.hide();

    this.triggerEvent(action +'click', {'alert': this}, false);

    evt.stopPropagation();
  };

  return Alert;

})();
/**
 * BorderRadius
 *
 * @requires ../metaScore.editor.Ovelay.js
 */

metaScore.namespace('editor.overlay').BorderRadius = (function () {

  function BorderRadius(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BorderRadius.parent.call(this, this.configs);

    this.addClass('border-radius');

    this.setupUI();
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

  BorderRadius.prototype.setupUI = function(){

    var contents = this.getContents();

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

  BorderRadius.prototype.getValue = function(){
    return this.preview.css('border-radius');
  };

  BorderRadius.prototype.onApplyClick = function(evt){  
    this.triggerEvent('submit', {'overlay': this, 'value': this.getValue()}, true, false);
    this.hide();
  };

  BorderRadius.prototype.onCancelClick = BorderRadius.prototype.onCloseClick;

  return BorderRadius;

})();
/**
 * ColorSelector
 *
 * @requires ../metaScore.editor.overlay.js
 * @requires ../../helpers/metaScore.ajax.js
 */

metaScore.namespace('editor.overlay').ColorSelector = (function () {

  function ColorSelector(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    ColorSelector.parent.call(this, this.configs);

    this.addClass('color-selector');

    // fix event handlers scope
    this.onGradientMousemove = metaScore.Function.proxy(this.onGradientMousemove, this);
    this.onAlphaMousemove = metaScore.Function.proxy(this.onAlphaMousemove, this);

    this.setupUI();
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

  ColorSelector.prototype.setupUI = function(){

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

  ColorSelector.prototype.setValue = function(val){
    this.previous_value = val;

    this.fillPrevious();

    this.updateValue(val);

    return this;
  };

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

  ColorSelector.prototype.fillPrevious = function(){
    var context = this.controls.previous.get(0).getContext('2d');

    context.fillStyle = "rgba("+ this.previous_value.r +","+ this.previous_value.g +","+ this.previous_value.b +","+ this.previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

  ColorSelector.prototype.fillCurrent = function(){
    var context = this.controls.current.get(0).getContext('2d');

    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

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

  ColorSelector.prototype.onControlInput = function(evt){
    var rgba, hsv;

    this.updateValue({
      'r': this.controls.r.val(),
      'g': this.controls.g.val(),
      'b': this.controls.b.val(),
      'a': this.controls.a.val()
    }, true, true, false);
  };

  ColorSelector.prototype.onGradientMousedown = function(evt){
    this.gradient.canvas.addListener('mousemove', this.onGradientMousemove);

    evt.stopPropagation();
  };

  ColorSelector.prototype.onGradientMouseup = function(evt){
    this.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);

    evt.stopPropagation();
  };

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

  ColorSelector.prototype.onAlphaMousedown = function(evt){
    this.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);

    evt.stopPropagation();
  };

  ColorSelector.prototype.onAlphaMouseup = function(evt){
    this.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);

    evt.stopPropagation();
  };

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

  ColorSelector.prototype.onApplyClick = function(evt){
    this.triggerEvent('select', {'overlay': this, 'value': this.value}, true, false);

    this.hide();
  };

  ColorSelector.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return ColorSelector;

})();
/**
 * GuideInfo
 *
 * @requires ../metaScore.editor.Ovelay.js
 * @requires ../../helpers/metaScore.ajax.js
 */

metaScore.namespace('editor.overlay').GuideInfo = (function () {

  function GuideInfo(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    GuideInfo.parent.call(this, this.configs);

    this.addClass('guide-details');

    this.setupUI();
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

  GuideInfo.prototype.setupUI = function(){

    var contents = this.getContents();

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

  GuideInfo.prototype.setValues = function(data){
    this.fields.title.setValue(data.title || null);
    this.fields.description.setValue(data.description || null);
    //this.fields.thumbnail.setValue(data.thumbnail || null);
    this.fields.css.setValue(data.css || null);
  };

  GuideInfo.prototype.getValues = function(){
    return {
      'title': this.fields.title.getValue(),
      'description': this.fields.description.getValue(),
      //'thumbnail': this.fields.thumbnail.getValue(),
      'css': this.fields.css.getValue()
    };
  };

  GuideInfo.prototype.onApplyClick = function(evt){
    this.triggerEvent('submit', {'overlay': this, 'values': this.getValues()}, true, false);
    this.hide();
  };

  GuideInfo.prototype.onCancelClick = GuideInfo.prototype.onCloseClick = function(evt){
    this.setValues(this.previousValues);
    this.hide();
  };

  GuideInfo.prototype.show = function(){
    this.previousValues = this.getValues();

    return GuideInfo.parent.prototype.show.call(this);
  };

  return GuideInfo;

})();
/**
 * GuideSelector
 *
 * @requires ../metaScore.editor.overlay.js
 * @requires ../../helpers/metaScore.ajax.js
 */

metaScore.namespace('editor.overlay').GuideSelector = (function () {

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

  GuideSelector.prototype.show = function(){
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });

    metaScore.Ajax.get(this.configs.url, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    });
  };

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

  GuideSelector.prototype.onLoadError = function(){
  };

  GuideSelector.prototype.onGuideClick = function(guide){
    this.triggerEvent('select', {'overlay': this, 'guide': guide}, true, false);

    this.hide();
  };

  return GuideSelector;

})();
/**
 * LinkEditor
 *
 * @requires ../metaScore.editor.Ovelay.js
 * @requires ../../helpers/metaScore.ajax.js
 */

metaScore.namespace('editor.overlay').LinkEditor = (function () {

  function LinkEditor(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    LinkEditor.parent.call(this, this.configs);

    this.addClass('link-editor');

    this.setupUI();
    this.toggleFields();

    if(this.configs.link){
      this.setValuesFromLink(this.configs.link);
    }
  }

  LinkEditor.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.LinkEditor.title', 'Link Editor'),

    /**
    * The current link
    */
    link: null
  };

  metaScore.editor.Overlay.extend(LinkEditor);

  LinkEditor.prototype.setupUI = function(){

    var contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    this.fields.type = new metaScore.editor.field.Select({
        label: metaScore.Locale.t('editor.overlay.LinkEditor.fields.type', 'Type'),
        options: {
          url: metaScore.Locale.t('editor.overlay.LinkEditor.fields.type.url', 'URL'),
          page: metaScore.Locale.t('editor.overlay.LinkEditor.fields.type.page', 'Page'),
          time: metaScore.Locale.t('editor.overlay.LinkEditor.fields.type.time', 'Time'),
        }
      })
      .addListener('valuechange', metaScore.Function.proxy(this.onTypeChange, this))
      .appendTo(contents);

    // URL
    this.fields.url = new metaScore.editor.field.Text({
        label: metaScore.Locale.t('editor.overlay.LinkEditor.fields.url', 'URL')
      })
      .appendTo(contents);

    // Page
    this.fields.page = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.LinkEditor.fields.page', 'Page')
      })
      .appendTo(contents);

    // Time
    this.fields.inTime = new metaScore.editor.field.Time({
        label: metaScore.Locale.t('editor.overlay.LinkEditor.fields.in-time', 'Start time'),
        inButton: true
      })
      .appendTo(contents);

    this.fields.outTime = new metaScore.editor.field.Time({
        label: metaScore.Locale.t('editor.overlay.LinkEditor.fields.out-time', 'End time'),
        inButton: true
      })
      .appendTo(contents);

    this.fields.rIndex = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.LinkEditor.fields.r-index', 'Reading index')
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

  LinkEditor.prototype.setValuesFromLink = function(link){
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

  LinkEditor.prototype.toggleFields = function(){
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

  LinkEditor.prototype.onTypeChange = function(evt){
    this.toggleFields();
  };

  LinkEditor.prototype.onApplyClick = function(evt){
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

  LinkEditor.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return LinkEditor;

})();
/**
 * LoadMask
 *
 * @requires ./metaScore.editor.Overlay.js
 */

metaScore.namespace('editor.overlay').LoadMask = (function () {

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
 * Toolbar
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('editor.overlay').Toolbar = (function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
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

  Toolbar.prototype.getTitle = function(){
    return this.title;
  };

  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  Toolbar.prototype.getButton = function(action){
    return this.buttons.children('[data-action="'+ action +'"]');
  };

  return Toolbar;

})();


} (this));