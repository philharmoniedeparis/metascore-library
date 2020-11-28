import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import { isString } from '../../core/utils/Var';
import NumberInput from '../../core/ui/input/NumberInput';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import TimeInput from '../../core/ui/input/TimeInput';
import ColorInput from '../../core/ui/input/ColorInput';
import HiddenInput from '../../core/ui/input/HiddenInput';

import loop_duration_clear_icon from '../../../img/editor/configseditor/animationform/reset.svg?svg-sprite';

import {className} from '../../../css/editor/configseditor/AnimationForm.scss';

/**
 * An animation component form class
 */
export default class AnimationForm extends ElementForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.AnimationForm.title.single', 'Attributes of animation'),
        'title_plural': Locale.t('editor.configseditor.AnimationForm.title.plural', 'Attributes of @count animations'),
        'fields': {
            'name': super.defaults.fields.name,
            'hidden': super.defaults.fields.hidden,
            'start-frame': {
                'label': Locale.t('editor.configseditor.AnimationForm.fields.start-frame.label', 'Start frame'),
                'input': {
                    'type': NumberInput,
                    'configs': {
                        'min': 1
                    }
                }
            },
            'loop-duration': {
                'label': Locale.t('editor.configseditor.AnimationForm.fields.loop-duration.label', 'Loop duration'),
                'input': {
                    'type': TimeInput,
                    'configs': {
                        'min': 0.01,
                        'clearButton': true,
                        'clearButtonIcon': loop_duration_clear_icon,
                        'clearButtonTitle': Locale.t('editor.configseditor.AnimationForm.fields.loop-duration.clear-button.title', 'Reset value')
                    }
                }
            },
            'reversed': {
                'label': Locale.t('editor.configseditor.AnimationForm.fields.reversed.label', 'Reversed'),
                'input': {
                    'type': CheckboxInput,
                    'configs': {
                        'checked': false
                    }
                }
            },
            'colors': {
                'group': true,
                'items': {
                    'colors': {
                        'label': Locale.t('editor.configseditor.AnimationForm.fields.colors.label', 'Colors'),
                        'input': {
                            'type': HiddenInput
                        }
                    },
                    'color1': {
                        'input': {
                            'type': ColorInput,
                            'configs': {'format': 'css', 'picker': false}
                        },
                        'attributes': {
                            'class': 'colors-subfield'
                        }
                    },
                    'color2': {
                        'input': {
                            'type': ColorInput,
                            'configs': {'format': 'css', 'picker': false}
                        },
                        'attributes': {
                            'class': 'colors-subfield'
                        }
                    }
                }
            },
            'background-color': super.defaults.fields['background-color'],
            'background-image': super.defaults.fields['background-image'],
            'border': super.defaults.fields.border,
            'opacity': super.defaults.fields.opacity,
            'time': super.defaults.fields.time,
            'position': super.defaults.fields.position,
            'dimension': super.defaults.fields.dimension,
        }
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        // fix event handlers scope
        this.onComponentLoad = this.onComponentLoad.bind(this);

        this.addClass(`animation-form ${className}`);
    }

    /**
     * @inheritdoc
     */
    setComponents(components){
        super.setComponents(components);

        this
            .updateInputs()
            .updateColorsSubInputEmptyValue();

        this.getComponents().forEach((component) => {
            if(!component.isLoaded()){
                component.addListener('contentload', this.onComponentLoad);
            }
        });

        return this;
    }

    /**
     * @inheritdoc
     */
    unsetComponents(supressEvent){
        if(this.components){
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
    onComponentLoad(){
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

        switch(name) {
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
    updateFieldValue(name, supressEvent){
        super.updateFieldValue(name, supressEvent);

        // Update colors sub-inputs values.
        if(name === 'colors' && this.components){
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
                return component.contents.find(`.${property}`).count() > 0;
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
    updateInputs(){
        // Update start-frame max value.
        const frames = [];
        this.components.forEach((component) => {
            frames.push(component.getTotalFrames());
        });
        const min_frames = Math.min(...frames);
        this.getField('start-frame').getInput().setMax(Math.max(min_frames, 0));

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
                const empty_value = master_component.contents.find(`.color${index+1} path`).css('fill');

                // Update input's empty value.
                subfield.getInput().setEmptyValue(empty_value);
            });

            // Revert to current value.
            master_component.setPropertyValue('colors', value, true);
        }

        return this;
    }
}
