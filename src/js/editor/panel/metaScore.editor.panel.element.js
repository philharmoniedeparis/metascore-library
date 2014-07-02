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
      'r_index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Reading index'),
        'configs': {
          'min': 0
        }
      },
      'z_index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Display index')
      },
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
      },
      'border_width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Border width')
      },
      'border_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Border color')
      },
      'rounded_conrners': {
        'type': metaScore.Editor.Field.CornerField,
        'label': metaScore.String.t('Rounded conrners')
      },
      'start_time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': metaScore.String.t('Start time')
      },
      'end_time': {
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
  
    this.super(configs);
    
    _menu = new metaScore.Editor.DropDownMenu();
    _menu.addItem({'text': metaScore.String.t('Add a new cursor'), 'data-action': 'new-cusror'});
    _menu.addItem({'text': metaScore.String.t('Add a new image'), 'data-action': 'new-image'});
    _menu.addItem({'text': metaScore.String.t('Add a new text element'), 'data-action': 'new-text'});
    _menu.addItem({'text': metaScore.String.t('Delete the active element'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .addClass('menu')
      .append(_menu);
      
    this.addDelegate('.field', 'change', this.onFieldChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getElement = function(){
  
    return _element;
  
  };
  
  this.setElement = function(element){
    
    this.unsetElement(_element);
    
    _element = element;
    
    _element.addClass('selected');
    
    this.updateValues();
      
    this.enableFields();
      
    this.triggerEvent('elementset', {'element': _element});
    
  };
  
  this.unsetElement = function(element){
  
    element = element || this.getElement();
  
    if(!element){
      return;
    }
  
    element.removeClass('selected');
      
    this.disableFields();
      
    this.triggerEvent('elementunset', {'element': element});
    
  };
  
  this.onFieldChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!_element){
      return;
    }
  
    switch(field.data('name')){
      case 'bg_color':
        _element.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg_image':
        // TODO
        break;
    }
  };
  
  this.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'bg_color':
        field.setValue(_element.css('background-color'));
        break;
      case 'bg_image':
        // TODO
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