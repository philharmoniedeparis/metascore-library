import Dom from '../core/Dom';
import Toolbar from './panel/Toolbar';
import {isArray, isFunction} from '../core/utils/Var';

import BorderRadiusField from './field/BorderRadius';
import ButtonsField from './field/Buttons';
import CheckboxField from './field/Checkbox';
import CheckboxesField from './field/Checkboxes';
import ColorField from './field/Color';
import FileField from './field/File';
import ImageField from './field/Image';
import NumberField from './field/Number';
import SelectField from './field/Select';
import TextField from './field/Text';
import TextareaField from './field/Textarea';
import TimeField from './field/Time';

const FIELD_TYPES = {
    'BorderRadius': BorderRadiusField,
    'Buttons': ButtonsField,
    'Checkbox': CheckboxField,
    'Checkboxes': CheckboxesField,
    'Color': ColorField,
    'File': FileField,
    'Image': ImageField,
    'Number': NumberField,
    'Select': SelectField,
    'Text': TextField,
    'Textarea': TextareaField,
    'Time': TimeField,
};

/**
 * Fired before a component is set
 *
 * @event componentbeforeset
 * @param {Object} component The component instance
 */
const EVT_COMPONENTBEFORESET = 'componentbeforeset';

/**
 * Fired when a component is set
 *
 * @event componentset
 * @param {Object} component The component instance
 */
const EVT_COMPONENTSET = 'componentset';

/**
 * Fired before a component is unset
 *
 * @event componentbeforeunset
 * @param {Object} component The component instance
 */
const EVT_COMPONENTBEFOREUNSET = 'componentbeforeunset';

/**
 * Fired when a component is unset
 *
 * @event componentunset
 * @param {Object} component The component instance
 */
const EVT_COMPONENTUNSET = 'componentunset';

/**
 * Fired when a component's values change
 *
 * @event valueschange
 * @param {Object} component The component instance
 * @param {Object} old_values The component instance
 * @param {Object} new_values The component instance
 */
