import Dom from '../../core/Dom';
import {clone} from '../../core/utils/Array';
import Locale from '../../core/Locale';
import Field from '../Field';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import TextInput from '../../core/ui/input/TextInput';
import SelectInput from '../../core/ui/input/SelectInput';
import ColorInput from '../../core/ui/input/ColorInput';
import NumberInput from '../../core/ui/input/NumberInput';
import BorderRadiusInput from '../../core/ui/input/BorderRadiusInput';
import TimeInput from '../../core/ui/input/TimeInput';

import {className} from '../../../css/editor/configseditor/ComponentForm.scss';

/**
 * A component form class
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
        super('<div/>', {'class': `component-form ${className}`});

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
            'title': Locale.t('editor.configseditor.ComponentForm.title.single', 'Attributes of component'),
            'title_plural': Locale.t('editor.configseditor.ComponentForm.title.plural', 'Attributes of @count components'),
            'fields': []
        };
    }

    setComponents(components){
        /**
         * The components
         * @type {Array}
         */
        this.components = clone(components);

        this.master_component = this.components[0];

        this.components.forEach((component) => {
            // Create a new Dom instance to workaround the different JS contexts of the player and editor.
            new Dom(component.get(0))
                .addListener('propchange', this.onComponentPropChange)
                .addListener('dragstart', this.onComponentDragStart)
                .addListener('drag', this.onComponentDrag)
                .addListener('dragend', this.onComponentDragEnd)
                .addListener('resizestart', this.onComponentResizeStart)
                .addListener('resize', this.onComponentResize)
                .addListener('resizeend', this.onComponentResizeEnd);
        });

        if(this.components.length > 1){
            this.title.text(Locale.formatString(this.configs.title_plural, {'@count': this.components.length}));
        }
        else{
            this.title.text(this.configs.title);
        }

        this.updateFieldValues(true);

        return this;
    }

    unsetComponents(){
        if(this.components){
            this.components.forEach((component) => {
                // Create a new Dom instance to workaround the different JS contexts of the player and editor.
                new Dom(component.get(0))
                    .removeListener('propchange', this.onComponentPropChange)
                    .removeListener('dragstart', this.onComponentDragStart)
                    .removeListener('drag', this.onComponentDrag)
                    .removeListener('dragend', this.onComponentDragEnd)
                    .removeListener('resizestart', this.onComponentResizeStart)
                    .removeListener('resize', this.onComponentResize)
                    .removeListener('resizeend', this.onComponentResizeEnd);
            });
        }

        delete this.components;
        delete this.master_component;

        return this;
    }

    getMasterComponent(){
        return this.master_component;
    }

    getComponents(){
        return this.components;
    }

    /**
     * The fields' valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt){
        const name = evt.detail.field.data('property');
        const value = evt.detail.value;

        this.components.forEach((component) => {
            component.setPropertyValue(name, value);
        });

        this.toggleMultival(evt.detail.field, false);
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

        this.onComponentOwnPropChange(evt);
    }

    onComponentOwnPropChange(evt){
        const component = evt.detail.component;
        const property = evt.detail.property;
        const value = evt.detail.value;

        switch(property){
            case 'editor.locked':
                component
                    .setDraggable(!value)
                    .setResizable(!value);
                break;
        }

        // If this is the only component or the master one,
        // refresh the field value.
        if(component === this.master_component){
            this.updateFieldValue(property, true);
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
        const state = evt.detail.behavior.getState();

        let offsetX = state.offsetX;
        let offsetY = state.offsetY;

        this.components.forEach((component) => {
            const left = parseInt(component.css('left'), 10);
            const top = parseInt(component.css('top'), 10);

            if(left + offsetX < 0){
                offsetX = left * -1;
            }

            if(top + offsetY < 0){
                offsetY = top * -1;
            }
        });

        this.components.forEach((component) => {
            const x = parseInt(component.css('left'), 10) + offsetX;
            const y = parseInt(component.css('top'), 10) + offsetY;

            component.setPropertyValues({'x': x, 'y': y}, true);
        });

        const fields = ['x', 'y'];
        fields.forEach((field) => {
            this.updateFieldValue(field, true);
        });
    }

    /**
     * The component's dragend event handler
     *
     * @private
     */
    onComponentDragEnd(){
        const fields = ['x', 'y'];

        fields.forEach((field) => {
            this.updateFieldValue(field, true);
        });

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
            switch(key){
                case 'left':
                    component.setPropertyValue('x', value, true);
                    break;

                case 'top':
                    component.setPropertyValue('y', value, true);
                    break;

                case 'width':
                case 'height':
                    component.setPropertyValue(key, value, true);
                    break;
            }
        });

        const fields = ['x', 'y', 'width', 'height'];
        fields.forEach((field) => {
            this.updateFieldValue(field, true);
        });
    }

    /**
     * The component's resizeend event handler
     *
     * @private
     */
    onComponentResizeEnd(evt){
        const component = evt.target._metaScore;
        const fields = ['x', 'y', 'width', 'height'];

        fields.forEach((field) => {
            this.updateFieldValue(field, true);
        });

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

    setupFields(){
        /**
         * The list of fields
         * @type {Object}
         */
        this.fields = {};

        this.configs.fields.forEach((name) => {
            this.addField(name);
        });

        return this;
    }

    addField(name){
        switch(name){
            case 'name':
                this.fields[name] = new Field(
                    new TextInput(),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.name.label', 'Name')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'hidden':
                this.fields[name] = new Field(
                    new CheckboxInput({
                        'checked': false
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.hidden.label', 'Hidden on start')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'background':
                this.fields['background-image'] = new Field(
                    new SelectInput(),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.background-image.label', 'Background image')
                    })
                    .data('property', 'background-image')
                    .appendTo(this.fields_wrapper);

                this.fields['background-color'] = new Field(
                    new ColorInput(),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.background-color.label', 'Background color')
                    })
                    .data('property', 'background-color')
                    .appendTo(this.fields_wrapper);
                break;

            case 'border': {
                    const border_fields_wrapper = new Dom('<div/>', {'class': 'field-group border'})
                        .appendTo(this.fields_wrapper);

                    const border_fields_label = new Dom('<label/>', {'text': Locale.t('editor.configseditor.ComponentForm.fields.border-fields.label', 'Border')})
                        .appendTo(border_fields_wrapper);

                    this.fields['border-color'] = new Field(
                        new ColorInput(),
                        {
                            'label': Locale.t('editor.configseditor.ComponentForm.fields.border-color.label', 'Border color')
                        })
                        .data('property', 'border-color')
                        .appendTo(border_fields_wrapper);

                    border_fields_label.attr('for', this.fields['border-color'].getInput().getId());

                    this.fields['border-width'] = new Field(
                        new NumberInput({
                            'min': 0,
                            'spinButtons': true
                        }),
                        {
                            'label': Locale.t('editor.configseditor.ComponentForm.fields.border-width.label', 'Border width')
                        })
                        .data('property', 'border-width')
                        .appendTo(border_fields_wrapper);

                    this.fields['border-radius'] = new Field(
                        new BorderRadiusInput({
                            'overlay': {
                                'parent': '.metaScore-editor'
                            }
                        }),
                        {
                            'label': Locale.t('editor.configseditor.ComponentForm.fields.border-radius.label', 'Border radius')
                        })
                        .data('property', 'border-radius')
                        .appendTo(this.fields_wrapper);
                }
                break;

            case 'opacity':
                this.fields.opacity = new Field(
                    new NumberInput({
                        'min': 0,
                        'max': 1,
                        'step': 0.1,
                        'spinButtons': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.opacity.label', 'Opacity')
                    })
                    .data('property', 'opacity')
                    .appendTo(this.fields_wrapper);
                break;

            case 'time':
                this.fields['start-time'] = new Field(
                    new TimeInput({
                        'inButton': true,
                        'outButton': true,
                        'clearButton': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.start-time.label', 'Start')
                    })
                    .data('property', 'start-time')
                    .appendTo(this.fields_wrapper);

                this.fields['end-time'] = new Field(
                    new TimeInput({
                        'inButton': true,
                        'outButton': true,
                        'clearButton': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.end-time.label', 'End')
                    })
                    .data('property', 'end-time')
                    .appendTo(this.fields_wrapper);
                break;

            case 'position':
                this.fields.x = new Field(
                    new NumberInput({
                        'min': 0,
                        'spinButtons': true,
                        'spinDirection': 'horizontal'
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.x.label', 'X')
                    })
                    .data('property', 'x')
                    .appendTo(this.fields_wrapper);

                // Y
                this.fields.y = new Field(
                    new NumberInput({
                        'min': 0,
                        'spinButtons': true,
                        'flipSpinButtons': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.y.label', 'Y')
                    })
                    .data('property', 'y')
                    .appendTo(this.fields_wrapper);
                break;

            case 'dimension':
                this.fields.width = new Field(
                    new NumberInput({
                        'min': 0,
                        'spinButtons': true,
                        'spinDirection': 'horizontal'
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.width.label', 'Width')
                    })
                    .data('property', 'width')
                    .appendTo(this.fields_wrapper);

                this.fields.height = new Field(
                    new NumberInput({
                        'min': 0,
                        'spinButtons': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.ComponentForm.fields.height.label', 'Height')
                    })
                    .data('property', 'height')
                    .appendTo(this.fields_wrapper);
                break;
        }

        return this;
    }

    /**
     * Refresh all fields' values to match the corresponding component(s) propoerties
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    updateFieldValues(supressEvent){
        if(this.components){
            if(this.hasField('start-time') && this.hasField('end-time')){
                const start_values = [];
                const end_values = [];

                this.components.forEach((component) => {
                    const start_value = component.getPropertyValue('start-time');
                    if(start_value !== null){
                        start_values.push(start_value);
                    }

                    const end_value = component.getPropertyValue('end-time');
                    if(end_value !== null){
                        end_values.push(end_value);
                    }
                });

                this.getField('end-time').getInput().setMin(start_values.length > 0 ? Math.max(...start_values) : null);
                this.getField('start-time').getInput().setMax(end_values.length > 0 ? Math.min(...end_values) : null);
            }

            Object.keys(this.getFields()).forEach((name) => {
                this.updateFieldValue(name, supressEvent);
            });
        }

        return this;
    }

    /**
     * Refresh a field's value to match the corresponding component(s) propoerty
     *
     * @param {String} name The field's name
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    updateFieldValue(name, supressEvent){
        if(this.components){
            const value = this.master_component.getPropertyValue(name);
            const field = this.getField(name);

            if(field && field instanceof Field){
                const multival = this.components.length > 1 && this.components.some((component) => {
                    return component.getPropertyValue(name) !== value;
                });

                field.getInput().setValue(value, supressEvent);

                this.toggleMultival(field, multival);
            }

            switch(name){
                case 'editor.locked':
                    this
                        .toggleClass('locked', value)
                        .toggleFields(['x', 'y'], !value)
                        .toggleFields(['width', 'height'], !value);
                    break;
            }
        }

        return this;
    }

    /**
     * Check if a field exists
     *
     * @param {String} name The name of the field
     * @return {Boolean} Whether the field exists or not
     */
    hasField(name){
        return name in this.fields;
    }

    /**
     * Get a field by name
     *
     * @param {String} name The name of the field
     * @return {Field} The field
     */
    getField(name){
        return this.fields[name];
    }

    /**
     * Get all fields
     *
     * @return {Object} The fields
     */
    getFields(){
        return this.fields;
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
                    field.getInput().enable();
                }
                else{
                    field.getInput().disable();
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

    updateImageFields(images){
        if(this.hasField('background-image')){
            const input = this.getField('background-image').getInput();

            input.clear();

            Object.entries(images).forEach(([key, value]) => {
                input.addOption(key, value);
            });

            this.updateFieldValue('background-image', true);
        }

        return this;
    }

    remove(){
        this.unsetComponents();
        super.remove();
    }

}
