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
      
    // fix event handlers scope
    this.onComponentDragStart = metaScore.Function.proxy(this.onComponentDragStart, this);
    this.onComponentDragEnd = metaScore.Function.proxy(this.onComponentDragEnd, this);
    this.onComponentResizeStart = metaScore.Function.proxy(this.onComponentResizeStart, this);
    this.onComponentResizeEnd = metaScore.Function.proxy(this.onComponentResizeEnd, this);
    
    this.fields = {};
    
    this.menu = new metaScore.editor.DropDownMenu();
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
    
    this.toolbar.addButton()
      .data('action', 'menu')
      .append(this.menu);
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this)); 
      
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
    
    componentDraggable: false,
    
    componentResizable: false
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
  
  Panel.prototype.getComponent = function(){  
    return this.component;  
  };
  
  Panel.prototype.setComponent = function(component, supressEvent){    
    if(component === this.getComponent()){
      return;
    }
    
    this.unsetComponent(supressEvent);
    
    this.component = component;
    
    this.enableFields();
    this.updateFieldValues(this.getValues(Object.keys(this.getField())), true);
    this.getMenu().enableItems('[data-action="delete"]');
    
  if(this.configs.componentDraggable){
    component._draggable = new metaScore.Draggable({'target': component.dom, 'handle': component.dom.child('.pager'), 'container': component.dom.parents()}).enable();
    
    component.dom
      .addListener('dragstart', this.onComponentDragStart)
      .addListener('dragend', this.onComponentDragEnd);
  }
  if(this.configs.componentResizable){
    component._resizable = new metaScore.Resizable({'target': component.dom, 'container': component.dom.parents()}).enable();
    
    component.dom
      .addListener('resizestart', this.onComponentResizeStart)
      .addListener('resizeend', this.onComponentResizeEnd);
  }
    
    component.dom
      .addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('componentset', {'component': component});
    }
    
    return this;    
  };
  
  Panel.prototype.unsetComponent = function(supressEvent){  
    var component = this.getComponent();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(component){
      if(component._draggable){
        component._draggable.destroy();
        delete component._draggable;
        
        component.dom
          .removeListener('dragstart', this.onComponentDragStart)
          .removeListener('dragend', this.onComponentDragEnd);
      }
      
      if(component._resizable){      
        component._resizable.destroy();
        delete component._resizable;
        
        component.dom
          .removeListener('resizestart', this.onComponentResizeStart)
          .removeListener('resizeend', this.onComponentResizeEnd);
      }
  
      component.dom
        .removeClass('selected');
      
      this.component = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('componentunset', {'component': component});
    }
    
    return this;    
  };
  
  Panel.prototype.onComponentDragStart = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y'];
    
    this.beforeDragValues = this.getValues(fields);
  };
  
  Panel.prototype.onComponentDragEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': this.beforeDragValues, 'new_values': this.getValues(fields)});
    
    delete this.beforeDragValues;
  };
  
  Panel.prototype.onComponentResizeStart = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.beforeResizeValues = this.getValues(fields);
  };
  
  Panel.prototype.onComponentResizeEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': this.beforeResizeValues, 'new_values': this.getValues(fields)});
    
    delete this.beforeResizeValues;
  };
  
  Panel.prototype.onFieldValueChange = function(evt){
    var component = this.getComponent(),
      field, value, old_values;
      
    if(!component){
      return;
    }
    
    field = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues([field]);
    
    this.updateProperty(component, field, value);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([field])});
  };
  
  Panel.prototype.updateFieldValue = function(name, value, supressEvent){
    var field = this.getField(name);
    
    if(field instanceof metaScore.editor.field.Boolean){
      field.setChecked(value);
    }
    else{
      field.setValue(value);
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
    this.configs.fields[name].setter(component, value);
  };
  
  Panel.prototype.updateProperties = function(component, values){  
    metaScore.Object.each(values, function(name, value){
      this.updateProperty(component, name, value);
    }, this);
    
    this.updateFieldValues(values, true);  
  };
  
  Panel.prototype.getValue = function(name){
    var component = this.getComponent();
      
    return this.configs.fields[name].getter(component);
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