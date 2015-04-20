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