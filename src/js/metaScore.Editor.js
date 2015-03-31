/**
* The main editor class
* @class Editor
* @namespace metaScore
* @extends metaScore.Dom
*/

metaScore.Editor = (function(){

  /**
   * Description
   * @constructor
   * @param {} configs
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
      .getToolbar()
        .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onBlockPanelSelectorChange, this))
        .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this))        
        .addSelectorOption(null, '');

    this.panels.page
      .addListener('componentbeforeset', metaScore.Function.proxy(this.onPageBeforeSet, this))
      .addListener('componentset', metaScore.Function.proxy(this.onPageSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onPageUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onPagePanelValueChange, this))
      .getToolbar()
        .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onPagePanelSelectorChange, this))
        .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));

    this.panels.element
      .addListener('componentbeforeset', metaScore.Function.proxy(this.onElementBeforeSet, this))
      .addListener('componentset', metaScore.Function.proxy(this.onElementSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onElementUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onElementPanelValueChange, this))
      .getToolbar()
        .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onElementPanelSelectorChange, this))
        .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));

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

  /**
   * Description
   * @method setEditing
   * @param {} editing
   * @param {} sticky
   * @return 
   */
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
      this.player.getBody().toggleClass('editing', metaScore.editing);
    }
    
  };

  /**
   * Description
   * @method loadPlayerFromHash
   * @return 
   */
  Editor.prototype.loadPlayerFromHash = function(){
    var match;

    if(match = window.location.hash.match(/(#|&)guide=(\d+)/)){
      this.addPlayer(match[2]);
    }
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
    this.addPlayer(this.player.getId());
  };

  Editor.prototype.onPlayerKeydown = 
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

  Editor.prototype.onPlayerKeyup = 
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

  /**
   * Description
   * @method onMainmenuTimeFieldChange
   * @param {} evt
   * @return 
   */
  Editor.prototype.onMainmenuTimeFieldChange = function(evt){
    var field = evt.target._metaScore,
      time = field.getValue();

    this.player.media.setTime(time);
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

    this.player.setReadingIndex(value, true);
  };

  /**
   * Description
   * @method onTimeFieldIn
   * @param {} evt
   * @return 
   */
  Editor.prototype.onTimeFieldIn = function(evt){
    var field = evt.target._metaScore,
      time = this.player.media.getTime();

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

    this.player.media.setTime(time);
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
      
      this.panels.page.setComponent(block.getActivePage(), true);

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
    var block = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;

    this.history.add({
      'undo': metaScore.Function.proxy(this.panels.block.updateProperties, this.panels.block, [block, old_values]),
      'redo': metaScore.Function.proxy(this.panels.block.updateProperties, this.panels.block, [block, new_values])
    });
  };

  /**
   * Description
   * @method onBlockPanelToolbarClick
   * @param {} evt
   * @return 
   */
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
        blocks = this.player.getComponents('.media.video, .controller, .block');
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
        blocks = this.player.getComponents('.media.video, .controller, .block');
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
      dom = this.player.getComponent('.media#'+ id +', .controller#'+ id +', .block#'+ id);
      
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
      block = page.parents().parents().get(0)._metaScore;

    this.panels.block.setComponent(block);
  };

  /**
   * Description
   * @method onPageSet
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPageSet = function(evt){
    var page = evt.detail.component;

    this.panels.page.getToolbar().toggleMenuItem('new', true);

    this.panels.element.getToolbar()
      .toggleMenuItem('Cursor', true)
      .toggleMenuItem('Image', true)
      .toggleMenuItem('Text', true)
      .emptySelector()
      .addSelectorOption(null, '');
        
    page.getElements().each(function(index, element){
      this.panels.element.getToolbar().addSelectorOption(element._metaScore.getId(), element._metaScore.getName());
    }, this);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onPageUnset
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPageUnset = function(evt){
    this.panels.element.unsetComponent();
    this.panels.element.getToolbar()
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
    var page = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;

    this.history.add({
      'undo': metaScore.Function.proxy(this.panels.page.updateProperties, this.panels.page, [page, old_values]),
      'redo': metaScore.Function.proxy(this.panels.page.updateProperties, this.panels.page, [page, new_values])
    });
  };

  /**
   * Description
   * @method onPagePanelToolbarClick
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    var block, page,
      auto_page, configs,
      dom, count, index;

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
          
          if(block.getPageCount() < 1){
            configs = {};
            
            if(block.getProperty('synched')){
              configs['start-time'] = 0;
              configs['end-time'] = this.getPlayer().getMedia().getDuration();
            }
            
            auto_page = this.addPage(block, configs);
          }

          this.history.add({
            'undo': metaScore.Function.proxy(function(block, page, auto_page){
              if(auto_page){
                block.removePage(auto_page, true);
              }
              this.addPage(block, page);
            }, this, [block, page, auto_page]),
            'redo': metaScore.Function.proxy(function(block, page, auto_page){
              block.removePage(page, true);
              if(auto_page){
                this.addPage(block, auto_page);
              }
            }, this, [block, page, auto_page])
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
      dom = this.player.getComponent('.page#'+ id);
    
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
    var element = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;

    this.history.add({
      'undo': metaScore.Function.proxy(this.panels.element.updateProperties, this.panels.element, [element, old_values]),
      'redo': metaScore.Function.proxy(this.panels.element.updateProperties, this.panels.element, [element, new_values])
    });
  };

  /**
   * Description
   * @method onElementPanelToolbarClick
   * @param {} evt
   * @return 
   */
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
      dom = this.player.getComponent('.element#'+ id);
    
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
   * @method onPlayerMediaAdd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerMediaAdd = function(evt){
    var media = evt.detail.media;
    
    if(media.is('.video')){
      this.panels.block.getToolbar().addSelectorOption(media.getId(), media.getName());
    }
  };

  /**
   * Description
   * @method onPlayerControllerAdd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerControllerAdd = function(evt){
    var controller = evt.detail.controller;

    this.panels.block.getToolbar().addSelectorOption(controller.getId(), controller.getName());
  };

  /**
   * Description
   * @method onPlayerBlockAdd
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerBlockAdd = function(evt){
    var block = evt.detail.block;

    this.panels.block.getToolbar().addSelectorOption(block.getId(), block.getName());
  };

  /**
   * Description
   * @method onPlayerLoadSuccess
   * @param {} evt
   * @return 
   */
  Editor.prototype.onPlayerLoadSuccess = function(evt){
    var player = evt.detail.player,
      data = evt.detail.data;

    this.player = player;

    this.player.getBody()
      .addClass('in-editor')
      .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
      .addDelegate('.metaScore-component.block', 'pageadd', metaScore.Function.proxy(this.onBlockPageAdded, this))
      .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivated, this))
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addListener('keydown', metaScore.Function.proxy(this.onPlayerKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onPlayerKeyup, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onPlayerTimeUpdate, this))
      .addListener('rindex', metaScore.Function.proxy(this.onPlayerReadingIndex, this));

    this.setEditing(true);
    this.updateMainmenu();
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
      this.panels.element.unsetComponent();
      this.panels.page.setComponent(component);
    }
    else{
      this.panels.element.unsetComponent();
      this.panels.page.unsetComponent();
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
   * @method onBlockPageAdded
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockPageAdded = function(evt){
    var block = evt.detail.block;
    
    if(block === this.panels.block.getComponent()){    
      this.updatePageSelector();
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onBlockPageActivated
   * @param {} evt
   * @return 
   */
  Editor.prototype.onBlockPageActivated = function(evt){
    if(metaScore.editing !== true){
      return;
    }

    this.panels.page.setComponent(evt.detail.page);
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

    this.player.updateCSS(values.css);
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
   * Description
   * @method updateMainmenu
   * @return 
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
  };

  /**
   * Description
   * @method updatePageSelector
   * @return 
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
   * @return 
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
      .addListener('mediaadd', metaScore.Function.proxy(this.onPlayerMediaAdd, this))
      .addListener('controlleradd', metaScore.Function.proxy(this.onPlayerControllerAdd, this))
      .addListener('blockadd', metaScore.Function.proxy(this.onPlayerBlockAdd, this))
      .addListener('loadsuccess', metaScore.Function.proxy(this.onPlayerLoadSuccess, this))
      .addListener('loaderror', metaScore.Function.proxy(this.onPlayerLoadError, this));
  };

  /**
   * Description
   * @method removePlayer
   * @return 
   */
  Editor.prototype.removePlayer = function(){
    if(this.player){
      this.player.remove();
      delete this.player;
    }

    this.panels.block.unsetComponent();
    this.updateMainmenu();
  };

  /**
   * Description
   * @method addBlock
   * @param {} block
   * @return block
   */
  Editor.prototype.addBlock = function(block){
    if(!(block instanceof metaScore.player.component.Block)){
      block = this.player.addBlock(block);
    }

    this.panels.block.setComponent(block);

    return block;
  };

  /**
   * Description
   * @method addPage
   * @param {} block
   * @param {} page
   * @return page
   */
  Editor.prototype.addPage = function(block, page){
    if(!(page instanceof metaScore.player.component.Page)){
      page = block.addPage(page);
    }

    this.panels.page.setComponent(page);

    return page;
  };

  /**
   * Description
   * @method addElement
   * @param {} page
   * @param {} element
   * @return element
   */
  Editor.prototype.addElement = function(page, element){
    if(!(element instanceof metaScore.player.component.Element)){
      element = page.addElement(element);
    }

    this.panels.element.setComponent(element);

    return element;
  };

  /**
   * Description
   * @method openGuideSelector
   * @return 
   */
  Editor.prototype.openGuideSelector = function(){
    new metaScore.editor.overlay.GuideSelector({
        'url': this.configs.api_url +'guide.json',
        'autoShow': true
      })
      .addListener('select', metaScore.Function.proxy(this.openGuide, this));
  };

  /**
   * Description
   * @method openGuide
   * @param {} evt
   * @return 
   */
  Editor.prototype.openGuide = function(evt){
    this.addPlayer(evt.detail.guide.id);
  };

  /**
   * Description
   * @method saveGuide
   * @return 
   */
  Editor.prototype.saveGuide = function(){
    var components = this.player.getComponents('.media, .controller, .block'),
      id = this.player.getId(),
      data = this.detailsOverlay.getValues(),
      component, options;

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