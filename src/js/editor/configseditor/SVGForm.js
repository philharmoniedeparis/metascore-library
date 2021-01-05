import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import Dom from '../../core/Dom';
import { isString } from '../../core/utils/Var';
import SelectInput from '../../core/ui/input/SelectInput';
import NumberInput from '../../core/ui/input/NumberInput';
import ColorInput from '../../core/ui/input/ColorInput';
import HiddenInput from '../../core/ui/input/HiddenInput';

import { className } from '../../../css/editor/configseditor/SVGForm.scss';

/**
 * An svg component form class
 */
export default class SVGForm extends ElementForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.SVGForm.title.single', 'Attributes of vector graphic'),
        'title_plural': Locale.t('editor.configseditor.SVGForm.title.plural', 'Attributes of @count vector graphics')
    });

    static field_definitions = Object.assign({}, super.field_definitions, {
        'stroke': {
            'label': Locale.t('editor.configseditor.SVGForm.fields.stroke.label', 'Stroke color'),
            'input': {
                'type': ColorInput,
                'configs': { 'format': 'css' }
            }
        },
        'stroke-width': {
            'label': Locale.t('editor.configseditor.SVGForm.fields.stroke-width.label', 'Stroke width'),
            'input': {
                'type': NumberInput,
                'configs': { 'min': 0 }
            }
        },
        'stroke-dasharray': {
            'label': Locale.t('editor.configseditor.SVGForm.fields.stroke-dasharray.label', 'Stroke style'),
            'input': {
                'type': SelectInput,
                'configs': {
                    'emptyLabel': '—',
                    'options': {
                        '2,2': '···',
                        '5,5': '- -',
                        '5,2,2,2': '-·-',
                        '5,2,2,2,2,2': '-··-'
                    }
                }
            }
        },
        'fill': {
            'label': Locale.t('editor.configseditor.SVGForm.fields.fill.label', 'Fill color'),
            'input': {
                'type': ColorInput,
                'configs': { 'format': 'css' }
            }
        },
        'marker-start': {
            'label': Locale.t('editor.configseditor.SVGForm.fields.marker-start.label', 'Marker start'),
            'input': {
                'type': SelectInput
            }
        },
        'marker-mid': {
            'label': Locale.t('editor.configseditor.SVGForm.fields.marker-mid.label', 'Marker mid'),
            'input': {
                'type': SelectInput
            }
        },
        'marker-end': {
            'label': Locale.t('editor.configseditor.SVGForm.fields.marker-end.label', 'Marker end'),
            'input': {
                'type': SelectInput
            }
        },
        'colors': {
            'group': true,
            'items': {
                'colors': {
                    'label': Locale.t('editor.configseditor.SVGForm.fields.colors.label', 'Colors'),
                    'input': {
                        'type': HiddenInput
                    }
                },
                'color1': {
                    'input': {
                        'type': ColorInput,
                        'configs': { 'format': 'css', 'picker': false }
                    },
                    'attributes': {
                        'class': 'colors-subfield'
                    }
                },
                'color2': {
                    'input': {
                        'type': ColorInput,
                        'configs': { 'format': 'css', 'picker': false }
                    },
                    'attributes': {
                        'class': 'colors-subfield'
                    }
                }
            }
        }
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        this.addClass(className);

        // fix event handlers scope
        this.onComponentLoad = this.onComponentLoad.bind(this);
    }

    /**
     * @inheritdoc
     */
    setComponents(components) {
        super.setComponents(components);

        this
            .updateInputs()
            .updateColorsSubInputEmptyValue();

        this.getComponents().forEach((component) => {
            if (!component.isLoaded()) {
                component.addListener('contentload', this.onComponentLoad);
            }
        });

        return this;
    }

    /**
     * @inheritdoc
     */
    unsetComponents(supressEvent) {
        if (this.components) {
            this.components.forEach((component) => {
                component.removeListener('contentload', this.onComponentLoad);
            });
        }

        this
            .updateInputs()
            .updateColorsSubInputEmptyValue();

        super.unsetComponents(supressEvent);

        return this;
    }

    /**
     * Component contentload event handler.
     *
     * @private
     */
    onComponentLoad() {
        this
            .updateFieldsVisibility()
            .updateInputs()
            .updateColorsSubInputEmptyValue();
    }

    /**
     * @inheritdoc
     */
    onFieldValueChange(evt) {
        const name = evt.detail.field.data('property');
        const value = evt.detail.value;

        switch (name) {
            case 'color1':
            case 'color2':
                {
                    const colors = [];
                    this.getColorsSubFields().forEach((subfield) => {
                        const input = subfield.getInput();
                        if (!input.disabled) {
                            colors.push(input.getValue());
                        }
                    });
                    this.getField('colors').getInput().setValue(colors);
                }
                return;

            case 'colors':
                if (isString(value)) {
                    evt.detail.value = value.split(',');
                }
                break;
        }

        super.onFieldValueChange(evt);
    }

    /**
     * @inheritdoc
     */
    updateFieldValue(name, supressEvent) {
        super.updateFieldValue(name, supressEvent);

        // Update colors sub-inputs values.
        if (name === 'colors' && this.components) {
            const master_component = this.getMasterComponent();
            const value = master_component.getPropertyValue(name);

            this.getColorsSubFields().forEach((subfield, index) => {
                subfield.getInput().setValue(value ? value[index] : null, true);
            });

            this.updateColorsSubInputEmptyValue();
        }
    }

    /**
     * @inheritdoc
     */
    updateFieldsVisibility() {
        super.updateFieldsVisibility();

        // Hide/show colors inputs.
        this.getColorsSubFields().forEach((subfield) => {
            const property = subfield.data('property');
            const toggle = this.components.every((component) => {
                return component.isLoaded() && component.svg_dom.find(`.${property}`).count() > 0;
            });
            subfield.getInput()[toggle ? 'show' : 'hide']();
        });

        return this;
    }

    /**
     * Update inputs.
     *
     * @private
     * @return {this}
     */
    updateInputs() {
        const marker_start_input = this.getField('marker-start').getInput().clear().disable();
        const marker_mid_input = this.getField('marker-mid').getInput().clear().disable();
        const marker_end_input = this.getField('marker-end').getInput().clear().disable();

        const components = this.getComponents();
        if (components) {
            const master_component = this.getMasterComponent();
            let same_src = true;

            if (components.length > 1) {
                const src = master_component.getPropertyValue('src');
                same_src = components.every((component) => {
                    return component.getPropertyValue('src') === src;
                });
            }

            if (same_src) {
                const markers = Object.entries(master_component.getMarkers());
                if (markers.length > 0) {
                    markers.forEach(([id, marker]) => {
                        const name = Dom.data(marker, 'name');

                        marker_start_input.addOption(id, name ? name : id);
                        marker_mid_input.addOption(id, name ? name : id);
                        marker_end_input.addOption(id, name ? name : id);
                    });

                    marker_start_input.enable();
                    marker_mid_input.enable();
                    marker_end_input.enable();
                }
            }
        }

        return this;
    }

    /**
     * Get the colors subfields
     *
     * @private
     * @return {Field[]} The sub fields.
     */
    getColorsSubFields() {
        return Object.values(this.getFields()).filter((field) => field.hasClass('colors-subfield'));
    }

    /**
     * Update colors subinputs' empty value
     * depending on the default value of the component's corresponding propoerty.
     *
     * @private
     * @return {this}
     */
    updateColorsSubInputEmptyValue() {
        const master_component = this.getMasterComponent();

        if (master_component && master_component.isLoaded()) {
            // Get current value.
            const value = master_component.getPropertyValue('colors');

            // Get default value.
            master_component.setPropertyValue('colors', null, true);

            this.getColorsSubFields().forEach((subfield, index) => {
                const empty_value = master_component.svg_dom.find(`.color${index + 1}`).css('fill');

                // Update input's empty value.
                subfield.getInput().setEmptyValue(empty_value);
            });

            // Revert to current value.
            master_component.setPropertyValue('colors', value, true);
        }

        return this;
    }
}
