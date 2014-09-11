/**
 * Panel
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */
metaScore.editor.Panel = (function(){
  
  function Panel(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Panel.parent.call(this, '<div/>', {'class': 'panel'});
    
    this.fields = {};
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.setupFields();    
  }

  Panel.defaults = {
    /**
    * The panel's title
    */
    title: '',
    
    /**
    * The panel's fields
    */
    fields: {}
  };
  
  metaScore.Dom.extend(Panel);
  
  Panel.prototype.setupFields = function(){
  
    var row, uuid, configs, field;
  
    metaScore.Object.each(this.configs.fields, function(key, value){
      
      row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper '+ key}).appendTo(this.contents);
    
      uuid = 'field-'+ metaScore.String.uuid(5);
      
      configs = value.configs || {};
      
      this.fields[key] = field = new value.type(configs).attr('id', uuid);
      field.data('name', key);
      
      new metaScore.Dom('<td/>').appendTo(row).append(new metaScore.Dom('<label/>', {'text': value.label, 'for': uuid}));
      new metaScore.Dom('<td/>').appendTo(row).append(field);
      
    }, this);
  
  };
  
  Panel.prototype.getToolbar = function(){
    
    return this.toolbar;
    
  };
  
  Panel.prototype.getField = function(key){
    
    if(key === undefined){
      return this.fields;
    }
    
    return this.fields[key];
    
  };
  
  Panel.prototype.enableFields = function(){
  
    metaScore.Object.each(this.fields, function(key, field){
      field.enable();
    }, this);
    
  };
  
  Panel.prototype.disableFields = function(){
  
    metaScore.Object.each(this.fields, function(key, field){
      field.disable();
    }, this);
    
  };
  
  Panel.prototype.showFields = function(keys){
  
    if(!keys){
      this.contents.children('tr.field-wrapper').show();
    }
    else{
      this.contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).show();
    }
    
  };
  
  Panel.prototype.hideFields = function(keys){
  
    if(!keys){
      this.contents.children('tr.field-wrapper').hide();
    }
    else{
      this.contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).hide();
    }
    
  };
  
  Panel.prototype.toggleState = function(evt){
    
    this.toggleClass('collapsed');
    
  };
    
  return Panel;
  
})();