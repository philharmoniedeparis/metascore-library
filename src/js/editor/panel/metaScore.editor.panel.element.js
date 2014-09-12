/**
 * Element
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.cornerfield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 * @requires ../field/metaScore.editor.field.selectfield.js
 */
 
metaScore.namespace('editor.panel');
 
metaScore.editor.panel.Element = (function () {
  
  function ElementPanel(configs) {
    var toolbar;
    
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    ElementPanel.parent.call(this, this.configs);
      
    // fix event handlers scope
    this.onElementDrag = metaScore.Function.proxy(this.onElementDrag, this);
    this.onElementResize = metaScore.Function.proxy(this.onElementResize, this);
    
    toolbar = this.getToolbar();
    
    toolbar.addButton().data('action', 'previous');
    toolbar.addButton().data('action', 'next');
    
    this.menu = new metaScore.editor.DropDownMenu();
    this.menu.addItem({'text': metaScore.String.t('Add a new cursor'), 'data-action': 'new', 'data-type': 'Cursor'});
    this.menu.addItem({'text': metaScore.String.t('Add a new image'), 'data-action': 'new', 'data-type': 'Image'});
    this.menu.addItem({'text': metaScore.String.t('Add a new text element'), 'data-action': 'new', 'data-type': 'Text'});
    this.menu.addItem({'text': metaScore.String.t('Delete the active element'), 'data-action': 'delete'});
    
    toolbar.addButton()
      .data('action', 'menu')
      .append(this.menu);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this));
  }

  ElementPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Element'),
    
    /**
    * The panel's fields
    */
    fields: {
      'name': {
        'type': metaScore.editor.field.Text,
        'label': metaScore.String.t('Name'),
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height')
      },
      'r-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Reading index'),
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Display index')
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image')
      },
      'border-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Border width')
      },
      'border-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Border color')
      },
      'rounded-conrners': {
        'type': metaScore.editor.field.Corner,
        'label': metaScore.String.t('Rounded conrners')
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time')
      },
      'direction': {
        'type': metaScore.editor.field.Select,
        'configs': {
          'options': {
            'right': metaScore.String.t('Left > Right'),
            'left': metaScore.String.t('Right > Left'),
            'bottom': metaScore.String.t('Top > Bottom'),
            'top': metaScore.String.t('Bottom > Top'),
          }
        },
        'label': metaScore.String.t('Direction'),
        'element-types': ['cursor']
      },
      'cursor-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Cursor width'),
        'element-types': ['cursor']
      },
      'cursor-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Cursor color'),
        'element-types': ['cursor']
      },
      'font-family': {
        'type': metaScore.editor.field.Select,
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
        'label': metaScore.String.t('Font'),
        'element-types': ['text']
      },
      'text-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Text color'),
        'element-types': ['text']
      }
    }
  };
  
  metaScore.editor.Panel.extend(ElementPanel);
  
  ElementPanel.prototype.getMenu = function(){  
    return this.menu;  
  };
  
  ElementPanel.prototype.getElement = function(){  
    return this.element;  
  };
  
  ElementPanel.prototype.setElement = function(element, supressEvent){  
    if(this.element && (this.element.dom.get(0) === element.dom.get(0))){
      return;
    }
    
    this.unsetElement(this.element, supressEvent);
    
    this.element = element;
    
    if(this.element.dom.data('type') === 'text'){
      this.element.setEditable(true);
    }
    
    this.toggleFields();
    this.updateValues();
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
    
    this.element._draggable = new metaScore.Draggable({'target': this.element.dom, 'handle': this.element.dom, 'container': this.element.dom.parents()}).enable();
    this.element._resizable = new metaScore.Resizable({'target': this.element.dom, 'container': this.element.dom.parents()}).enable();
    
    this.element.dom
      .addListener('drag', this.onElementDrag)
      .addListener('resize', this.onElementResize)
      .addClass('selected');
    
    if(supressEvent !== true){
      this.triggerEvent('elementset', {'element': this.element});
    }
    
    return this;    
  };
  
  ElementPanel.prototype.unsetElement = function(element, supressEvent){
    element = element || this.getElement();
      
    this.disableFields();
    this.getMenu().disableItems('[data-action="delete"]');
  
    if(element){
      element._draggable.destroy();
      delete element._draggable;
      
      element._resizable.destroy();
      delete element._resizable;
  
      element.dom
        .removeListener('drag', this.onElementDrag)
        .removeListener('resize', this.onElementResize)
        .removeClass('selected');
    
      if(this.element.dom.data('type') === 'text'){
        this.element.setEditable(false);
      }
      
      this.element = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('elementunset', {'element': element});
    }
    
    return this;    
  };
  
  ElementPanel.prototype.onElementDrag = function(evt){  
    this.updateValues(['x', 'y']);
  };
  
  ElementPanel.prototype.onElementResize = function(evt){  
    this.updateValues(['x', 'y', 'width', 'height']);
  };
  
  ElementPanel.prototype.onFieldValueChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!this.element){
      return;
    }
  
    switch(field.data('name')){
      case 'x':
        this.element.dom.css('left', value +'px');
        break;
      case 'y':
        this.element.dom.css('top', value +'px');
        break;
      case 'width':
        this.element.dom.css('width', value +'px');
        break;
      case 'height':
        this.element.dom.css('height', value +'px');
        break;
      case 'r-index':
        this.element.dom.data('r-index', value);
        break;
      case 'z-index':
        this.element.dom.css('z-index', value);
        break;
      case 'bg-color':
        this.element.dom.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        this.element.dom.css('border-width', value +'px');
        break;
      case 'border-color':
        this.element.dom.css('border-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        this.element.dom.data('start-time', value);
        break;
      case 'end-time':
        this.element.dom.data('end-time', value);
        break;
      case 'direction':
        this.element.dom.data('direction', value);
        break;
      case 'cursor-width':
        this.element.cursor.css('width', value +'px');
        break;
      case 'cursor-color':
        this.element.cursor.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'font-family':
        this.element.dom.css('font-family', value);
        break;
      case 'text-color':
        this.element.dom.css('color', value);
        break;
    }
  };
  
  ElementPanel.prototype.getApplicableFields = function(){
    var type = this.element.dom.data('type'),
      fields = [];
    
    metaScore.Object.each(this.configs.fields, function(key, configs){      
      if(!configs.hasOwnProperty('element-types') || metaScore.Array.inArray(configs['element-types'], type) > -1){
        fields.push(key);
      }
    }, this);
    
    return fields;  
  };
  
  ElementPanel.prototype.getNonApplicableFields = function(){
    var type = this.element.dom.data('type'),
      fields = [];
    
    metaScore.Object.each(this.configs.fields, function(key, configs){      
      if(configs.hasOwnProperty('element-types') && metaScore.Array.inArray(configs['element-types'], type) === -1){
        fields.push(key);
      }
    }, this);
    
    return fields;  
  };
  
  ElementPanel.prototype.toggleFields = function(type){    
    this.showFields(this.getApplicableFields());
    this.hideFields(this.getNonApplicableFields());
  };
  
  ElementPanel.prototype.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
        field.setValue(parseInt(this.element.dom.css('left'), 10));
        break;
      case 'y':
        field.setValue(parseInt(this.element.dom.css('top'), 10));
        break;
      case 'width':
        field.setValue(parseInt(this.element.dom.css('width'), 10));
        break;
      case 'height':
        field.setValue(parseInt(this.element.dom.css('height'), 10));
        break;
      case 'r-index':
        field.setValue(this.element.dom.data('r-index') || null);
        break;
      case 'z-index':
        field.setValue(parseInt(this.element.dom.css('z-index'), 10));
        break;
      case 'bg-color':
        field.setValue(this.element.dom.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        field.setValue(parseInt(this.element.dom.css('border-width'), 10));
        break;
      case 'border-color':
        field.setValue(this.element.dom.css('border-color'));
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        field.setValue(this.element.dom.data('start-time') || null);
        break;
      case 'end-time':
        field.setValue(this.element.dom.data('end-time') || null);
        break;
      case 'direction':
        field.setValue(this.element.dom.data('direction') || null);
        break;
      case 'cursor-width':
        field.setValue(this.element.cursor.css('width'));
        break;
      case 'cursor-color':
        field.setValue(this.element.cursor.css('background-color'));
        break;
      case 'font-family':
        field.setValue(this.element.dom.css('font-family'));
        break;
      case 'text-color':
        field.setValue(this.element.dom.css('color'));
        break;
    }
  };
  
  ElementPanel.prototype.updateValues = function(fields){  
    if(fields === undefined){
      fields = this.getApplicableFields();
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);  
  };
    
  return ElementPanel;
  
})();