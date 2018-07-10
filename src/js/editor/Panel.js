import Dom from '../core/Dom';
import Toolbar from './panel/Toolbar';
import {isFunction} from '../core/utils/Var';
import Locale from '../core/Locale';
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
 * Fired when multuiple components are set
 *
 * @event componentset
 * @param {Component} component The component instance
 */
const EVT_COMPONENTSET = 'componentset';

/**
 * Fired when a component is unset
 *
 * @event componentunset
 * @param {Component} component The component instance
 */
const EVT_COMPONENTUNSET = 'componentunset';

/**
 * Fired when a component's values change
 *
 * @event valueschange
 * @param {Component} component The component instance
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

        this.components = [];

        // fix event handlers scope
        this.onComponentPropChange = this.onComponentPropChange.bind(this);
        this.onComponentDragStart = this.onComponentDragStart.bind(this);
        this.onComponentDrag = this.onComponentDrag.bind(this);
        this.onComponentDragEnd = this.onComponentDragEnd.bind(this);
        this.onComponentResizeStart = this.onComponentResizeStart.bind(this);
        this.onComponentResize = this.onComponentResize.bind(this);
        this.onComponentResizeEnd = this.onComponentResizeEnd.bind(this);

        this.toolbar = new Toolbar(Object.assign({}, this.configs.toolbarConfigs, {'multiSelection': this.configs.allowMultiple}))
            .addDelegate('.buttons [data-action]', 'click', this.onToolbarButtonClick.bind(this))
            .appendTo(this);

        this.toolbar.getTitle()
            .addListener('click', this.toggleState.bind(this));

        this.contents = new Dom('<div/>', {'class': 'fields'})
            .appendTo(this);

        this
            .addDelegate('.fields .field', 'valuechange', this.onFieldValueChange.bind(this))
            .addDelegate('.fields .imagefield', 'resize', this.onImageFieldResize.bind(this));
    }

    static getDefaults() {
        return {
            'allowMultiple': true,
            'toolbarConfigs': {}
        };
    }

    /**
     * Update the panel's UI
     *
     * @method updateUI
     * @private
     * @chainable
     */
    updateUI(){
        this.fields = {};

        this.removeClass('has-component')
            .contents.empty();

        if(this.components.length > 0){
            const properties = this.getComponent().removeClass('selected').getProperties();

            Object.entries(properties).forEach(([key, prop]) => {
                if(prop.editable !== false){
                    let configs = prop.configs || {};

                    let field = new FIELD_TYPES[prop.type](configs)
                        .data('name', key)
                        .appendTo(this.contents);

                    this.fields[key] = field;
                }
            });

            this.refreshFieldValues(Object.keys(this.fields), true);

            // TODO: improve
            // hide fields that are not common with all components
            Object.entries(this.getField()).forEach(([name]) => {
                const common = this.components.every((component) => {
                    return component.hasProperty(name) && component.getProperty(name).editable !== false;
                });

                this[`${common ? 'show' : 'hide'}Field`](name);
            });

            this.getComponent().addClass('selected');

            this.addClass('has-component');
        }
        else{
            this.getToolbar().toggleMenuItem('delete', false);
        }

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
     * Get all set components
     *
     * @method getComponents
     * @return {Component[]} The components
     */
    getComponents() {
        return this.components;
    }

    /**
     * Get a set component by index
     *
     * @method getComponent
     * @param {Number} [index=0] The component's index
     * @return {Component} The component at the specified index
     */
    getComponent(index) {
        return this.components[index || 0];
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
     * Set a component
     *
     * @method setComponent
     * @param {Component} component The component
     * @param {Boolean} [keepExisting=false] Whether to keep other set components
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setComponent(component, keepExisting, supressEvent){
        if(keepExisting !== true || !this.configs.allowMultiple){
            this.components.filter((comp) => comp !== component).forEach((comp) => {
                this.unsetComponent(comp);
            });
        }

        if(this.components.includes(component)){
            return this;
        }

        this.components.push(component);

        this.updateUI();

        component
            .addClass('selected')
            .addListener('propchange', this.onComponentPropChange)
            .addListener('dragstart', this.onComponentDragStart)
            .addListener('drag', this.onComponentDrag)
            .addListener('dragend', this.onComponentDragEnd)
            .addListener('resizestart', this.onComponentResizeStart)
            .addListener('resize', this.onComponentResize)
            .addListener('resizeend', this.onComponentResizeEnd);

        if(!this.hasClass('locked')){
            if(isFunction(component.setDraggable)){
                component.setDraggable(true);
            }
            if(isFunction(component.setResizable)){
                component.setResizable(true);
            }
        }

        this.getToolbar().getSelector().addValue(component.getId(), true);

        if(supressEvent !== true){
            this.triggerEvent(EVT_COMPONENTSET, {'component': component, 'count': this.components.length}, false);
        }

        return this;
    }

    /**
     * Unset the associated components
     *
     * @method unsetComponents
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    unsetComponent(component, supressEvent){
        if(!this.components.includes(component)){
            return this;
        }

        this.components.splice(this.components.indexOf(component), 1);

        this.updateUI();

        component
            .removeClass('selected')
            .removeListener('propchange', this.onComponentPropChange)
            .removeListener('dragstart', this.onComponentDragStart)
            .removeListener('drag', this.onComponentDrag)
            .removeListener('dragend', this.onComponentDragEnd)
            .removeListener('resizestart', this.onComponentResizeStart)
            .removeListener('resize', this.onComponentResize)
            .removeListener('resizeend', this.onComponentResizeEnd);

        if(isFunction(component.setDraggable)){
            component.setDraggable(false);
        }
        if(isFunction(component.setResizable)){
            component.setResizable(false);
        }

        this.getToolbar().getSelector().removeValue(component.getId(), true);

        if(supressEvent !== true){
            this.triggerEvent(EVT_COMPONENTUNSET, {'component': component, 'count': this.components.length}, false);
        }

        return this;
    }

    /**
     * Unset all components
     *
     * @method unsetComponents
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    unsetComponents(supressEvent){
        for (let i = this.components.length - 1; i >= 0; i -= 1) {
            this.unsetComponent(this.components[i], supressEvent);
        }

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
            case 'next':
            case 'previous':
                selector = this.getToolbar().getSelector();
                options = selector.getOptions();
                count = options.count();

                if(count > 0){
                    if(action === 'previous'){
                        index = options.index('.selected') - 1;
                        if(index < 0){
                            index = count - 1;
                        }
                    }
                    else{
                        index = options.index('.selected') + 1;
                        if(index >= count){
                            index = 0;
                        }
                    }

                    selector.setValue(Dom.data(options.get(index), 'value'));
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
        const component = evt.detail.component;
        const property = evt.detail.property;
        const value = evt.detail.value;

        switch(property){
            case 'locked':
                if(isFunction(component.setDraggable)){
                    component.setDraggable(!value);
                }
                if(isFunction(component.setResizable)){
                    component.setResizable(!value);
                }
                break;

            case 'name':
                this.getToolbar().getSelector().updateOption(component.getId(), this.getSelectorLabel(component));
                break;
        }

        if(component === this.getComponent()){
            this.refreshFieldValue(property, true);
        }

    }

    /**
     * The component's dragstart event handler
     *
     * @method onComponentDragStart
     * @private
     */
    onComponentDragStart(){
        this._beforeDragValues = [];

        this.components.forEach((component) => {
            this._beforeDragValues.push({
                'x': component.getPropertyValue('x'),
                'y': component.getPropertyValue('y')
            });
        });
    }

    /**
     * The component's drag event handler
     *
     * @method onComponentDrag
     * @private
     */
    onComponentDrag(evt){
        const components = this.getComponents();
        let offsetX = evt.detail.offsetX;
        let offsetY = evt.detail.offsetY;

        components.forEach((component) => {
            const left = parseInt(component.css('left'), 10);
            const top = parseInt(component.css('top'), 10);

            if(left + offsetX < 0){
                offsetX = left * -1;
            }

            if(top + offsetY < 0){
                offsetY = top * -1;
            }
        });

        components.forEach((component) => {
            const left = parseInt(component.css('left'), 10) + offsetX;
            const top = parseInt(component.css('top'), 10) + offsetY;

            component
                .css('left', `${left}px`)
                .css('top', `${top}px`);
        });

        this.refreshFieldValues(['x', 'y'], true);
    }

    /**
     * The component's dragend event handler
     *
     * @method onComponentDragEnd
     * @private
     */
    onComponentDragEnd(){
        const fields = ['x', 'y'];

        this.refreshFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'components': this.components, 'old_values': this._beforeDragValues, 'new_values': this.getPropertyValues(fields)}, false);

        delete this._beforeDragValues;
    }

    /**
     * The component's resizestart event handler
     *
     * @method onComponentResizeStart
     * @private
     */
    onComponentResizeStart(){
        const values = this.getPropertyValues(['x', 'y', 'width', 'height']);
        this._beforeResizeValues = [values];
    }

    /**
     * The component's resize event handler
     *
     * @method onComponentResize
     * @private
     */
    onComponentResize(){
        this.refreshFieldValues(['x', 'y', 'width', 'height'], true);
    }

    /**
     * The component's resizeend event handler
     *
     * @method onComponentResizeEnd
     * @private
     */
    onComponentResizeEnd(evt){
        let component = evt.target._metaScore,
            fields = ['x', 'y', 'width', 'height'];

        this.refreshFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'components': [component], 'old_values': this._beforeResizeValues, 'new_values': this.getPropertyValues(fields)}, false);

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
        const name = evt.detail.field.data('name');
        const value = evt.detail.value;
        const old_values = [];

        this.components.forEach((component) => {
            old_values.push({
                [name]: component.getPropertyValue(name)
            });

            component.setPropertyValue(name, value);
        });

        this.toggleMultival(evt.detail.field, false);

        this.triggerEvent(EVT_VALUESCHANGE, {'components': this.components, 'old_values': old_values, 'new_values': this.getPropertyValues([name])}, false);
    }

    /**
     * The imagefields' resize event handler
     *
     * @method onImageFieldResize
     * @private
     * @param {Event} evt The event object
     */
    onImageFieldResize(evt){
        if(!evt.detail.value){
            return;
        }

        const callback = (load_evt) => {
            const width = load_evt.target.width;
            const height = load_evt.target.height;
            const old_values = [];

            this.components.forEach((component) => {
                old_values.push({
                    'width': component.getPropertyValue('width'),
                    'height': component.getPropertyValue('height')
                });

                component.setPropertyValue('width', width);
                component.setPropertyValue('height', height);
            });

            this.triggerEvent(EVT_VALUESCHANGE, {'components': this.components, 'old_values': old_values, 'new_values': this.getPropertyValues(['width', 'height'])}, false);
        };

        new Dom('<img/>')
            .addListener('load', callback)
            .attr('src', this.getComponent().get(0).baseURI + evt.detail.value);
    }

    /**
     * Update a field's value
     *
     * @method refreshFieldValue
     * @param {String} name The field's name
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     *
     * @todo add the synched/non synched strings to blocks (see Editor.updateBlockSelector)
     */
    refreshFieldValue(name, supressEvent){
        const value = this.getComponent().getPropertyValue(name);
        const field = this.getField(name);

        if(field){
            const multival = this.components.length > 1 && this.components.some((component) => {
                return component.getPropertyValue(name) !== value;
            });

            field.setValue(value, supressEvent);

            this.toggleMultival(field, multival);
        }

        switch(name){
            case 'locked':
                this
                    .toggleClass('locked', value)
                    .toggleFields(['x', 'y'], !value)
                    .toggleFields(['width', 'height'], !value);
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
     * @method refreshFieldValues
     * @param {Array} fields A list of field names
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    refreshFieldValues(names, supressEvent){
        names = names || Object.keys(this.getField());

        names.forEach((name) => {
            this.refreshFieldValue(name, supressEvent);
        });

        return this;
    }

    /**
     * Get the associated component's properties values
     *
     * @method getPropertyValues
     * @param {Array} [names] The names of properties, if not set, the panel's field names are used
     * @return {Object} A list of values keyed by property name
     */
    getPropertyValues(names){
        const values = {};
        const component = this.getComponent();

        names = names || Object.keys(this.getField());

        names.forEach((name) => {
            if(!this.getField(name).disabled){
                values[name] = component.getPropertyValue(name);
            }
        });

        return values;
    }

    /**
     * Update a component's properties
     *
     * @method setPropertyValues
     * @param {player.Component} component The component to update
     * @param {Object} values A list of values with the property names as keys
     * @chainable
     */
    setPropertyValues(component, values){
		Object.entries(values).forEach(([name, value]) => {
            if(!this.getField(name).disabled){
                component.setPropertyValue(name, value);
            }
        });

        this.refreshFieldValues(Object.keys(values), true);

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

    toggleMultival(field, toggle){
        field.toggleClass('warning', toggle)
            .label.attr('title', toggle ? Locale.t('editor.panel.multivalWarning', 'The value corresponds to that of the first selected component') : null);
    }

}
