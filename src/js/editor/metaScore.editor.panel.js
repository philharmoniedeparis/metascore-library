/**
* Description
* @class Panel
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').Panel = (function(){

  /**
   * Description
   * @constructor
   * @param {} configs
   */
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
      .addDelegate('.fields .field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
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

  /**
   * Description
   * @method setupFields
   * @param {} properties
   * @return ThisExpression
   */
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

  /**
   * Description
   * @method getToolbar
   * @return MemberExpression
   */
  Panel.prototype.getToolbar = function(){
    return this.toolbar;
  };

  /**
   * Description
   * @method getField
   * @param {} key
   * @return MemberExpression
   */
  Panel.prototype.getField = function(key){
    if(key === undefined){
      return this.fields;
    }

    return this.fields[key];
  };

  /**
   * Description
   * @method enableFields
   * @return 
   */
  Panel.prototype.enableFields = function(){
    metaScore.Object.each(this.fields, function(key, field){
      field.enable();
    }, this);
  };

  /**
   * Description
   * @method showField
   * @param {} name
   * @return ThisExpression
   */
  Panel.prototype.showField = function(name){
    this.getField(name).show();
    
    return this;
  };

  /**
   * Description
   * @method hideField
   * @param {} name
   * @return ThisExpression
   */
  Panel.prototype.hideField = function(name){
    this.getField(name).hide();
    
    return this;
  };

  /**
   * Description
   * @method toggleState
   * @return ThisExpression
   */
  Panel.prototype.toggleState = function(){
    this.toggleClass('collapsed');
    
    return this;
  };

  /**
   * Description
   * @method disable
   * @return ThisExpression
   */
  Panel.prototype.disable = function(){
    this.addClass('disabled');
    
    return this;
  };

  /**
   * Description
   * @method enable
   * @return ThisExpression
   */
  Panel.prototype.enable = function(){
    this.removeClass('disabled');
    
    return this;
  };

  /**
   * Description
   * @method getComponent
   * @return MemberExpression
   */
  Panel.prototype.getComponent = function(){
    return this.component;
  };

  /**
   * Description
   * @method setComponent
   * @param {} component
   * @param {} supressEvent
   * @return ThisExpression
   */
  Panel.prototype.setComponent = function(component, supressEvent){
    if(component !== this.getComponent()){
      if(!component){
        return this.unsetComponent();
      }
      
      this.unsetComponent(true);
      
      this.triggerEvent('componentbeforeset', {'component': component}, false);

      this.component = component;

      this
        .setupFields(this.component.configs.properties)
        .updateFieldValues(this.getValues(Object.keys(this.getField())), true)
        .updateDraggable(true)
        .updateResizable(true)
        .addClass('has-component')
        .getToolbar().setSelectorValue(component.getId(), true);

      if(!component.instanceOf('Controller') && !component.instanceOf('Media')){
        this.getToolbar().toggleMenuItem('delete', true);
      }

      component.addClass('selected');

      if(supressEvent !== true){
        this.triggerEvent('componentset', {'component': component}, false);
      }
    }

    return this;
  };

  /**
   * Description
   * @method unsetComponent
   * @param {} supressEvent
   * @return ThisExpression
   */
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

  /**
   * Description
   * @method updateDraggable
   * @param {} draggable
   * @return ThisExpression
   */
  Panel.prototype.updateDraggable = function(draggable){
    var component = this.getComponent();
    
    draggable = component.setDraggable(draggable);
    
    if(draggable){
      component
        .addListener('dragstart', this.onComponentDragStart)
        .addListener('drag', this.onComponentDrag)
        .addListener('dragend', this.onComponentDragEnd);
    }
    else{      
      component
        .removeListener('dragstart', this.onComponentDragStart)
        .removeListener('drag', this.onComponentDrag)
        .removeListener('dragend', this.onComponentDragEnd);
    }
    
    this.toggleFields(['x', 'y'], draggable ? true : false);
    
    return this;
  };

  /**
   * Description
   * @method updateResizable
   * @param {} resizable
   * @return ThisExpression
   */
  Panel.prototype.updateResizable = function(resizable){
    var component = this.getComponent();
      
    resizable = component.setResizable(resizable);
    
    if(resizable){
        component
          .addListener('resizestart', this.onComponentResizeStart)
          .addListener('resize', this.onComponentResize)
          .addListener('resizeend', this.onComponentResizeEnd);
    }
    else{      
      component
        .removeListener('resizestart', this.onComponentResizeStart)
        .removeListener('resize', this.onComponentResize)
        .removeListener('resizeend', this.onComponentResizeEnd);
    }
    
    this.toggleFields(['width', 'height'], resizable ? true : false);
    
    return this;
  };

  /**
   * Description
   * @method onComponentDragStart
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentDragStart = function(evt){
    var fields = ['x', 'y'];

    this._beforeDragValues = this.getValues(fields);
  };

  /**
   * Description
   * @method onComponentDrag
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentDrag = function(evt){
    var fields = ['x', 'y'];

    this.updateFieldValues(fields, true);
  };

  /**
   * Description
   * @method onComponentDragEnd
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentDragEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y'];

    this.updateFieldValues(fields, true);

    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);

    delete this._beforeDragValues;
  };

  /**
   * Description
   * @method onComponentResizeStart
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentResizeStart = function(evt){
    var fields = ['x', 'y', 'width', 'height'];

    this._beforeResizeValues = this.getValues(fields);
  };

  /**
   * Description
   * @method onComponentResize
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentResize = function(evt){
    var fields = ['x', 'y', 'width', 'height'];

    this.updateFieldValues(fields, true);
  };

  /**
   * Description
   * @method onComponentResizeEnd
   * @param {} evt
   * @return 
   */
  Panel.prototype.onComponentResizeEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y', 'width', 'height'];

    this.updateFieldValues(fields, true);

    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);

    delete this._beforeResizeValues;
  };

  /**
   * Description
   * @method onFieldValueChange
   * @param {} evt
   * @return 
   */
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
    
    switch(name){
      case 'locked':
        this.updateDraggable(!value);
        this.updateResizable(!value);
        break;
        
      case 'name':
        this.getToolbar().updateSelectorOption(component.getId(), value);
        break;
        
      case 'start-time':
        this.getField('end-time').setMin(value);
        break;
        
      case 'end-time':
        this.getField('start-time').setMax(value);
        break;
    }

    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
  };

  /**
   * Description
   * @method updateFieldValue
   * @param {} name
   * @param {} value
   * @param {} supressEvent
   * @return ThisExpression
   */
  Panel.prototype.updateFieldValue = function(name, value, supressEvent){
    this.getField(name).setValue(value, supressEvent);
    
    return this;
  };

  /**
   * Description
   * @method updateFieldValues
   * @param {} values
   * @param {} supressEvent
   * @return ThisExpression
   */
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

  /**
   * Description
   * @method updateProperties
   * @param {} component
   * @param {} values
   * @return ThisExpression
   */
  Panel.prototype.updateProperties = function(component, values){
    metaScore.Object.each(values, function(name, value){
      if(!this.getField(name).disabled){
        component.setProperty(name, value);
      }
    }, this);

    this.updateFieldValues(values, true);

    return this;
  };

  /**
   * Description
   * @method toggleFields
   * @param {} names
   * @param {} toggle
   * @return ThisExpression
   */
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

  /**
   * Description
   * @method getValue
   * @param {} name
   * @return CallExpression
   */
  Panel.prototype.getValue = function(name){
    return this.getComponent().getProperty(name);
  };

  /**
   * Description
   * @method getValues
   * @param {} fields
   * @return values
   */
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