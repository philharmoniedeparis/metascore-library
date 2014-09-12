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
    fields: {},
    
    componenetDraggable: false,
    
    componenetResizable: false,
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
    else if(keys.length > 0){
      this.contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).show();
    }
    
  };
  
  Panel.prototype.hideFields = function(keys){
  
    if(!keys){
      this.contents.children('tr.field-wrapper').hide();
    }
    else if(keys.length > 0){
      this.contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).hide();
    }
    
  };
  
  Panel.prototype.toggleState = function(evt){
    
    this.toggleClass('collapsed');
    
  };
  
  Panel.prototype.getMenu = function(){  
    return this.menu;  
  };
  
  Panel.prototype.getComponenet = function(){  
    return this.componenet;  
  };
  
  Panel.prototype.setComponenet = function(componenet, supressEvent){    
    if(componenet === this.getComponenet()){
      return;
    }
    
    this.unsetComponenet(supressEvent);
    
    this.componenet = componenet;
    
    this.enableFields();
    this.updateFieldValues(this.getValues(Object.keys(this.getField())), true);
    this.getMenu().enableItems('[data-action="delete"]');
      
    if(supressEvent !== true){
      this.triggerEvent('componenetset', {'componenet': componenet});
    }
    
    return this;    
  };
  
  Panel.prototype.unsetComponenet = function(supressEvent){  
    var componenet = this.getComponenet();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(componenet){
      if(componenet._draggable){
        componenet._draggable.destroy();
        delete componenet._draggable;
        
        componenet.dom
          .removeListener('dragstart', this.onComponenetDragStart)
          .removeListener('dragend', this.onComponenetDragEnd);
      }
      
      if(componenet._resizable){      
        componenet._resizable.destroy();
        delete componenet._resizable;
        
        componenet.dom
          .removeListener('resizestart', this.onComponenetResizeStart)
          .removeListener('resizeend', this.onComponenetResizeEnd);
      }
  
      componenet.dom
        .removeClass('selected');
      
      this.componenet = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('componenetunset', {'componenet': componenet});
    }
    
    return this;    
  };
  
  Panel.prototype.onFieldValueChange = function(evt){
    var componenet = this.getComponenet(),
      field, value, old_values;
      
    if(!componenet){
      return;
    }
    
    field = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues([field]);
    
    this.updateProperty(componenet, field, value);
    
    this.triggerEvent('valueschange', {'componenet': componenet, 'old_values': old_values, 'new_values': this.getValues([field])});
  };
  
  Panel.prototype.updateFieldValue = function(name, value, supressEvent){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
      case 'y':
      case 'width':
      case 'height':
      case 'bg-color':
        field.setValue(value);
        break;
      case 'bg-image':
        field.setValue(value);
        break;
      case 'synched':
        field.setChecked(value);
        break;
    }
    
    if(supressEvent !== true){
      field.triggerEvent('change');
    }
  };
  
  Panel.prototype.updateFieldValues = function(values, supressEvent){    
    if(metaScore.Var.is(values, 'array')){
      metaScore.Array.each(values, function(index, field){
        this.updateFieldValue(field, this.getValue(field), supressEvent);
      }, this);
    }
    else{
      metaScore.Object.each(values, function(field, value){
        this.updateFieldValue(field, value, supressEvent);
      }, this);
    }
  };
  
  Panel.prototype.updateProperty = function(component, name, value){
    switch(name){
      case 'x':
        component.dom.css('left', value +'px');
        break;
      case 'y':
        component.dom.css('top', value +'px');
        break;
      case 'width':
        component.dom.css('width', value +'px');
        break;
      case 'height':
        component.dom.css('height', value +'px');
        break;
      case 'bg-color':
        component.dom.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        component.dom.css('background-image', 'url('+ value +')');
        break;
      case 'synched':
        component.dom.data('synched', value);
        break;
    }  
  };
  
  Panel.prototype.updateProperties = function(component, values){  
    metaScore.Object.each(values, function(name, value){
      this.updateProperty(component, name, value);
    }, this);
    
    this.updateFieldValues(values, true);  
  };
  
  Panel.prototype.getValue = function(name){
    var component = this.getComponent(),
      value;
  
    switch(name){
      case 'x':
        value = parseInt(component.dom.css('left'), 10);
        break;
      case 'y':
        value = parseInt(component.dom.css('top'), 10);
        break;
      case 'width':
       value = parseInt(component.dom.css('width'), 10);
        break;
      case 'height':
        value = parseInt(component.dom.css('height'), 10);
        break;
      case 'bg-color':
        value = component.dom.css('background-color');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        value = component.dom.data('synched') === "true";
        break;
    }
    
    return value;  
  };
  
  Panel.prototype.getValues = function(fields){
    var values = {};
    
    fields = fields || Object.keys(this.getField());
    
    metaScore.Array.each(fields, function(index, field){
      values[field] = this.getValue(field);
    }, this);
    
    return values;  
  };
    
  return Panel;
  
})();