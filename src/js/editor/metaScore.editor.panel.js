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

    this.toolbar = new metaScore.editor.panel.Toolbar(this.configs.toolbarConfigs)
      .appendTo(this);

    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));

    this.contents = new metaScore.Dom('<div/>', {'class': 'fields'})
      .appendTo(this);

    this
      .addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
      .unsetComponent();
  }

  Panel.defaults = {
    toolbarConfigs: {
      buttons: [
        'previous',
        'next'
      ]
    }
  };

  metaScore.Dom.extend(Panel);

  Panel.prototype.setupFields = function(properties){
    var configs, fieldType, field;

    this.fields = {};
    this.contents.empty();

    metaScore.Object.each(properties, function(key, prop){
      if(prop.editable !== false){
        configs = prop.configs || {};

        field = new metaScore.editor.field[prop.type](configs)
          .data('name', key)
          .appendTo(this.contents);

        this.fields[key] = field;
      }
    }, this);

    return this;
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

  Panel.prototype.showField = function(name){
    this.getField(name).show();
    
    return this;
  };

  Panel.prototype.hideField = function(name){
    this.getField(name).hide();
    
    return this;
  };

  Panel.prototype.toggleState = function(){
    this.toggleClass('collapsed');
    
    return this;
  };

  Panel.prototype.disable = function(){
    this.addClass('disabled');
    
    return this;
  };

  Panel.prototype.enable = function(){
    this.removeClass('disabled');
    
    return this;
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
      
      this.triggerEvent('componentbeforeset', {'component': component}, false);

      this.component = component;

      this
        .setupFields(this.component.configs.properties)
        .updateFieldValues(this.getValues(Object.keys(this.getField())), true)
        .updateDraggable()
        .updateResizable()
        .addClass('has-component')
        .getToolbar().setSelectorValue(component.getId(), true);

      if(!(component instanceof metaScore.player.component.Controller)){
        this.getToolbar().toggleMenuItem('delete', true);
      }

      component.addClass('selected');

      if(supressEvent !== true){
        this.triggerEvent('componentset', {'component': component}, false);
      }
    }

    return this;
  };

  Panel.prototype.unsetComponent = function(supressEvent){
    var component = this.getComponent();

    this
      .removeClass('has-component')
      .getToolbar().toggleMenuItem('delete', false);

    if(component){
      this
        .updateDraggable(false)
        .updateResizable(false)
        .getToolbar().setSelectorValue(null, true);

      component.removeClass('selected');

      delete this.component;

      if(supressEvent !== true){
        this.triggerEvent('componentunset', {'component': component}, false);
      }
    }

    return this;
  };

  Panel.prototype.updateDraggable = function(draggable){
    var component = this.getComponent();
      
    if(draggable === undefined){
      draggable = this.getDraggable();
    }
    
    if(draggable){
      if(!component._draggable){
        component._draggable = new metaScore.Draggable(draggable);
        component
          .addListener('dragstart', this.onComponentDragStart)
          .addListener('drag', this.onComponentDrag)
          .addListener('dragend', this.onComponentDragEnd);
      }
    }
    else if(component._draggable){
      component._draggable.destroy();
      delete component._draggable;
      
      component
        .removeListener('dragstart', this.onComponentDragStart)
        .removeListener('drag', this.onComponentDrag)
        .removeListener('dragend', this.onComponentDragEnd);
    }
    
    this.toggleFields(['x', 'y'], draggable);
    
    return this;
  };

  Panel.prototype.updateResizable = function(resizable){
    var component = this.getComponent();
      
    if(resizable === undefined){
      resizable = this.getResizable();
    }
    
    if(resizable){
      if(!component._resizable){
        component._resizable = new metaScore.Resizable(resizable);
        component
          .addListener('resizestart', this.onComponentResizeStart)
          .addListener('resize', this.onComponentResize)
          .addListener('resizeend', this.onComponentResizeEnd);
      }
    }
    else if(component._resizable){
      component._resizable.destroy();
      delete component._resizable;
      
      component
        .removeListener('resizestart', this.onComponentResizeStart)
        .removeListener('resize', this.onComponentResize)
        .removeListener('resizeend', this.onComponentResizeEnd);
    }
    
    this.toggleFields(['width', 'height'], resizable);
    
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
    this.getField(name).setValue(value, supressEvent);
    
    return this;
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

    return this;
  };

  Panel.prototype.updateProperties = function(component, values){
    metaScore.Object.each(values, function(name, value){
      if(!this.getField(name).disabled){
        component.setProperty(name, value);
      }
    }, this);

    this.updateFieldValues(values, true);

    return this;
  };

  Panel.prototype.toggleFields = function(names, toggle){
    var field;
  
    metaScore.Array.each(names, function(index, name){
      if(field = this.getField(name)){
        if(toggle){
          field.enable();
        }
        else{
          field.disable();
        }
      }
    }, this);

    return this;
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