const EVT_VALUESCHANGE = 'valueschange';

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
        // call parent constructor
        super('<div/>', {'class': 'panel'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // fix event handlers scope
        this.onComponentPropChange = this.onComponentPropChange.bind(this);
        this.onComponentDragStart = this.onComponentDragStart.bind(this);
        this.onComponentDrag = this.onComponentDrag.bind(this);
        this.onComponentDragEnd = this.onComponentDragEnd.bind(this);
        this.onComponentResizeStart = this.onComponentResizeStart.bind(this);
        this.onComponentResize = this.onComponentResize.bind(this);
        this.onComponentResizeEnd = this.onComponentResizeEnd.bind(this);

        this.toolbar = new Toolbar(this.configs.toolbarConfigs)
            .addDelegate('.buttons [data-action]', 'click', this.onToolbarButtonClick.bind(this))
            .appendTo(this);

        this.toolbar.getTitle()
            .addListener('click', this.toggleState.bind(this));

        this.contents = new Dom('<div/>', {'class': 'fields'})
            .appendTo(this);

        this
            .addDelegate('.fields .field', 'valuechange', this.onFieldValueChange.bind(this))
            .addDelegate('.fields .imagefield', 'resize', this.onImageFieldResize.bind(this))
            .unsetComponent();
    }

    static getDefaults() {
        return {
            'toolbarConfigs': {}
        };
    }

    /**
     * Setup the panel's fields
     *
     * @method setupFields
     * @private
     * @param {Object} properties The properties description object
     * @chainable
     */
    setupFields(properties){
        let configs, field;

        this.fields = {};
        this.contents.empty();

		Object.entries(properties).forEach(([key, prop]) => {
            if(prop.editable !== false){
                configs = prop.configs || {};

                field = new FIELD_TYPES[prop.type](configs)
                    .data('name', key)
                    .appendTo(this.contents);

                this.fields[key] = field;
            }
        });

        return this;
    }

    /**
     * Get the panel's toolbar
     *
     * @method getToolbar
     * @return {editor.panel.Toolbar} The toolbar
     */
    getToolbar() {
        return this.toolbar;
    }

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
    }

    /**
     * Enable all fields
     *
     * @method enableFields
     * @chainable
     */
    enableFields() {
		Object.entries(this.fields).forEach(([, field]) => {
            field.enable();
        });

        return this;
    }

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
    }

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
    }

    /**
     * Toggle the panel's collapsed state
     *
     * @method toggleState
     * @chainable
     */
    toggleState() {
        this.toggleClass('collapsed');

        return this;
    }

    /**
     * Disable the panel
     *
     * @method disable
     * @chainable
     */
    disable() {
        this.addClass('disabled');

        return this;
    }

    /**
     * Enable the panel
     *
     * @method enable
     * @chainable
     */
    enable() {
        this.removeClass('disabled');

        return this;
    }

    /**
     * Get the currently associated component
     *
     * @method getComponent
     * @return {player.Component} The component
     */
    getComponent() {
        return this.component;
    }

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    getSelectorLabel(component){
        return component.getName();
    }

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
    }

    /**
     * Unset the associated component
     *
     * @method unsetComponent
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    unsetComponent(supressEvent){
        let component = this.getComponent(),
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
    }

    /**
     * Set or unset the draggability of the associated component
     *
     * @method updateDraggable
     * @private
     * @param {Boolean} draggable Whether the component should be draggable
     * @chainable
     */
    updateDraggable(draggable){
        const component = this.getComponent();

        draggable = isFunction(component.setDraggable) ? component.setDraggable(draggable) : false;

        this.toggleFields(['x', 'y'], draggable ? true : false);

        return this;
    }

    /**
     * Set or unset the resizability of the associated component
     *
     * @method updateResizable
     * @private
     * @param {Boolean} resizable Whether the component should be resizable
     * @chainable
     */
    updateResizable(resizable){
        const component = this.getComponent();

        resizable = isFunction(component.setResizable) ? component.setResizable(resizable) : false;

        this.toggleFields(['width', 'height'], resizable ? true : false);

        return this;
    }

    /**
     * The toolbar buttons' click event handler
     *
     * @method onToolbarButtonClick
     * @private
     * @param {Event} evt The event object
     */
    onToolbarButtonClick(evt){
        let selector, options, count, index,
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
    }

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
    }

    /**
     * The component's dragstart event handler
     *
     * @method onComponentDragStart
     * @private
     */
    onComponentDragStart(){
        this._beforeDragValues = this.getValues(['x', 'y']);
    }

    /**
     * The component's drag event handler
     *
     * @method onComponentDrag
     * @private
     */
    onComponentDrag(){
        this.updateFieldValues(['x', 'y'], true);
    }

    /**
     * The component's dragend event handler
     *
     * @method onComponentDragEnd
     * @private
     */
    onComponentDragEnd(){
        let component = this.getComponent(),
            fields = ['x', 'y'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeDragValues;
    }

    /**
     * The component's resizestart event handler
     *
     * @method onComponentResizeStart
     * @private
     */
    onComponentResizeStart(){
        const fields = ['x', 'y', 'width', 'height'];

        this._beforeResizeValues = this.getValues(fields);
    }

    /**
     * The component's resize event handler
     *
     * @method onComponentResize
     * @private
     */
    onComponentResize(){
        const fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);
    }

    /**
     * The component's resizeend event handler
     *
     * @method onComponentResizeEnd
     * @private
     */
    onComponentResizeEnd(){
        let component = this.getComponent(),
            fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeResizeValues;
    }

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt){
        let component = this.getComponent(),
            name, value, old_values;

        if(!component){
            return;
        }

        name = evt.detail.field.data('name');
        value = evt.detail.value;
        old_values = this.getValues([name]);

        component.setProperty(name, value);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
    }

    /**
     * The imagefields' resize event handler
     *
     * @method onImageFieldResize
     * @private
     * @param {Event} evt The event object
     */
    onImageFieldResize(evt){
        let panel = this,
            component, old_values;

        if(evt.detail.value){
            component = this.getComponent();

            if(!component.getProperty('locked')){
                old_values = this.getValues(['width', 'height']);

                new Dom('<img/>')
                    .addListener('load', (load_evt) => {
                        panel.updateProperties(component, {'width': load_evt.target.width, 'height': load_evt.target.height});
                        panel.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': old_values, 'new_values': panel.getValues(['width', 'height'])}, false);
                    })
                    .attr('src', component.get(0).baseURI + evt.detail.value);
            }
        }
    }

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
        let field, component;

        field = this.getField(name);
        if(field){
            field.setValue(value, supressEvent);
        }

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
    }

    /**
     * Update fields' values
     *
     * @method updateFieldValues
     * @param {Object} values A list of values with the field names as keys
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    updateFieldValues(values, supressEvent){
        if(isArray(values)){
            values.forEach((field) => {
                this.updateFieldValue(field, this.getValue(field), supressEvent);
            });
        }
        else{
			Object.entries(values).forEach(([field, value]) => {
                this.updateFieldValue(field, value, supressEvent);
            });
        }

        return this;
    }

    /**
     * Update a component's properties
     *
     * @method updateProperties
     * @param {player.Component} component The component to update
     * @param {Object} values A list of values with the property names as keys
     * @chainable
     */
    updateProperties(component, values){
		Object.entries(values).forEach(([name, value]) => {
            if(!this.getField(name).disabled){
                component.setProperty(name, value);
            }
        });

        this.updateFieldValues(values, true);

        return this;
    }

    /**
     * Toggle the enabled state of some fields
     *
     * @method toggleFields
     * @param {Array} names The list of field names to toggle
     * @param {Boolean} toggle Whether the fields are to be enabled or disabled
     * @chainable
     */
    toggleFields(names, toggle){
        let field;

        names.forEach((name) => {
            field = this.getField(name);

            if(field){
                if(toggle){
                    field.enable();
                }
                else{
                    field.disable();
                }
            }
        });

        return this;
    }

    /**
     * Get the associated component's property value
     *
     * @method getValue
     * @param {String} name The propoerty's name
     * @return {Mixed} The value
     */
    getValue(name){
        return this.getComponent().getProperty(name);
    }

    /**
     * Get the associated component's properties values
     *
     * @method getValues
     * @param {Array} [names] The names of properties, if not set, the panel's field names are used
     * @return {Object} A list of values keyed by property name
     */
    getValues(names){
        const values = {};

        names = names || Object.keys(this.getField());

        names.forEach((name) => {
            if(!this.getField(name).disabled){
                values[name] = this.getValue(name);
            }
        });

        return values;
    }

}
