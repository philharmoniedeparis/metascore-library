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
        'setter': function(value){
          this.execCommand('foreColor', value ? 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')' : 'inherit');
        }
      },
      'backColor': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.back-color', 'Background color')
        },
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
        'setter': function(value){
          this.execCommand('fontName', value);
        }
      },
      'fontStyle': {
        'type': 'Buttons',
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.font-style', 'Font style'),
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
      'fontStyle2': {
        'type': 'Buttons',
        'configs': {
          'label': '&nbsp;',
          'buttons': {
            'strikeThrough': {
              'data-action': 'strikeThrough',
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
        'configs': {
          'label': metaScore.Locale.t('editor.panel.Text.link', 'Link'),
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
            var link = metaScore.Dom.closest(this.getSelectedElement(), 'a');

            new metaScore.editor.overlay.LinkEditor({
                link: link,
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

  TextPanel.prototype.lock = function(){
    var component = this.getComponent();
    
    if(component){      
      component.contents
        .attr('contenteditable', null)
        .addListener('dblclick', this.onComponentContentsDblClick)
        .removeListener('click', this.onComponentContentsClick)
        .removeListener('keydown', this.onComponentContentsKey)
        .removeListener('keypress', this.onComponentContentsKey)
        .removeListener('keyup', this.onComponentContentsKey);
        
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
        .execCommand("styleWithCSS", true);
    }
    
    return this;
  };

  TextPanel.prototype.disable = function(){    
    this.lock();
    
    return TextPanel.parent.prototype.disable.call(this);
  };

  TextPanel.prototype.onComponentContentsDblClick = function(evt){
    this.updateFieldValue('locked', false);
  };

  TextPanel.prototype.onComponentContentsClick = function(evt){
    evt.stopPropagation();
  };

  TextPanel.prototype.onComponentContentsKey = function(evt){
    if(evt.type === 'keyup'){
      this.updateButtons();
    }
    
    evt.stopPropagation();
  };

  TextPanel.prototype.onComponentContentsMouseup = function(evt){
    this.updateButtons();
  };

  TextPanel.prototype.updateButtons = function(evt){
     var component = this.getComponent(),
      document =  component.contents.get(0).ownerDocument,
      field;
      
    metaScore.Object.each(this.getField('fontStyle').getButtons(), function(key, button){
      button.toggleClass('pressed', document.queryCommandState(key));
    });
    
    metaScore.Object.each(this.getField('fontStyle2').getButtons(), function(key, button){
      button.toggleClass('pressed', document.queryCommandState(key));
    });
    
    this.getField('foreColor').setValue(document.queryCommandValue('foreColor'), true);
    this.getField('backColor').setValue(document.queryCommandValue('backColor'), true);
    this.getField('fontName').setValue(document.queryCommandValue('fontName'), true);
    
    if(metaScore.Dom.closest(this.getSelectedElement(), 'a')){
      field = this.getField('link');
      field.getButton('link').addClass('pressed');
      field.getButton('unlink').removeClass('disabled');
    }
    else{
      field = this.getField('link');
      field.getButton('link').removeClass('pressed');
      field.getButton('unlink').addClass('disabled');
    }
  };

  TextPanel.prototype.onLinkOverlaySubmit = function(evt){
    var url = evt.detail.url;

    this.execCommand('createLink', url);
  };

  TextPanel.prototype.getSelectedElement = function(){
     var component = this.getComponent(),
      document =  component.contents.get(0).ownerDocument,
      selection, element;

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

    document.execCommand(command, false, value);
    
    this.updateButtons();
  };

  return TextPanel;

})();