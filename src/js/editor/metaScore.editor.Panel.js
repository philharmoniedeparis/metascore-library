/** 
 * @module Editor
 */

metaScore.namespace('editor').Panel = (function(){

    /**
     * Fired before a component is set
     *
     * @event componentbeforeset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTBEFORESET = 'componentbeforeset';

    /**
     * Fired when a component is set
     *
     * @event componentset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTSET = 'componentset';

    /**
     * Fired before a component is unset
     *
     * @event componentbeforeunset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTBEFOREUNSET = 'componentbeforeunset';

    /**
     * Fired when a component is unset
     *
     * @event componentunset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTUNSET = 'componentunset';

    /**
     * Fired when a component's values change
     *
     * @event valueschange
     * @param {Object} component The component instance
     * @param {Object} old_values The component instance
     * @param {Object} new_values The component instance
     */
    var EVT_VALUESCHANGE = 'valueschange';

    /**
     * A generic panel class
     *
     * @class Panel
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function Panel(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Panel.parent.call(this, '<div/>', {'class': 'panel'});

        // fix event handlers scope
        this.onComponentPropChange = metaScore.Function.proxy(this.onComponentPropChange, this);
        this.onComponentDragStart = metaScore.Function.proxy(this.onComponentDragStart, this);
        this.onComponentDrag = metaScore.Function.proxy(this.onComponentDrag, this);
        this.onComponentDragEnd = metaScore.Function.proxy(this.onComponentDragEnd, this);
        this.onComponentResizeStart = metaScore.Function.proxy(this.onComponentResizeStart, this);
        this.onComponentResize = metaScore.Function.proxy(this.onComponentResize, this);
        this.onComponentResizeEnd = metaScore.Function.proxy(this.onComponentResizeEnd, this);

        this.toolbar = new metaScore.editor.panel.Toolbar(this.configs.toolbarConfigs)
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onToolbarButtonClick, this))
            .appendTo(this);

        this.toolbar.getTitle()
            .addListener('click', metaScore.Function.proxy(this.toggleState, this));

        this.contents = new metaScore.Dom('<div/>', {'class': 'fields'})
            .appendTo(this);

        this
            .addDelegate('.fields .field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .addDelegate('.fields .imagefield', 'resize', metaScore.Function.proxy(this.onImageFieldResize, this))
            .unsetComponent();
    }

    Panel.defaults = {
        'toolbarConfigs': {}
    };

    metaScore.Dom.extend(Panel);

    /**
     * Setup the panel's fields
     *
     * @method setupFields
     * @private
     * @param {Object} properties The properties description object
     * @chainable
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
     * Get the panel's toolbar
     *
     * @method getToolbar
     * @return {editor.panel.Toolbar} The toolbar
     */
    Panel.prototype.getToolbar = function(){
        return this.toolbar;
    };

    /**
     * Get a field by name
     *
     * @method getField
     * @param {String} name The name of the field to get
     * @return {editor.Field} The field
     */
    Panel.prototype.getField = function(name){
        if(name === undefined){
            return this.fields;
        }

        return this.fields[name];
    };

    /**
     * Enable all fields
     *
     * @method enableFields
     * @chainable
     */
    Panel.prototype.enableFields = function(){
        metaScore.Object.each(this.fields, function(key, field){
            field.enable();
        }, this);
        
        return this;
    };

    /**
     * Reset all fields
     *
     * @method resetFields
     * @chainable
     */
    Panel.prototype.resetFields = function(supressEvent){
        metaScore.Object.each(this.fields, function(key, field){
            field.reset(supressEvent);
        }, this);
        
        return this;
    };

    /**
     * Show a field by name
     *
     * @method showField
     * @param {String} name The name of the field to show
     * @chainable
     */
    Panel.prototype.showField = function(name){
        this.getField(name).show();

        return this;
    };

    /**
     * Hide a field by name
     *
     * @method hideField
     * @param {String} name The name of the field to show
     * @chainable
     */
    Panel.prototype.hideField = function(name){
        this.getField(name).hide();

        return this;
    };

    /**
     * Toggle the panel's collapsed state
     *
     * @method toggleState
     * @chainable
     */
    Panel.prototype.toggleState = function(){
        this.toggleClass('collapsed');

        return this;
    };

    /**
     * Disable the panel
     *
     * @method disable
     * @chainable
     */
    Panel.prototype.disable = function(){
        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the panel
     *
     * @method enable
     * @chainable
     */
    Panel.prototype.enable = function(){
        this.removeClass('disabled');

        return this;
    };

    /**
     * Get the currently associated component
     *
     * @method getComponent
     * @return {player.Component} The component
     */
    Panel.prototype.getComponent = function(){
        return this.component;
    };

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    Panel.prototype.getSelectorLabel = function(component){
        return component.getName();
    };

    /**
     * Set the associated component
     *
     * @method setComponent
     * @param {player.Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.setComponent = function(component, supressEvent){
        if(component !== this.getComponent()){
            if(!component){
                return this.unsetComponent();
            }

            this.unsetComponent(true);

            this.triggerEvent(EVT_COMPONENTBEFORESET, {'component': component}, false);

            this.component = component;

            this
                .setupFields(this.component.configs.properties)
                .updateFieldValues(this.getValues(Object.keys(this.getField())), true)
                .addClass('has-component');

            this.getToolbar().getSelector().setValue(component.getId(), true);

            if(!component.instanceOf('Controller') && !component.instanceOf('Media')){
                this.getToolbar().toggleMenuItem('delete', true);
            }

            component
                .addClass('selected')
                .addListener('propchange', this.onComponentPropChange)
                .addListener('dragstart', this.onComponentDragStart)
                .addListener('drag', this.onComponentDrag)
                .addListener('dragend', this.onComponentDragEnd)
                .addListener('resizestart', this.onComponentResizeStart)
                .addListener('resize', this.onComponentResize)
                .addListener('resizeend', this.onComponentResizeEnd);

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unset the associated component
     *
     * @method unsetComponent
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.unsetComponent = function(supressEvent){
        var component = this.getComponent(),
            toolbar = this.getToolbar();

        this.removeClass('has-component');
        toolbar.toggleMenuItem('delete', false);

        if(component){
            this.triggerEvent(EVT_COMPONENTBEFOREUNSET, {'component': component}, false);
        
            this
                .updateDraggable(false)
                .updateResizable(false);

            toolbar.getSelector().setValue(null, true);

            component
                .removeClass('selected')
                .removeListener('propchange', this.onComponentPropChange)
                .removeListener('dragstart', this.onComponentDragStart)
                .removeListener('drag', this.onComponentDrag)
                .removeListener('dragend', this.onComponentDragEnd)
                .removeListener('resizestart', this.onComponentResizeStart)
                .removeListener('resize', this.onComponentResize)
                .removeListener('resizeend', this.onComponentResizeEnd);

            delete this.component;
                
            this.resetFields(true);

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTUNSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Set or unset the draggability of the associated component
     *
     * @method updateDraggable
     * @private
     * @param {Boolean} draggable Whether the component should be draggable
     * @chainable
     */
    Panel.prototype.updateDraggable = function(draggable){
        var component = this.getComponent();

        draggable = metaScore.Var.is(component.setDraggable, 'function') ? component.setDraggable(draggable) : false;

        this.toggleFields(['x', 'y'], draggable ? true : false);

        return this;
    };

    /**
     * Set or unset the resizability of the associated component
     *
     * @method updateResizable
     * @private
     * @param {Boolean} resizable Whether the component should be resizable
     * @chainable
     */
    Panel.prototype.updateResizable = function(resizable){
        var component = this.getComponent();

        resizable = metaScore.Var.is(component.setResizable, 'function') ? component.setResizable(resizable) : false;

        this.toggleFields(['width', 'height'], resizable ? true : false);

        return this;
    };

    /**
     * The toolbar buttons' click event handler
     *
     * @method onToolbarButtonClick
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onToolbarButtonClick = function(evt){
        var selector, options, count, index,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'previous':
                selector = this.getToolbar().getSelector();
                options = selector.find('option[value^="component"]');
                count = options.count();

                if(count > 0){
                    index = options.index(':checked') - 1;

                    if(index < 0){
                        index = count - 1;
                    }

                    selector.setValue(new metaScore.Dom(options.get(index)).val());
                }

                evt.stopPropagation();
                break;

            case 'next':
                selector = this.getToolbar().getSelector();
                options = selector.find('option[value^="component"]');
                count = options.count();

                if(count > 0){
                    index = options.index(':checked') + 1;

                    if(index >= count){
                        index = 0;
                    }

                    selector.setValue(new metaScore.Dom(options.get(index)).val());
                }

                evt.stopPropagation();
                break;
        }
    };

    /**
     * The component's propchange event handler
     *
     * @method onComponentPropChange
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentPropChange = function(evt){           
        if(evt.detail.component !== this.getComponent()){
            return;
        }
        
        this.updateFieldValue(evt.detail.property, evt.detail.value, true);
    };

    /**
     * The component's dragstart event handler
     *
     * @method onComponentDragStart
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDragStart = function(evt){
        this._beforeDragValues = this.getValues(['x', 'y']);
    };

    /**
     * The component's drag event handler
     *
     * @method onComponentDrag
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDrag = function(evt){
        this.updateFieldValues(['x', 'y'], true);
    };

    /**
     * The component's dragend event handler
     *
     * @method onComponentDragEnd
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDragEnd = function(evt){
        var component = this.getComponent(),
            fields = ['x', 'y'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeDragValues;
    };

    /**
     * The component's resizestart event handler
     *
     * @method onComponentResizeStart
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResizeStart = function(evt){
        var fields = ['x', 'y', 'width', 'height'];

        this._beforeResizeValues = this.getValues(fields);
    };

    /**
     * The component's resize event handler
     *
     * @method onComponentResize
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResize = function(evt){
        var fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);
    };

    /**
     * The component's resizeend event handler
     *
     * @method onComponentResizeEnd
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResizeEnd = function(evt){
        var component = this.getComponent(),
            fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeResizeValues;
    };

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
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

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
    };

    /**
     * The imagefields' resize event handler
     *
     * @method onImageFieldResize
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onImageFieldResize = function(evt){
        var panel = this,
            component, old_values, img;
        
        if(evt.detail.value){
            component = this.getComponent();
            
            if(!component.getProperty('locked')){
                old_values = this.getValues(['width', 'height']);
                
                img = new metaScore.Dom('<img/>')
                    .addListener('load', function(evt){
                        panel.updateProperties(component, {'width': evt.target.width, 'height': evt.target.height});
                        panel.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': old_values, 'new_values': panel.getValues(['width', 'height'])}, false);
                    })
                    .attr('src', evt.detail.value);
            }
        }
    };

    /**
     * Update a field's value
     *
     * @method updateFieldValue
     * @param {String} name The field's name
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     *
     * @todo add the synched/non synched strings to blocks (see Editor.updateBlockSelector)
     */
    Panel.prototype.updateFieldValue = function(name, value, supressEvent){
        var component;
        
        this.getField(name).setValue(value, supressEvent);

        switch(name){
            case 'locked':
                this.toggleClass('locked', value);
                this.updateDraggable(!value);
                this.updateResizable(!value);
                break;

            case 'name':
                component = this.getComponent();
                this.getToolbar().getSelector().updateOption(component.getId(), this.getSelectorLabel(component));
                break;

            case 'start-time':
                this.getField('end-time').setMin(value);
                break;

            case 'end-time':
                this.getField('start-time').setMax(value);
                break;
        }

        return this;
    };

    /**
     * Update fields' values
     *
     * @method updateFieldValues
     * @param {Object} values A list of values with the field names as keys
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
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
     * Update a component's properties
     *
     * @method updateProperties
     * @param {player.Component} component The component to update
     * @param {Object} values A list of values with the property names as keys
     * @chainable
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
     * Toggle the enabled state of some fields
     *
     * @method toggleFields
     * @param {Array} names The list of field names to toggle
     * @param {Boolean} toggle Whether the fields are to be enabled or disabled
     * @chainable
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
     * Get the associated component's property value
     *
     * @method getValue
     * @param {String} name The propoerty's name
     * @return {Mixed} The value
     */
    Panel.prototype.getValue = function(name){
        return this.getComponent().getProperty(name);
    };

    /**
     * Get the associated component's properties values
     *
     * @method getValues
     * @param {Array} [names] The names of properties, if not set, the panel's field names are used
     * @return {Object} A list of values keyed by property name
     */
    Panel.prototype.getValues = function(names){
        var values = {};

        names = names || Object.keys(this.getField());

        metaScore.Array.each(names, function(index, name){
            if(!this.getField(name).disabled){
                values[name] = this.getValue(name);
            }
        }, this);

        return values;
    };

    return Panel;

})();