/*global metaScore console*/

/**
* Editor panel
*/
metaScore.Editor.Panel = metaScore.Dom.extend(function(){

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
    
    this.setupUI();
    
  };
  
  this.setupUI = function(){
  
    this.toolbar = new metaScore.Dom('<div/>', {'class': 'toolbar'}).appendTo(this);
    
    this.toolbar.title = new metaScore.Dom('<div/>', {'class': 'title'})
      .appendTo(this.toolbar)
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
    
    this.toolbar.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'}).appendTo(this.toolbar);
    
    this.setTitle(this.configs.title);
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.setupFields();
    
  };
  
  this.setupFields = function(){
  
    var row, field_uuid, field;
    
    this.fields = {};
  
    metaScore.Object.each(this.configs.fields, function(key, value){
      
      row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper'}).appendTo(this.contents);
    
      field_uuid = 'field-'+ metaScore.String.uuid(5);
      
      this.fields[key] = field = new value.type().attr('id', field_uuid);
      
      new metaScore.Dom('<td/>').appendTo(row).append(new metaScore.Dom('<label/>', {'text': value.label, 'for': field_uuid}));
      new metaScore.Dom('<td/>').appendTo(row).append(field);
      
    }, this);
  
  };
  
  this.setTitle = function(title){
  
    this.toolbar.title.text(title);
    
  };
  
  this.toggleState = function(){
    
    this.toggleClass('collapsed');
    
  };
});