/**
 * Panel
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */
metaScore.Editor.Panel = metaScore.Dom.extend(function(){

  var _toolbar, _fields = {};

  this.defaults = {
    /**
    * The panel's title
    */
    title: '',
    
    /**
    * The panel's fields
    */
    fields: {}
  };
  
  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'panel'});
  
    this.initConfig(configs);
  
    _toolbar = new metaScore.Editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    _toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.setupFields();
    
  };
  
  this.setupFields = function(){
  
    var row, field_uuid, field;
  
    metaScore.Object.each(this.configs.fields, function(key, value){
      
      row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper'}).appendTo(this.contents);
    
      field_uuid = 'field-'+ metaScore.String.uuid(5);
      
      _fields[key] = field = new value.type().attr('id', field_uuid);
      field.data('name', key);      
      
      new metaScore.Dom('<td/>').appendTo(row).append(new metaScore.Dom('<label/>', {'text': value.label, 'for': field_uuid}));
      new metaScore.Dom('<td/>').appendTo(row).append(field);
      
    }, this);
  
  };
  
  this.getToolbar = function(){
    
    return _toolbar;
    
  };
  
  this.getField = function(key){
    
    if(key === undefined){
      return _fields;
    }
    
    return _fields[key];
    
  };
  
  this.toggleState = function(){
    
    this.toggleClass('collapsed');
    
  };
});