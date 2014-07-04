/**
 * Element
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.cornerfield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 */
metaScore.Editor.Panel.Element = metaScore.Editor.Panel.extend(function(){

  var _menu, _element;

  this.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Element'),
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Height')
      },
      'r-index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Reading index'),
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Display index')
      },
      'bg-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
      },
      'border-width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Border width')
      },
      'border-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Border color')
      },
      'rounded-conrners': {
        'type': metaScore.Editor.Field.CornerField,
        'label': metaScore.String.t('Rounded conrners')
      },
      'start-time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': metaScore.String.t('End time')
      }
    }
  };
  
  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    var toolbar;
  
    this.super(configs);
    
    toolbar = this.getToolbar();
    
    toolbar.addButton().data('action', 'previous');
    toolbar.addButton().data('action', 'next');
    
    _menu = new metaScore.Editor.DropDownMenu();
    _menu.addItem({'text': metaScore.String.t('Add a new cursor'), 'data-action': 'new', 'data-type': 'Cursor'});
    _menu.addItem({'text': metaScore.String.t('Add a new image'), 'data-action': 'new', 'data-type': 'Image'});
    _menu.addItem({'text': metaScore.String.t('Add a new text element'), 'data-action': 'new', 'data-type': 'Text'});
    _menu.addItem({'text': metaScore.String.t('Delete the active element'), 'data-action': 'delete'});
    
    toolbar.addButton()
      .data('action', 'menu')
      .append(_menu);
      
    this.addDelegate('.field', 'change', this.onFieldChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getElement = function(){
  
    return _element;
  
  };
  
  this.setElement = function(element, supressEvent){
  
    if(_element && (_element.get(0) === element.get(0))){
      return;
    }
    
    this.unsetElement(_element, supressEvent);
    
    _element = element;
    
    this.updateValues();      
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
    
    _element._draggable = new metaScore.Draggable(_element, _element, _element.parents()).enable();
    _element._resizable = new metaScore.Resizable(_element, _element.parents()).enable();
    
    _element
      .addListener('drag', this.onElementDrag)
      .addListener('resize', this.onElementResize)
      .addClass('selected');
    
    if(supressEvent !== true){
      this.triggerEvent('elementset', {'element': _element});
    }
    
    return this;
    
  };
  
  this.unsetElement = function(element, supressEvent){
  
    element = element || this.getElement();
      
    this.disableFields();
    this.getMenu().disableItems('[data-action="delete"]');
  
    if(element){
      element._draggable.destroy();
      delete element._draggable;
      
      element._resizable.destroy();
      delete element._resizable;
  
      element
        .removeListener('drag', this.onElementDrag)
        .removeListener('resize', this.onElementResize)
        .removeClass('selected');
      
      _element = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('elementunset', {'element': element});
    }
    
    return this;
    
  };
  
  this.onElementDrag = function(evt){  
    this.updateValues(['x', 'y']);
  };
  
  this.onElementResize = function(evt){  
    this.updateValues(['x', 'y', 'width', 'height']);
  };
  
  this.onFieldChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!_element){
      return;
    }
  
    switch(field.data('name')){
      case 'x':
        _element.css('left', value +'px');
        break;
      case 'y':
        _element.css('top', value +'px');
        break;
      case 'width':
        _element.css('width', value +'px');
        break;
      case 'height':
        _element.css('height', value +'px');
        break;
      case 'r-index':
        _element.data('r-index', value);
        break;
      case 'z-index':
        _element.css('z-index', value);
        break;
      case 'bg-color':
        _element.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        _element.css('border-width', value +'px');
        break;
      case 'border-color':
        _element.css('border-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        _element.data('start-time', value);
        break;
      case 'end-time':
        _element.data('end-time', value);
        break;
    }
  };
  
  this.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
        field.setValue(parseInt(_element.css('left'), 10));
        break;
      case 'y':
        field.setValue(parseInt(_element.css('top'), 10));
        break;
      case 'width':
        field.setValue(parseInt(_element.css('width'), 10));
        break;
      case 'height':
        field.setValue(parseInt(_element.css('height'), 10));
        break;
      case 'r-index':
        field.setValue(_element.data('r-index') || 0);
        break;
      case 'z-index':
        field.setValue(parseInt(_element.css('z-index'), 10));
        break;
      case 'bg-color':
        field.setValue(_element.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        field.setValue(parseInt(_element.css('border-width'), 10));
        break;
      case 'border-color':
        field.setValue(_element.css('border-color'));
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        field.setValue(_element.data('start-time') || 0);
        break;
      case 'end-time':
        field.setValue(_element.data('end-time') || 0);
        break;
    }
  };
  
  this.updateValues = function(fields){
  
    if(fields === undefined){
      fields = Object.keys(this.getField());
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);
  
  };
  
  
});