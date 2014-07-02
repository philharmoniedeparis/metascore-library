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
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
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
    _menu.addItem({'text': metaScore.String.t('Add a new page'), 'data-action': 'new'});
    _menu.addItem({'text': metaScore.String.t('Delete the active page'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .addClass('menu')
      .append(_menu);
      
    this.addDelegate('.field', 'change', this.onFieldChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getPage = function(){
  
    return _page;
  
  };
  
  this.setPage = function(page){
    
    this.unsetPage(_page);
    
    _page = page;
    
    _page.addClass('selected');
    
    this.updateValues();
      
    this.enableFields();
      
    this.triggerEvent('pageset', {'page': _page});
    
  };
  
  this.unsetPage = function(page){
  
    page = page || this.getPage();
  
    if(!page){
      return;
    }
  
    page.removeClass('selected');
      
    this.disableFields();
      
    this.triggerEvent('pageunset', {'page': page});
    
  };
  
  this.onFieldChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!_page){
      return;
    }
  
    switch(field.data('name')){
      case 'bg_color':
        _page.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
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
        field.setValue(_page.css('background-color'));
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