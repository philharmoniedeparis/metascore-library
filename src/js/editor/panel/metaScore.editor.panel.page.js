/**
 * Page
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 * @requires ../../helpers/metaScore.string.js
 */
metaScore.Editor.Panel.Page = metaScore.Editor.Panel.extend(function(){

  var _menu, _page;

  this.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Page'),
    
    /**
    * The panel's fields
    */
    fields: {
      'bg-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
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
  
    this.super(configs);
    
    _menu = new metaScore.Editor.DropDownMenu();
    _menu.addItem({'text': metaScore.String.t('Add a new page'), 'data-action': 'new'});
    _menu.addItem({'text': metaScore.String.t('Delete the active page'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(_menu);
      
    this.addDelegate('.field', 'change', this.onFieldChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getPage = function(){
  
    return _page;
  
  };
  
  this.setPage = function(page, supressEvent){
  
    if(_page && (_page.get(0) === page.get(0))){
      return;
    }
    
    this.unsetPage(_page, supressEvent);
    
    _page = page;
    
    this.updateValues();      
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
      
    if(supressEvent !== true){
      this.triggerEvent('pageset', {'page': _page});
    }
    
    return this;
    
  };
  
  this.unsetPage = function(page, supressEvent){
    
    page = page || this.getPage();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
      
    if(page){    
      _page = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('pageunset', {'page': page});
    }
    
    return this;
    
  };
  
  this.onFieldChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!_page){
      return;
    }
  
    switch(field.data('name')){
      case 'bg-color':
        _page.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg_image':
        // TODO
      case 'start-time':
        _page.data('start-time', value);
        break;
      case 'end-time':
        _page.data('end-time', value);
        break;
    }
  };
  
  this.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'bg-color':
        field.setValue(_page.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'start-time':
        field.setValue(_page.data('start-time') || 0);
        break;
      case 'end-time':
        field.setValue(_page.data('end-time') || 0);
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