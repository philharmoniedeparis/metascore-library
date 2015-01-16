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
    /**
    * The panel's title
    */
    title: metaScore.Locale.t('editor.panel.Text.title', 'Text'),
    
    toolbarButtons: [],
    
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
              'title': metaScore.Locale.t('editor.panel.Text.link.link', 'Link')
            },
            'unlink': {
              'data-action': 'unlink',
              'title': metaScore.Locale.t('editor.panel.Text.link.unlink', 'Unlink')
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