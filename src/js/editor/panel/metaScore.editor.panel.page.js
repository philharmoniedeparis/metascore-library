/**
 * Page
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 * @requires ../../helpers/metaScore.string.js
 */
 
metaScore.namespace('editor.panel');

metaScore.editor.panel.Page = (function () {
  
  function PagePanel(configs) {
     this.configs = this.getConfigs(configs);
  
    // call parent constructor
    PagePanel.parent.call(this, this.configs);
    
    this.menu = new metaScore.editor.DropDownMenu();
    this.menu.addItem({'text': metaScore.String.t('Add a new page'), 'data-action': 'new'});
    this.menu.addItem({'text': metaScore.String.t('Delete the active page'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(this.menu);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this));
  }

  PagePanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Page'),
    
    /**
    * The panel's fields
    */
    fields: {
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image')
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time')
      }
    }
  };
  
  metaScore.editor.Panel.extend(PagePanel);
  
  PagePanel.prototype.getMenu = function(){
  
    return this.menu;
  
  };
  
  PagePanel.prototype.getPage = function(){
  
    return this.page;
  
  };
  
  PagePanel.prototype.setPage = function(page, supressEvent){
  
    if(this.page && (this.page.get(0) === page.get(0))){
      return;
    }
    
    this.unsetPage(this.page, supressEvent);
    
    this.page = page;
    
    this.updateValues();      
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
      
    if(supressEvent !== true){
      this.triggerEvent('pageset', {'page': this.page});
    }
    
    return this;
    
  };
  
  PagePanel.prototype.unsetPage = function(page, supressEvent){
    
    page = page || this.getPage();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
      
    if(page){    
      this.page = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('pageunset', {'page': page});
    }
    
    return this;
    
  };
  
  PagePanel.prototype.onFieldValueChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!this.page){
      return;
    }
  
    switch(field.data('name')){
      case 'bg-color':
        this.page.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg_image':
        // TODO
      case 'start-time':
        this.page.data('start-time', value);
        break;
      case 'end-time':
        this.page.data('end-time', value);
        break;
    }
  };
  
  PagePanel.prototype.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'bg-color':
        field.setValue(this.page.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'start-time':
        field.setValue(this.page.data('start-time') || 0);
        break;
      case 'end-time':
        field.setValue(this.page.data('end-time') || 0);
        break;
    }
  };
  
  PagePanel.prototype.updateValues = function(fields){
  
    if(fields === undefined){
      fields = Object.keys(this.getField());
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);
  
  };
    
  return PagePanel;
  
})();