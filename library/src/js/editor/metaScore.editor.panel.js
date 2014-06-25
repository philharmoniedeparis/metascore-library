/*global metaScore console*/

/**
* Editor panel
*/
metaScore.Editor.Panel = metaScore.Dom.extend(function(){

  var toolbar;

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
  
    toolbar = new metaScore.Editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
    
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
  
  this.toggleState = function(){
    
    this.toggleClass('collapsed');
    
  };
  
  this.getToolbar = function(){
    
    return toolbar;
    
  };
});