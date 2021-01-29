import Dom from '../../core/Dom';
import { clone } from '../../core/utils/Array';
import { isFunction } from '../../core/utils/Var';
import Locale from '../../core/Locale';
import Field from '../Field';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import TextInput from '../../core/ui/input/TextInput';
import SelectInput from '../../core/ui/input/SelectInput';
import ColorInput from '../../core/ui/input/ColorInput';
import NumberInput from '../../core/ui/input/NumberInput';
import BorderRadiusInput from '../../core/ui/input/BorderRadiusInput';
import TimeInput from '../../core/ui/input/TimeInput';
import CombinedInputs from '../../core/ui/input/CombinedInputs';
import { MasterClock } from '../../core/media/MediaClock';

import { className } from '../../../css/editor/configseditor/ComponentForm.scss';

/**
 * A component form class
 */
export default class ComponentForm extends Dom {

    static defaults = {
        'title': Locale.t('editor.configseditor.ComponentForm.title.single', 'Attributes of component'),
        'title_plural': Locale.t('editor.configseditor.ComponentForm.title.plural', 'Attributes of @count components')
    };

    static field_definitions = {
        'name': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.name.label', 'Name'),
            'input': {
                'type': TextInput
            }
        },
        'hidden': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.hidden.label', 'Hidden on start'),
            'input': {
                'type': CheckboxInput,
                'configs': { 'checked': false }
            }
        },
        'background-color': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.background-color.label', 'Background color'),
            'input': {
                'type': ColorInput,
                'configs': { 'format': 'css' }
            }
        },
        'background-image': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.background-image.label', 'Background image'),
            'input': {
                'type': SelectInput
            }
        },
        'border': {
            'group': true,
            'label': Locale.t('editor.configseditor.ComponentForm.fields.border-fields.label', 'Border'),
            'items': {
                'border-color': {
                    'input': {
                        'type': ColorInput,
                        'configs': { 'format': 'css' }
                    },
                    'attributes': {
                        'title': Locale.t('editor.configseditor.ComponentForm.fields.border-color.title', 'Color')
                    }
                },
                'border-width': {
                    'input': {
                        'type': NumberInput,
                        'configs': { 'min': 0, 'spinButtons': true }
                    },
                    'attributes': {
                        'title': Locale.t('editor.configseditor.ComponentForm.fields.border-width.title', 'Width')
                    }
                },
                'border-radius': {
                    'label': Locale.t('editor.configseditor.ComponentForm.fields.border-radius.label', 'Radius'),
                    'input': {
                        'type': BorderRadiusInput,
                        'configs': { 'overlay': { 'parent': this.editor } }
                    }
                }
            }
        },
        'time': {
            'group': true,
            'items': {
                'start-time': {
                    'label': Locale.t('editor.configseditor.ComponentForm.fields.start-time.label', 'Start'),
                    'input': {
                        'type': TimeInput,
                        'configs': {
                            'inButton': true,
                            'outButton': true,
                            'clearButton': true
                        }
                    }
                },
                'end-time': {
                    'label': Locale.t('editor.configseditor.ComponentForm.fields.end-time.label', 'End'),
                    'input': {
                        'type': TimeInput,
                        'configs': {
                            'inButton': true,
                            'outButton': true,
                            'clearButton': true
                        }
                    }
                }
            }
        },
        'position': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.position.label', 'Position'),
            'input': {
                'type': CombinedInputs,
                'configs': {
                    'inputs': [
                        {
                            'type': NumberInput,
                            'configs': {
                                'min': 0,
                                'spinButtons': true,
                                'spinDirection': 'horizontal',
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.position.0.title', 'X'),
                                }
                            }
                        },
                        {
                            'type': NumberInput,
                            'configs': {
                                'min': 0,
                                'spinButtons': true,
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.position.1.title', 'Y'),
                                }
                            }
                        }
                    ]
                }
            }
        },
        'dimension': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.dimension.label', 'Dimension'),
            'input': {
                'type': CombinedInputs,
                'configs': {
                    'inputs': [
                        {
                            'type': NumberInput,
                            'configs': {
                                'min': 0,
                                'spinButtons': true,
                                'spinDirection': 'horizontal',
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.dimension.0.title', 'Width'),
                                }
                            }
                        },
                        {
                            'type': NumberInput,
                            'configs': {
                                'min': 0,
                                'spinButtons': true,
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.dimension.1.title', 'Height'),
                                }
                            }
                        }
                    ]
                }
            }
        },
        'opacity': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.opacity.label', 'Opacity'),
            'input': {
                'type': NumberInput,
                'configs': {
                    'min': 0,
                    'max': 1,
                    'step': 0.01,
                    'spinButtons': true
                }
            },
            'animatable': true
        },
        'scale': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.scale.label', 'Scale'),
            'input': {
                'type': CombinedInputs,
                'configs': {
                    'inputs': [
                        {
                            'type': NumberInput,
                            'configs': {
                                'min': 0,
                                'step': 0.01,
                                'spinButtons': true,
                                'spinDirection': 'horizontal',
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.scale.0.title', 'X'),
                                }
                            }
                        },
                        {
                            'type': NumberInput,
                            'configs': {
                                'min': 0,
                                'step': 0.01,
                                'spinButtons': true,
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.scale.1.title', 'Y'),
                                }
                            }
                        }
                    ]
                }
            },
            'animatable': true
        },
        'translate': {
            'label': Locale.t('editor.configseditor.ComponentForm.fields.translate.label', 'Translation'),
            'input': {
                'type': CombinedInputs,
                'configs': {
                    'inputs': [
                        {
                            'type': NumberInput,
                            'configs': {
                                'spinButtons': true,
                                'spinDirection': 'horizontal',
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.translate.0.title', 'X'),
                                }
                            }
                        },
                        {
                            'type': NumberInput,
                            'configs': {
                                'spinButtons': true,
                                'attributes': {
                                    'title': Locale.t('editor.configseditor.ComponentForm.fields.translate.1.title', 'Y'),
                                }
                            }
                        }
                    ]
                }
            },
            'animatable': true
        }
    };

    /**
     * Instantiate
     *
     * @param {Editor} editor The Editor instance
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [allowMultiple=true] Whether multiple selection is allowed
     */
    constructor(editor, configs) {
        // call parent constructor
        super('<div/>', { 'class': `component-form ${className}` });

        /**
         * A reference to the Editor instance
         * @type {Editor}
         */
        this.editor = editor;

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
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        this.title = new Dom('<h2/>', { 'class': 'title' })
            .appendTo(this);

        /**
         * The fields container
         * @type {Dom}
         */
        this.fields_wrapper = new Dom('<div/>', { 'class': 'fields' })
            .appendTo(this);

        /**
         * The animatable fields container
         * @type {Dom}
         */
        this.animatable_fields_wrapper = new Dom('<div/>', { 'class': 'fields animatable' })
            .appendTo(this);

        this
            .addDelegate('.field', 'valuechange', this.onFieldValueChange.bind(this))
            .addDelegate('.input.animated', 'valuechange', this.onAnimatedValueChange.bind(this));

        /**
         * The list of fields
         * @type {Object}
         */
        this.fields = {};

        // Setup the fields.
        Object.entries(this.constructor.field_definitions).forEach(([id, configs]) => {
            if ('group' in configs && configs.group === true) {
                const group = this.addFieldGroup(id, configs);
                Object.entries(configs.items).forEach(([field_id, field_configs]) => {
                    this.addField(field_id, field_configs, group);
                });
            }
            else {
                this.addField(id, configs);
            }
        });
    }

    /**
     * Attach components to the form.
     *
     * @param {Component[]} components The list of components.
     * @return {this}
     */
    setComponents(components) {
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

            this.updateComponentLockedState(component);
        });


        if (this.components.length > 1) {
            this.title.text(Locale.formatString(this.configs.title_plural, { '@count': this.components.length }));
        }
        else {
            this.title.text(this.configs.title);
        }

        this.updateFieldValues(true);

        return this;
    }

    /**
     * Detach all components from the form.
     *
     * @return {this}
     */
    unsetComponents() {
        if (this.components) {
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

    /**
     * Get the master component.
     *
     * @return {Component} The component.
     */
    getMasterComponent() {
        return this.master_component;
    }

    /**
     * Get the list of attached components.
     *
     * @return {Component[]} The components.
     */
    getComponents() {
        return this.components;
    }

    /**
     * The component's propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentPropChange(evt) {
        const component = evt.detail.component;
        const property = evt.detail.property;

        switch (property) {
            case 'editor.locked':
                this.updateComponentLockedState(component);
                break;

            case 'start-time':
            case 'end-time':
                this.updateTimeFieldLimits();
                break;
        }

        // If this is the only component or the master one,
        // refresh the field value.
        if (component === this.master_component) {
            this.updateFieldValue(property, true);
        }
    }

    /**
     * The component's dragstart event handler
     *
     * @private
     */
    onComponentDragStart() {
        /**
        * Values of x and y when dragging starts
        * @type {Array}
        */
        this._before_drag_values = {};

        this.components.forEach((component) => {
            this._before_drag_values[component.getId()] = clone(component.getPropertyValue('position'));
        });
    }

    /**
     * The component's drag event handler
     *
     * @private
     */
    onComponentDrag(evt) {
        const state = evt.detail.behavior.getState();

        let offsetX = state.offsetX;
        let offsetY = state.offsetY;

        this.components.forEach((component) => {
            const left = parseInt(component.css('left'), 10);
            const top = parseInt(component.css('top'), 10);

            if (left + offsetX < 0) {
                offsetX = left * -1;
            }

            if (top + offsetY < 0) {
                offsetY = top * -1;
            }
        });

        this.components.forEach((component) => {
            const x = parseInt(component.css('left'), 10) + offsetX;
            const y = parseInt(component.css('top'), 10) + offsetY;

            component.setPropertyValue('position', [x, y], true);
        });

        this.updateFieldValue('position', true);
    }

    /**
     * The component's dragend event handler
     *
     * @private
     */
    onComponentDragEnd() {
        const components = clone(this.components);
        const previous_values = this._before_drag_values;
        const new_values = {};

        components.forEach((component) => {
            const id = component.getId();

            new_values[id] = {};

            Object.entries(previous_values[id]).forEach(([field, previous_value]) => {
                const value = component.getPropertyValue(field);

                new_values[id][field] = value;

                component.triggerEvent('propchange', {
                    'component': component,
                    'property': field,
                    'value': value,
                    'previous': previous_value
                });
            });
        });

        this.editor.getHistory().add({
            'undo': () => {
                components.forEach((component) => {
                    const id = component.getId();
                    Object.entries(previous_values[id]).forEach(([field, value]) => {
                        component.setPropertyValue(field, value);
                    });
                });
            },
            'redo': () => {
                components.forEach((component) => {
                    const id = component.getId();
                    Object.entries(new_values[id]).forEach(([field, value]) => {
                        component.setPropertyValue(field, value);
                    });
                });
            }
        });

        this.editor.setDirty('components');

        delete this._before_drag_values;
    }

    /**
     * The component's resizestart event handler
     *
     * @private
     */
    onComponentResizeStart(evt) {
        const component = evt.target._metaScore;

        /**
        * Values of position and dimension when resizing starts
        * @type {Object}
        */
        this._before_resize_values = {
            'position': clone(component.getPropertyValue('position')),
            'dimension': clone(component.getPropertyValue('dimension'))
        };
    }

    /**
     * The component's resize event handler
     *
     * @private
     */
    onComponentResize(evt) {
        const component = evt.target._metaScore;
        const state = evt.detail.behavior.getState();

        Object.entries(state.new_values).forEach(([key, value]) => {
            switch (key) {
                case 'left':
                case 'top':
                    {
                        const position = clone(component.getPropertyValue('position'));
                        const index = key === 'top' ? 1 : 0;
                        position[index] = value;
                        component.setPropertyValue('position', position, true);
                        this.updateFieldValue('position', true);
                    }
                    break;

                case 'width':
                case 'height':
                    {
                        const dimension = clone(component.getPropertyValue('dimension'));
                        const index = key === 'height' ? 1 : 0;
                        dimension[index] = value;
                        component.setPropertyValue('dimension', dimension, true);
                        this.updateFieldValue('dimension', true);
                    }
                    break;
            }
        });
    }

    /**
     * The component's resizeend event handler
     *
     * @private
     */
    onComponentResizeEnd(evt) {
        const component = evt.target._metaScore;
        const previous_values = this._before_resize_values;
        const new_values = {};

        Object.entries(previous_values).forEach(([field, previous_value]) => {
            const value = component.getPropertyValue(field);

            new_values[field] = value;

            component.triggerEvent('propchange', {
                'component': component,
                'property': field,
                'value': value,
                'previous': previous_value
            });
        });

        this.editor.getHistory().add({
            'undo': () => {
                Object.entries(previous_values).forEach(([field, value]) => {
                    component.setPropertyValue(field, value);
                });
            },
            'redo': () => {
                Object.entries(new_values).forEach(([field, value]) => {
                    component.setPropertyValue(field, value);
                });
            }
        });

        this.editor.setDirty('components');

        delete this._before_resize_values;
    }

    /**
     * Add a field.
     *
     * @protected
     * @param {String} id The field's id.
     * @param {Object} configs The field's configs.
     * @property {String} [label] The field's label.
     * @property {Input} [input] The field's input.
     * @property {Object} [attributes] A list of attributes to set on the field.
     * @param {Dom} [group] An optional field group.
     * @return {Field} The field.
     */
    addField(id, configs, group = null) {
        const input = new configs.input.type(configs.input.configs);

        const field = new Field(input, { 'label': configs.label })
            .data('property', id)
            .appendTo(group ?? (configs.animatable ? this.animatable_fields_wrapper : this.fields_wrapper));

        if (configs.animatable) {
            new CheckboxInput({
                    'checked': false,
                    'name': 'animated'
                })
                .attr('title', Locale.t('editor.configseditor.ComponentForm.fields.animated.title', 'Animated'))
                .data('property', id)
                .addClass('animated')
                .insertAt(field, 1);
        }

        if ('attributes' in configs) {
            Object.entries(configs.attributes).forEach(([key, value]) => {
                field.attr(key, value);
            });
        }

        this.fields[id] = field;

        return field;
    }

    /**
     * Add a field group.
     *
     * @protected
     * @param {String} id The field group's id.
     * @param {Object} [configs] The field group's configs.
     * @property {String} [label] The field group's label.
     * @property {Object} [attributes] A list of attributes to set on the group.
     * @return {Dom} The group's Dom instance.
     */
    addFieldGroup(id, configs = {}) {
        const wrapper = new Dom('<div/>', { 'class': `field-group ${id}` })
            .appendTo(configs.animatable ? this.animatable_fields_wrapper : this.fields_wrapper);

        if ('label' in configs) {
            new Dom('<label/>', { 'text': configs.label })
                .appendTo(wrapper);
        }

        if ('attributes' in configs) {
            Object.entries(configs.attributes).forEach(([key, value]) => {
                wrapper.attr(key, value);
            });
        }

        return wrapper;
    }

    /**
     * The fields' valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt) {
        const name = evt.detail.field.data('property');
        const value = evt.detail.value;
        const components = clone(this.components);
        const previous_values = {};

        components.forEach((component) => {
            previous_values[component.getId()] = component.getPropertyValue(name);
            component.setPropertyValue(name, value);
        });

        this.editor.getHistory().add({
            'undo': () => {
                components.forEach((component) => {
                    component.setPropertyValue(name, previous_values[component.getId()]);
                });
            },
            'redo': () => {
                components.forEach((component) => {
                    component.setPropertyValue(name, value);
                });
            }
        });

        this.toggleMultival(evt.detail.field, false);
    }

    /**
     * Animated checkbox valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onAnimatedValueChange(evt) {
        const name = evt.detail.input.data('property');
        const value = evt.detail.value;
        const components = clone(this.components);
        const previous_values = {};
        const new_values = {};

        components.forEach((component) => {
            const id = component.getId();
            const prop_value = component.getPropertyValue(name);
            const animated_value = component.getPropertyValue('animated') ?? [];

            const previous_value = {
                [name]: prop_value,
                'animated': animated_value
            }

            const new_value = {};
            if (value === true) {
                new_value[name] = [MasterClock.getTime(), prop_value];
                new_value.animated = animated_value.concat(name);
            }
            else {
                new_value[name] = prop_value.pop()[1];
                new_value.animated = animated_value.filter(item => item !== name);
            }

            previous_values[id] = previous_value;
            new_values[id] = new_value;

            component.setPropertyValues(new_value);
        });

        this.editor.getHistory().add({
            'undo': () => {
                components.forEach((component) => {
                    component.setPropertyValues(previous_values[component.getId()]);
                });
            },
            'redo': () => {
                components.forEach((component) => {
                    component.setPropertyValues(new_values[component.getId()]);
                });
            }
        });
    }

    /**
     * Refresh all fields' values to match the corresponding component(s) propoerties
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    updateFieldValues(supressEvent) {
        if (this.components) {
            this.updateTimeFieldLimits();

            // Update all field values.
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
    updateFieldValue(name, supressEvent) {
        if (this.components) {
            const master_component = this.getMasterComponent();
            const value = master_component.getPropertyValue(name);
            const field = this.getField(name);

            if (field && field instanceof Field) {
                const input = field.getInput();
                const multival = this.components.length > 1 && this.components.some((component) => {
                    return component.getPropertyValue(name) !== value;
                });

                input.setValue(value, supressEvent);

                if (input instanceof ColorInput) {
                    this.updateColorInputEmptyValue(input, name);
                }

                this.toggleMultival(field, multival);
            }

            this.updateFieldsVisibility();
        }

        return this;
    }

    /**
     * Check if a field exists
     *
     * @param {String} name The name of the field
     * @return {Boolean} Whether the field exists or not
     */
    hasField(name) {
        return name in this.fields;
    }

    /**
     * Get a field by name
     *
     * @param {String} name The name of the field
     * @return {Field} The field
     */
    getField(name) {
        return this.fields[name];
    }

    /**
     * Get all fields
     *
     * @return {Object} The fields
     */
    getFields() {
        return this.fields;
    }

    /**
     * Update fields visibility according to whether they apply or not
     *
     * @return {this}
     */
    updateFieldsVisibility() {
        if (this.components) {
            const master_component = this.getMasterComponent();

            Object.entries(master_component.getProperties()).forEach(([name, prop]) => {
                const prop_field = this.getField(name);
                if (prop_field) {
                    const toggle = !('applies' in prop) || !isFunction(prop.applies) || prop.applies.call(master_component);
                    prop_field[toggle ? 'show' : 'hide']();
                }
            });
        }

        return this;
    }

    /**
     * Toggle the enabled state of a field
     *
     * @param {String} name The field name to toggle
     * @param {Boolean} toggle Whether the field should be enabled or disabled
     * @return {this}
     */
    toggleField(name, toggle) {
        const field = this.getField(name);

        if (field) {
            if (toggle) {
                field.getInput().enable();
            }
            else {
                field.getInput().disable();
            }
        }

        return this;
    }

    /**
     * Toggle the multivalue warning on a field
     *
     * @param {Field} field The field to toggle the warning for
     * @param {Boolean} toggle Whether the warning is to be shown or hidden
     * @return {this}
     */
    toggleMultival(field, toggle) {
        field.toggleClass('warning', toggle);
        field.getLabel().attr('title', toggle ? Locale.t('editor.ComponentForm.multivalWarning', 'The value corresponds to that of the first selected component') : null);

        return this;
    }

    /**
     * Update image field options.
     *
     * @param {Object} images The list of available images.
     * @return {this}
     */
    updateImageFields(images) {
        if (this.hasField('background-image')) {
            const input = this.getField('background-image').getInput();

            input.clear();

            Object.entries(images).forEach(([key, value]) => {
                input.addOption(key, value);
            });

            this.updateFieldValue('background-image', true);
        }

        return this;
    }

    /**
     * Update start- and end-time min and max limits.
     *
     * @return {this}
     */
    updateTimeFieldLimits() {
        if (this.components && this.hasField('start-time') && this.hasField('end-time')) {
            const start_values = [];
            const end_values = [];

            this.components.forEach((component) => {
                const start_value = component.getPropertyValue('start-time');
                if (start_value !== null) {
                    start_values.push(start_value);
                }

                const end_value = component.getPropertyValue('end-time');
                if (end_value !== null) {
                    end_values.push(end_value);
                }
            });

            this.getField('start-time').getInput()
                .setMin(0)
                .setMax(end_values.length > 0 ? Math.min(...end_values) : null);

            this.getField('end-time').getInput()
                .setMin(start_values.length > 0 ? Math.max(...start_values) : null)
                .setMax(MasterClock.getRenderer().getDuration());
        }

        return this;
    }

    /**
     * Update a color input's empty value
     * depending on the default value of the component's corresponding propoerty.
     *
     * @param {ColorInput} input The color input
     * @param {String} name The propoerty's name
     * @return {this}
     */
    updateColorInputEmptyValue(input, name) {
        const master_component = this.getMasterComponent();
        const property = master_component.getProperty(name);

        if (typeof property !== 'undefined') {
            let empty_value = null;

            if ('default' in property) {
                empty_value = property.default;
            }
            else {
                // Get current value.
                const value = master_component.getPropertyValue(name);

                // Get default value.
                master_component.setPropertyValue(name, null, true);
                empty_value = master_component.css(name);

                // Revert to current value.
                master_component.setPropertyValue(name, value, true);
            }

            // Update input's empty value.
            input.setEmptyValue(empty_value);
        }

        return this;
    }

    /**
     * Update a component's locked state
     * depending on the value of its 'editor.locked' property.
     *
     * @param {Component} component
     * @return {this}
     */
    updateComponentLockedState(component) {
        const locked = component.getPropertyValue('editor.locked');

        this
            .toggleClass('locked', locked)
            .toggleField('position', !locked)
            .toggleField('dimension', !locked);

        component
            .setDraggable(!locked)
            .setResizable(!locked);

        return this;
    }

    /**
     * @inheritdoc
     */
    remove() {
        this.unsetComponents();
        super.remove();
    }

}
