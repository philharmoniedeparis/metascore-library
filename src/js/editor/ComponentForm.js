import Dom from '../core/Dom';
import {isArray} from '../core/utils/Var';
import Locale from '../core/Locale';
import Field from './Field';
import CheckboxInput from '../core/ui/input/CheckboxInput';
import TextInput from '../core/ui/input/TextInput';
import SelectInput from '../core/ui/input/SelectInput';
import ColorInput from '../core/ui/input/ColorInput';
import NumberInput from '../core/ui/input/NumberInput';
import BorderRadiusInput from '../core/ui/input/BorderRadiusInput';
import TimeInput from '../core/ui/input/TimeInput';
import {getImageMetadata} from '../core/utils/Media';

import {className} from '../../css/editor/ComponentForm.scss';

/**
 * A component form class
 *
 * @emits {componentset} Fired when multuiple components are set
 * @param {Component} component The component instance
 * @emits {componentunset} Fired when a component is unset
 * @param {Component} component The component instance
 *
 * @todo: implement old editor.panel.Element methods
 */
export default class ComponentForm extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [allowMultiple=true] Whether multiple selection is allowed
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `config-form ${className}`});

        // fix event handlers scope
        this.onComponentPropChange = this.onComponentPropChange.bind(this);
        this.onComponentDragStart = this.onComponentDragStart.bind(this);
        this.onComponentDrag = this.onComponentDrag.bind(this);
        this.onComponentDragEnd = this.onComponentDragEnd.bind(this);
        this.onComponentResizeStart = this.onComponentResizeStart.bind(this);
        this.onComponentResize = this.onComponentResize.bind(this);
        this.onComponentResizeEnd = this.onComponentResizeEnd.bind(this);

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The list of selected components
         * @type {Array}
         */
        this.components = [];

        this.title = new Dom('<h2/>', {'class': 'title'})
            .appendTo(this);

        /**
         * The fields container
         * @type {Dom}
         */
        this.fields_wrapper = new Dom('<div/>', {'class': 'fields'})
            .addDelegate('.field', 'valuechange', this.onFieldValueChange.bind(this))
            .appendTo(this);

        this.setupFields();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'allowMultiple': true
        };
    }

    setupFields(){
        /**
         * The list of fields
         * @type {Object}
         */
        this.fields = {};

        this.fields.name = new Field(
            new TextInput(),
            {
                'label': Locale.t('editor.ComponentForm.fields.name.label', 'Name')
            })
            .data('name', 'name')
            .appendTo(this.fields_wrapper);

        this.fields.hidden = new Field(
            new CheckboxInput({
                'checked': false
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.hidden.label', 'Hidden on start')
            })
            .data('name', 'hidden')
            .appendTo(this.fields_wrapper);

        this.fields.scenario = new Field(
            new SelectInput(),
            {
                'label': Locale.t('editor.ComponentForm.fields.scenario.label', 'Scenario')
            })
            .data('name', 'scenario')
            .appendTo(this.fields_wrapper);

        this.fields.x = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true,
                'spinDirection': 'horizontal'
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.x.label', 'X')
            })
            .data('name', 'x')
            .appendTo(this.fields_wrapper);

        this.fields.y = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.y.label', 'Y')
            })
            .data('name', 'y')
            .appendTo(this.fields_wrapper);

        this.fields.width = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true,
                'spinDirection': 'horizontal'
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.width.label', 'Width')
            })
            .data('name', 'width')
            .appendTo(this.fields_wrapper);

        this.fields.height = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.height.label', 'Height')
            })
            .data('name', 'height')
            .appendTo(this.fields_wrapper);

        this.fields.form = new Field(
            new SelectInput({
                'options': {
                    'linear': Locale.t('player.component.element.Cursor.form.linear', 'Linear'),
                    'circular': Locale.t('player.component.element.Cursor.form.circular', 'Circular')
                }
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.form.label', 'Form')
            })
            .data('name', 'form')
            .appendTo(this.fields_wrapper);

        this.fields.direction = new Field(
            new SelectInput({
                'options': {
                    'right': Locale.t('player.component.element.Cursor.form.linear', 'Linear'),
                    'left': Locale.t('player.component.element.Cursor.direction.left', 'Right > Left'),
                    'bottom': Locale.t('player.component.element.Cursor.direction.bottom', 'Top > Bottom'),
                    'top': Locale.t('player.component.element.Cursor.direction.top', 'Bottom > Top'),
                    'cw': Locale.t('player.component.element.Cursor.direction.cw', 'Clockwise'),
                    'ccw': Locale.t('player.component.element.Cursor.direction.ccw', 'Counterclockwise')
                }
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.form.label', 'Form')
            })
            .data('name', 'direction')
            .appendTo(this.fields_wrapper);

        this.fields['background-image'] = new Field(
            new SelectInput(),
            {
                'label': Locale.t('editor.ComponentForm.fields.background-image.label', 'Background image')
            })
            .data('name', 'background-image')
            .appendTo(this.fields_wrapper);

        this.fields['background-color'] = new Field(
            new ColorInput(),
            {
                'label': Locale.t('editor.ComponentForm.fields.background-color.label', 'Background color')
            })
            .data('name', 'background-color')
            .appendTo(this.fields_wrapper);

        const border_fields_wrapper = new Dom('<div/>', {'class': 'border-fields'})
            .appendTo(this.fields_wrapper);

        const border_fields_label = new Dom('<label/>', {'text': Locale.t('editor.ComponentForm.fields.border-fields.label', 'Border')})
            .appendTo(border_fields_wrapper);

        this.fields['border-color'] = new Field(
            new ColorInput(),
            {
                'label': Locale.t('editor.ComponentForm.fields.border-color.label', 'Border color')
            })
            .data('name', 'border-color')
            .appendTo(border_fields_wrapper);

        border_fields_label.attr('for', this.fields['border-color'].getInput().getId());

        this.fields['border-width'] = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.border-width.label', 'Border width')
            })
            .data('name', 'border-width')
            .appendTo(border_fields_wrapper);

        this.fields['border-radius'] = new Field(
            new BorderRadiusInput(),
            {
                'label': Locale.t('editor.ComponentForm.fields.border-radius.label', 'Border radius')
            })
            .data('name', 'border-radius')
            .appendTo(this.fields_wrapper);

        this.fields['start-time'] = new Field(
            new TimeInput({
                'inButton': true,
                'outButton': true
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.start-time.label', 'Start')
            })
            .data('name', 'start-time')
            .appendTo(this.fields_wrapper);

        this.fields['end-time'] = new Field(
            new TimeInput({
                'inButton': true,
                'outButton': true
            }),
            {
                'label': Locale.t('editor.ComponentForm.fields.end-time.label', 'End')
            })
            .data('name', 'end-time')
            .appendTo(this.fields_wrapper);
    }

    /**
     * Update the panel's UI
     *
     * @private
     * @return {this}
     */
    updateUI(){
        const has_components = this.components.length > 0;

        if(has_components){
            this.updateTitle();
            this.refreshFieldValues(Object.keys(this.fields), true);
            this.updateFieldsVisibility();
        }

        this.toggleClass('has-component', has_components);

        return this;
    }

    updateTitle(){
        if(this.components.length === 0){
            this.title.text('');
        }
        if(this.components.length > 1){
            this.title.text(Locale.t('editor.ComponentForm.title.multiple', 'Attributes of @count components', {'@count': this.components.length}));
        }
        else{
            /** @type {Component} */
            const component = this.getComponent();
            if(component.instanceOf('Block') || component.instanceOf('BlockToggler') || component.instanceOf('Media') || component.instanceOf('Controller')){
                this.title.text(Locale.t('editor.ComponentForm.title.Block', 'Attributes of the block'));
            }
            else if(component.instanceOf('Page')){
                this.title.text(Locale.t('editor.ComponentForm.title.Page', 'Attributes of the page'));
            }
            else if(component.instanceOf('Element')){
                this.title.text(Locale.t('editor.ComponentForm.title.Element', 'Attributes of the element'));
            }
        }

        return this;
    }

    /**
     * Refresh fields' values to match the corresponding component(s) propoerties
     *
     * @param {Array} names A list of field names
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    refreshFieldValues(names, supressEvent){
        const _names = names || Object.keys(this.getField());

        _names.forEach((name) => {
            this.refreshFieldValue(name, supressEvent);
        });

        return this;
    }

    /**
     * Refresh a field's value to match the corresponding component(s) propoerty
     *
     * @param {String} name The field's name
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    refreshFieldValue(name, supressEvent){
        const value = this.getComponent().getPropertyValue(name);
        const field = this.getField(name);

        if(field){
            const multival = this.components.length > 1 && this.components.some((component) => {
                return component.getPropertyValue(name) !== value;
            });

            field.getInput().setValue(value, supressEvent);

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
                this.getField('end-time').getInput().setMin(value);
                break;

            case 'end-time':
                this.getField('start-time').getInput().setMax(value);
                break;
        }

        return this;
    }

    /**
     * Show fields that are not common to all components and hide those that are not.
     *
     * @private
     * @return {this}
     */
    updateFieldsVisibility(){
        Object.entries(this.getField()).forEach(([name, field]) => {
            const common = this.components.every((component) => {
                // Check that the component has the given property
                return component.hasProperty(name);
            });

            field[`${common ? 'show' : 'hide'}`]();
        });

        return this;
    }

    /**
     * Get a field by name
     *
     * @param {String} name The name of the field to get
     * @return {editor.Field} The field
     */
    getField(name){
        if(typeof name === "undefined"){
            return this.fields;
        }

        return this.fields[name];
    }

    /**
     * Get all set components
     *
     * @param {Mixed} [type] The type(s) of components to return
     * @return {Component[]} The components
     */
    getComponents(type) {
        if(type){
            const types = isArray(type) ? type : [type];
            return this.components.filter((component) => {
                return types.some((name) => {
                    return component.instanceOf(name);
                });
            });
        }

        return this.components;
    }

    /**
     * Get a set component by index
     *
     * @param {Number} [index=0] The component's index
     * @return {Component} The component at the specified index
     */
    getComponent(index) {
        return this.components[index || 0];
    }

    /**
     * Set a component
     *
     * @param {Component} component The component
     * @param {Boolean} [keepExisting=false] Whether to keep other set components
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
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

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0))
            .addClass('selected')
            .addListener('propchange', this.onComponentPropChange)
            .addListener('dragstart', this.onComponentDragStart)
            .addListener('drag', this.onComponentDrag)
            .addListener('dragend', this.onComponentDragEnd)
            .addListener('resizestart', this.onComponentResizeStart)
            .addListener('resize', this.onComponentResize)
            .addListener('resizeend', this.onComponentResizeEnd);

        if(!this.hasClass('locked')){
            component
                .setDraggable(true)
                .setResizable(true);
        }

        if(supressEvent !== true){
            this.triggerEvent('componentset', {'component': component, 'count': this.components.length}, false);
            component.triggerEvent('selected', {'component': component});
        }

        return this;
    }

    /**
     * Unset an associated component
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    unsetComponent(component, supressEvent){
        if(!this.components.includes(component)){
            return this;
        }

        this.components.splice(this.components.indexOf(component), 1);

        this.updateUI();

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0))
            .removeClass('selected')
            .removeListener('propchange', this.onComponentPropChange)
            .removeListener('dragstart', this.onComponentDragStart)
            .removeListener('drag', this.onComponentDrag)
            .removeListener('dragend', this.onComponentDragEnd)
            .removeListener('resizestart', this.onComponentResizeStart)
            .removeListener('resize', this.onComponentResize)
            .removeListener('resizeend', this.onComponentResizeEnd);

        component
            .setDraggable(false)
            .setResizable(false);

        if(supressEvent !== true){
            this.triggerEvent('componentunset', {'component': component, 'count': this.components.length}, false);
            component.triggerEvent('deselected', {'component': component});
        }

        return this;
    }

    /**
     * Unset all components
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    unsetComponents(supressEvent){
        for (let i = this.components.length - 1; i >= 0; i -= 1) {
            this.unsetComponent(this.components[i], supressEvent);
        }

        return this;
    }

    /**
     * The component's propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentPropChange(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

        const component = evt.detail.component;
        const property = evt.detail.property;
        const value = evt.detail.value;

        switch(property){
            case 'locked':
                component
                    .setDraggable(!value)
                    .setResizable(!value);
                break;
        }

        this.updateFieldsVisibility();

        // If this is the only component or the master one,
        // refresh the field value.
        if(component === this.getComponent()){
            this.refreshFieldValue(property, true);
        }

    }

    /**
     * The component's dragstart event handler
     *
     * @private
     */
    onComponentDragStart(){
        /**
        * Values of x and y when dragging starts
        * @type {Array}
        */
        this._before_drag_values = [];

        this.components.forEach((component) => {
            this._before_drag_values.push({
                'x': component.getPropertyValue('x'),
                'y': component.getPropertyValue('y')
            });
        });
    }

    /**
     * The component's drag event handler
     *
     * @private
     */
    onComponentDrag(evt){
        const components = this.getComponents();
        const state = evt.detail.behavior.getState();

        let offsetX = state.offsetX;
        let offsetY = state.offsetY;

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
     * @private
     */
    onComponentDragEnd(){
        const fields = ['x', 'y'];

        this.refreshFieldValues(fields, true);

        this.components.forEach((component, index) => {
            fields.forEach((field) => {
                const value = component.getPropertyValue(field);
                const old_value = this._before_drag_values[index][field];

                component.triggerEvent('propchange', {
                    'component': component,
                    'property': field,
                    'value': value,
                    'old': old_value
                });
            });
        });

        delete this._before_drag_values;
    }

    /**
     * The component's resizestart event handler
     *
     * @private
     */
    onComponentResizeStart(evt){
        const component = evt.target._metaScore;

        /**
        * Values of x, y, width and height when resizing starts
        * @type {Array}
        */
        this._before_resize_values = {
            'x': component.getPropertyValue('x'),
            'y': component.getPropertyValue('y'),
            'width': component.getPropertyValue('width'),
            'height': component.getPropertyValue('height'),
        };
    }

    /**
     * The component's resize event handler
     *
     * @private
     */
    onComponentResize(evt){
        const component = evt.target._metaScore;
        const state = evt.detail.behavior.getState();

        Object.entries(state.new_values).forEach(([key, value]) => {
            component.css(key, `${value}px`);
        });

        const fields = ['x', 'y', 'width', 'height'];
        this.refreshFieldValues(fields, true);
    }

    /**
     * The component's resizeend event handler
     *
     * @private
     */
    onComponentResizeEnd(evt){
        const component = evt.target._metaScore;
        const fields = ['x', 'y', 'width', 'height'];

        this.refreshFieldValues(fields, true);

        fields.forEach((field) => {
            const value = component.getPropertyValue(field);
            const old_value = this._before_resize_values[field];

            component.triggerEvent('propchange', {
                'component': component,
                'property': field,
                'value': value,
                'old': old_value
            });
        });

        delete this._before_resize_values;
    }

    /**
     * The fields' valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt){
        const name = evt.detail.field.data('name');
        const value = evt.detail.value;
        const values = [];

        this.components.forEach((component) => {
            const old_values = {
                [name]: component.getPropertyValue(name)
            };

            component.setPropertyValue(name, value);

            const new_values = {
                [name]: component.getPropertyValue(name)
            };

            values.push({
                component: component,
                new_values: new_values,
                old_values: old_values,
            });
        });

        this.toggleMultival(evt.detail.field, false);
    }

    /**
     * The imagefields' resize event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onImageFieldResize(evt){
        if(!evt.detail.value){
            return;
        }

        getImageMetadata(this.getComponent().get(0).baseURI + evt.detail.value, (error, metadata) => {
            if(error){
                return;
            }

            const values = [];
            this.components.forEach((component) => {
                const old_values = {
                    'width': component.getPropertyValue('width'),
                    'height': component.getPropertyValue('height')
                };

                component.setPropertyValues({'width': metadata.width, 'height': metadata.height});

                const new_values = {
                    'width': component.getPropertyValue('width'),
                    'height': component.getPropertyValue('height')
                };

                values.push({
                    component: component,
                    new_values: new_values,
                    old_values: old_values
                });
            });
        });
    }

    /**
     * Update a component's properties
     *
     * @param {player.Component} component The component to update
     * @param {Object} values A list of values with the property names as keys
     * @return {this}
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
     * @param {Array} names The list of field names to toggle
     * @param {Boolean} toggle Whether the fields are to be enabled or disabled
     * @return {this}
     */
    toggleFields(names, toggle){
        names.forEach((name) => {
            const field = this.getField(name);

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
     * Toggle the multivalue warning on a field
     *
     * @param {Field} field The field to toggle the warning for
     * @param {Boolean} toggle Whether the warning is to be shown or hidden
     * @return {this}
     */
    toggleMultival(field, toggle){
        field.toggleClass('warning', toggle);
        field.getLabel().attr('title', toggle ? Locale.t('editor.ComponentForm.multivalWarning', 'The value corresponds to that of the first selected component') : null);

        return this;
    }

}
