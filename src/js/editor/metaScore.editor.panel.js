/**
 * Panel
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */

metaScore.namespace('editor').Panel = (function(){
  
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
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
      
    metaScore.Array.each(this.configs.toolbarButtons, function(index, action){
      this.toolbar.addButton(action);
    }, this);
    
    if(this.configs.menuItems.length > 0){
      this.menu = new metaScore.editor.DropDownMenu();
      
      metaScore.Array.each(this.configs.menuItems, function(index, item){
        this.menu.addItem(item);
      }, this);
      
      this.toolbar.addButton('menu')
        .append(this.menu);
    }
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this));
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
    
    menuItems: []
  };
  
  metaScore.Dom.extend(Panel);
  
  Panel.prototype.setupFields = function(properties){
    var row, uuid, configs, fieldType, field;
     
    this.fields = {};
    this.contents.empty();
    
    metaScore.Object.each(properties, function(key, prop){
      if(prop.editable !== false){        
        row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper '+ key})
          .appendTo(this.contents);
      
        uuid = 'field-'+ metaScore.String.uuid(5);
        
        configs = prop.configs || {};
        
        field = new metaScore.editor.field[prop.type](configs)
          .attr('id', uuid)
          .data('name', key);
        
        new metaScore.Dom('<td/>')
          .appendTo(row)
          .append(new metaScore.Dom('<label/>', {'text': prop.label, 'for': uuid}));
          
        new metaScore.Dom('<td/>')
          .appendTo(row)
          .append(field);
        
        this.fields[key] = field;
      }
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
  
    if(component !== this.getComponent()){
      this.unsetComponent(true);
      
      this.component = component;
      
      this.setupFields(this.component.configs.properties);
      this.enable();
      this.updateFieldValues(this.getValues(Object.keys(this.getField())), true);
      
      if(!(component instanceof metaScore.player.component.Controller)){
        this.toggleMenuItems('[data-action="delete"]', true);
      }
      
      draggable = this.getDraggable();
      if(draggable){
        component._draggable = new metaScore.Draggable(draggable);
        component
          .addListener('dragstart', this.onComponentDragStart)
          .addListener('drag', this.onComponentDrag)
          .addListener('dragend', this.onComponentDragEnd);
      }
      
      resizable = this.getResizable();
      if(resizable){
        component._resizable = new metaScore.Resizable(resizable);      
        component
          .addListener('resizestart', this.onComponentResizeStart)
          .addListener('resize', this.onComponentResize)
          .addListener('resizeend', this.onComponentResizeEnd);
      }
      
      component.addClass('selected');
    }
      
    if(supressEvent !== true){
      this.triggerEvent('componentset', {'component': component}, false);
    }
    
    return this;    
  };
  
  Panel.prototype.unsetComponent = function(supressEvent){
    var component = this.getComponent();
      
    this.disable();
    this.toggleMenuItems('[data-action="delete"]', false);
    
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
  
  Panel.prototype.toggleMenuItems = function(items, enable){
    var menu = this.getMenu();
    
    if(menu){
      if(enable){
        menu.enableItems(items);
      }
      else{
        menu.disableItems(items);
      }
    }
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
      name, value, old_values;
      
    if(!component){
      return;
    }
    
    name = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues([name]);
    
    component.setProperty(name, value);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
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
  
  Panel.prototype.updateProperties = function(component, values){  
    metaScore.Object.each(values, function(name, value){
      if(!this.getField(name).disabled){
        component.setProperty(name, value);
      }
    }, this);
    
    this.updateFieldValues(values, true);  
  };
  
  Panel.prototype.getValue = function(name){    
    return this.getComponent().getProperty(name);
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