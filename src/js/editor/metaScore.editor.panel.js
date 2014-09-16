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
    this.onComponentDrag = metaScore.Function.proxy(this.onComponentDrag, this);
    this.onComponentDragEnd = metaScore.Function.proxy(this.onComponentDragEnd, this);
    this.onComponentResizeStart = metaScore.Function.proxy(this.onComponentResizeStart, this);
    this.onComponentResize = metaScore.Function.proxy(this.onComponentResize, this);
    this.onComponentResizeEnd = metaScore.Function.proxy(this.onComponentResizeEnd, this);
    
    this.fields = {};
    
    this.menu = new metaScore.editor.DropDownMenu();
    
    metaScore.Array.each(this.configs.menuItems, function(index, item){
      this.menu.addItem(item);
    }, this);
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
      
    metaScore.Array.each(this.configs.toolbarButtons, function(index, action){
      this.toolbar.addButton(action);
    }, this);
    
    this.toolbar.addButton('menu')
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
    
    toolbarButtons: [
      'previous',
      'next'
    ],
    
    menuItems: [],
    
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
  
  Panel.prototype.toggleFields = function(enable){
    var component = this.getComponent();
  
    metaScore.Object.each(this.fields, function(key, field){
      if(component && ('filter' in this.configs.fields[key]) && this.configs.fields[key].filter(component) === false){
        this.hideField(key);
        field.disable();
      }
      else{
        this.showField(key);
        
        if(enable === true){
          field.enable();
        }
        else{
          field.disable();
        }
      }
    }, this);    
  };
  
  Panel.prototype.showField = function(key){
    this.contents.children('tr.field-wrapper.'+ key).show();
  };
  
  Panel.prototype.hideField = function(key){  
    this.contents.children('tr.field-wrapper.'+ key).hide();
  };
  
  Panel.prototype.toggleState = function(){    
    this.toggleClass('collapsed');
  };
  
  Panel.prototype.disable = function(){    
    this.addClass('disabled');
    this.getToolbar().getButton('previous').addClass('disabled');
    this.getToolbar().getButton('next').addClass('disabled');
  };
  
  Panel.prototype.enable = function(){    
    this.removeClass('disabled');
    this.getToolbar().getButton('previous').removeClass('disabled');
    this.getToolbar().getButton('next').removeClass('disabled');
  };
  
  Panel.prototype.getMenu = function(){  
    return this.menu;  
  };
  
  Panel.prototype.getComponent = function(){  
    return this.component;  
  };
  
  Panel.prototype.getDraggable = function(){  
    return false;
  };
  
  Panel.prototype.getResizable = function(){  
    return false;
  };
  
  Panel.prototype.setComponent = function(component, supressEvent){
    var draggable, resizable;
  
    if(component === this.getComponent()){
      return;
    }
    
    this.unsetComponent(supressEvent);
    
    this.component = component;
    
    this.toggleFields(true);
    this.enable();
    this.updateFieldValues(this.getValues(Object.keys(this.getField())), true);
    
    if(!(component instanceof metaScore.player.Controller)){
      this.getMenu().enableItems('[data-action="delete"]');
    }
    
    draggable = this.getDraggable();
    if(draggable){
      component._draggable = new metaScore.Draggable(draggable).enable();
      component
        .addListener('dragstart', this.onComponentDragStart)
        .addListener('drag', this.onComponentDrag)
        .addListener('dragend', this.onComponentDragEnd);
    }
    
    resizable = this.getResizable();
    if(resizable){
      component._resizable = new metaScore.Resizable(resizable).enable();      
      component
        .addListener('resizestart', this.onComponentResizeStart)
        .addListener('resize', this.onComponentResize)
        .addListener('resizeend', this.onComponentResizeEnd);
    }
    
    component.addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('componentset', {'component': component}, false);
    }
    
    return this;    
  };
  
  Panel.prototype.unsetComponent = function(supressEvent){  
    var component = this.getComponent();
      
    this.toggleFields(false);
    this.disable();
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(component){
      if(component._draggable){
        component._draggable.destroy();
        delete component._draggable;
        
        component
          .removeListener('dragstart', this.onComponentDragStart)
          .removeListener('drag', this.onComponentDrag)
          .removeListener('dragend', this.onComponentDragEnd);
      }
      
      if(component._resizable){      
        component._resizable.destroy();
        delete component._resizable;
        
        component
          .removeListener('resizestart', this.onComponentResizeStart)
          .removeListener('resize', this.onComponentResize)
          .removeListener('resizeend', this.onComponentResizeEnd);
      }
  
      component.removeClass('selected');
      
      this.component = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('componentunset', {'component': component}, false);
    }
    
    return this;    
  };
  
  Panel.prototype.onComponentDragStart = function(evt){
    var fields = ['x', 'y'];
    
    this._beforeDragValues = this.getValues(fields);
  };
  
  Panel.prototype.onComponentDrag = function(evt){
    var fields = ['x', 'y'];
    
    this.updateFieldValues(fields, true);
  };
  
  Panel.prototype.onComponentDragEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);
    
    delete this._beforeDragValues;
  };
  
  Panel.prototype.onComponentResizeStart = function(evt){
    var fields = ['x', 'y', 'width', 'height'];
    
    this._beforeResizeValues = this.getValues(fields);
  };
  
  Panel.prototype.onComponentResize = function(evt){
    var fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(fields, true);
  };
  
  Panel.prototype.onComponentResizeEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);
    
    delete this._beforeResizeValues;
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
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([field])}, false);
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
    component.setProperty(this.configs.fields[name].property, value);
  };
  
  Panel.prototype.updateProperties = function(component, values){  
    metaScore.Object.each(values, function(name, value){
      if(!this.getField(name).disabled){
        this.updateProperty(component, name, value);
      }
    }, this);
    
    this.updateFieldValues(values, true);  
  };
  
  Panel.prototype.getValue = function(name){
    var component = this.getComponent();
    
    return component.getProperty(this.configs.fields[name].property);
  };
  
  Panel.prototype.getValues = function(fields){
    var values = {};
    
    fields = fields || Object.keys(this.getField());
    
    metaScore.Array.each(fields, function(index, name){
      if(!this.getField(name).disabled){
        values[name] = this.getValue(name);
      }
    }, this);
    
    return values;  
  };
    
  return Panel;
  
})();