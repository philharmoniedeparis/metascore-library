/**
 * Panel
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */
metaScore.Editor.Panel = metaScore.Dom.extend(function(){

  var _toolbar, _contents,
    _fields = {};

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
      .addListener('click', this.toggleState);
    
    _contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.setupFields();
    
  };
  
  this.setupFields = function(){
  
    var row, uuid, configs, field;
  
    metaScore.Object.each(this.configs.fields, function(key, value){
      
      row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper '+ key}).appendTo(_contents);
    
      uuid = 'field-'+ metaScore.String.uuid(5);
      
      configs = value.configs || {};
      
      _fields[key] = field = new value.type(configs).attr('id', uuid);
      field.data('name', key);
      
      new metaScore.Dom('<td/>').appendTo(row).append(new metaScore.Dom('<label/>', {'text': value.label, 'for': uuid}));
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
  
  this.enableFields = function(){
  
    metaScore.Object.each(_fields, function(key, field){
      field.enable();
    }, this);
    
  };
  
  this.disableFields = function(){
  
    metaScore.Object.each(_fields, function(key, field){
      field.disable();
    }, this);
    
  };
  
  this.showFields = function(keys){
  
    if(!keys){
      _contents.children('tr.field-wrapper').show();
    }
    else{
      _contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).show();
    }
    
  };
  
  this.hideFields = function(keys){
  
    if(!keys){
      _contents.children('tr.field-wrapper').hide();
    }
    else{
      _contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).hide();
    }
    
  };
  
  this.toggleState = function(evt){
    
    this.toggleClass('collapsed');
    
  };
});