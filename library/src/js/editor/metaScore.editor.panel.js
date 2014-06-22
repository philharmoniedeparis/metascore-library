/*global global console*/

/**
* Editor panel
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Editor = metaScore.Editor || {};

  metaScore.Editor.Panel = metaScore.Dom.extend({
    defaults: {
      /**
      * The panel's title
      */
      title: '',
      
      /**
      * The panel's fields
      */
      fields: {}
    },
    init: function(configs) {
    
      this.initConfig(configs);
    
      this.callSuper('<div/>', {'class': 'panel'});
      
      this.setupUI();
      
    },    
    setupUI: function(){
    
      this.toolbar = metaScore.Dom.create('<div/>', {'class': 'toolbar'}).appendTo(this);
      
      this.toolbar.title = metaScore.Dom.create('<div/>', {'class': 'title'})
        .appendTo(this.toolbar)
        .addListener('click', metaScore.Function.proxy(this.toggleState, this));
      
      this.toolbar.buttons = metaScore.Dom.create('<div/>', {'class': 'buttons'}).appendTo(this.toolbar);
      
      this.setTitle(this.configs.title);
      
      this.contents = metaScore.Dom.create('<div/>', {'class': 'contents'})
        .appendTo(this);
        
      this.setupFields();
      
    },
    setupFields: function(){
    
      var table = metaScore.Dom.create('<table/>').appendTo(this.contents),
        row, field_uuid, field;
      
      this.fields = {};
    
      metaScore.Object.each(this.configs.fields, function(key, value){
        
        row = metaScore.Dom.create(document.createElement('tr'), {'class': 'field-wrapper'}).appendTo(table);
      
        field_uuid = 'field-'+ metaScore.String.uuid(5);
        
        this.fields[key] = field = value.type.create().attr('id', field_uuid);
        
        metaScore.Dom.create(document.createElement('td')).appendTo(row).append(metaScore.Dom.create('<label/>', {'text': value.label, 'for': field_uuid}));
        metaScore.Dom.create(document.createElement('td')).appendTo(row).append(field);
        
      }, this);
    
    },
    setTitle: function(title){
    
      this.toolbar.title.text(title);
      
    },
    toggleState: function(){
      
      this.toggleClass('collapsed');
      
    }
  });
  
}(global));