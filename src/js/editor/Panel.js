import {Dom} from '../core/Dom';
import {_Function} from '../core/utils/Function';
import {_Object} from '../core/utils/Object';
import {_Array} from '../core/utils/Array';
import {_Var} from '../core/utils/Var';
import {Toolbar} from './panel/Toolbar';

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

export default class Panel extends Dom {

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
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super('<div/>', {'class': 'panel'});

        // fix event handlers scope
        this.onComponentPropChange = _Function.proxy(this.onComponentPropChange, this);
        this.onComponentDragStart = _Function.proxy(this.onComponentDragStart, this);
        this.onComponentDrag = _Function.proxy(this.onComponentDrag, this);
        this.onComponentDragEnd = _Function.proxy(this.onComponentDragEnd, this);
        this.onComponentResizeStart = _Function.proxy(this.onComponentResizeStart, this);
        this.onComponentResize = _Function.proxy(this.onComponentResize, this);
        this.onComponentResizeEnd = _Function.proxy(this.onComponentResizeEnd, this);

        this.toolbar = new Toolbar(this.configs.toolbarConfigs)
            .addDelegate('.buttons [data-action]', 'click', _Function.proxy(this.onToolbarButtonClick, this))
            .appendTo(this);

        this.toolbar.getTitle()
            .addListener('click', _Function.proxy(this.toggleState, this));

        this.contents = new Dom('<div/>', {'class': 'fields'})
            .appendTo(this);

        this
            .addDelegate('.fields .field', 'valuechange', _Function.proxy(this.onFieldValueChange, this))
            .addDelegate('.fields .imagefield', 'resize', _Function.proxy(this.onImageFieldResize, this))
            .unsetComponent();
    }

    Panel.defaults = {
        'toolbarConfigs': {}
    };

    /**
     * Setup the panel's fields
     *
     * @method setupFields
     * @private
     * @param {Object} properties The properties description object
     * @chainable
     */
    setupFields(properties){
        var configs, fieldType, field;

        this.fields = {};
        this.contents.empty();

        _Object.each(properties, function(key, prop){
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
    getToolbar() {
        return this.toolbar;
    };

    /**
     * Get a field by name
     *
     * @method getField
     * @param {String} name The name of the field to get
     * @return {editor.Field} The field
     */
    getField(name){
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
    enableFields() {
        _Object.each(this.fields, function(key, field){
            field.enable();
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
    showField(name){
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
    hideField(name){
        this.getField(name).hide();

        return this;
    };

    /**
     * Toggle the panel's collapsed state
     *
     * @method toggleState
     * @chainable
     */
    toggleState() {
        this.toggleClass('collapsed');

        return this;
    };

    /**
     * Disable the panel
     *
     * @method disable
     * @chainable
     */
    disable() {
        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the panel
     *
     * @method enable
     * @chainable
     */
    enable() {
        this.removeClass('disabled');

        return this;
    };

    /**
     * Get the currently associated component
     *
     * @method getComponent
     * @return {player.Component} The component
     */
    getComponent() {
        return this.component;
    };

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    getSelectorLabel(component){
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
    setComponent(component, supressEvent){
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
    unsetComponent(supressEvent){
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
    updateDraggable(draggable){
        var component = this.getComponent();

        draggable = _Var.is(component.setDraggable, 'function') ? component.setDraggable(draggable) : false;

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
    updateResizable(resizable){
        var component = this.getComponent();

        resizable = _Var.is(component.setResizable, 'function') ? component.setResizable(resizable) : false;

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
    onToolbarButtonClick(evt){
        var selector, options, count, index,
            action = Dom.data(evt.target, 'action');

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

                    selector.setValue(new Dom(options.get(index)).val());
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

                    selector.setValue(new Dom(options.get(index)).val());
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
    onComponentPropChange(evt){           
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
    onComponentDragStart(evt){
        this._beforeDragValues = this.getValues(['x', 'y']);
    };

    /**
     * The component's drag event handler
     *
     * @method onComponentDrag
     * @private
     * @param {Event} evt The event object
     */
    onComponentDrag(evt){
        this.updateFieldValues(['x', 'y'], true);
    };

    /**
     * The component's dragend event handler
     *
     * @method onComponentDragEnd
     * @private
     * @param {Event} evt The event object
     */
    onComponentDragEnd(evt){
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
    onComponentResizeStart(evt){
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
    onComponentResize(evt){
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
    onComponentResizeEnd(evt){
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
    onFieldValueChange(evt){
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
    onImageFieldResize(evt){
        var panel = this,
            component, old_values, img;
        
        if(evt.detail.value){
            component = this.getComponent();
            
            if(!component.getProperty('locked')){
                old_values = this.getValues(['width', 'height']);
                
                img = new Dom('<img/>')
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
    updateFieldValue(name, value, supressEvent){
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
    updateFieldValues(values, supressEvent){
        if(_Var.is(values, 'array')){
            _Array.each(values, function(index, field){
                this.updateFieldValue(field, this.getValue(field), supressEvent);
            }, this);
        }
        else{
            _Object.each(values, function(field, value){
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
    updateProperties(component, values){
        _Object.each(values, function(name, value){
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
    toggleFields(names, toggle){
        var field;

        _Array.each(names, function(index, name){
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
    getValue(name){
        return this.getComponent().getProperty(name);
    };

    /**
     * Get the associated component's properties values
     *
     * @method getValues
     * @param {Array} [names] The names of properties, if not set, the panel's field names are used
     * @return {Object} A list of values keyed by property name
     */
    getValues(names){
        var values = {};

        names = names || Object.keys(this.getField());

        _Array.each(names, function(index, name){
            if(!this.getField(name).disabled){
                values[name] = this.getValue(name);
            }
        }, this);

        return values;
    };
    
}