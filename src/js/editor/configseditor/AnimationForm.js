import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import { isString } from '../../core/utils/Var';
import Field from '../Field';
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
        'fields': [
            'name',
            'hidden',
            'start-frame',
            'loop-duration',
            'reversed',
            'colors',
            'background',
            'border',
            'opacity',
            'time',
            'position',
            'dimension'
        ]
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

    addField(name){
        switch(name){
            case 'start-frame':
                this.fields[name] = new Field(
                    new NumberInput({
                        'min': 1
                    }),
                    {
                        'label': Locale.t('editor.configseditor.AnimationForm.fields.start-frame.label', 'Start frame')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'loop-duration':
                this.fields[name] = new Field(
                    new TimeInput({
                        'min': 0.01,
                        'clearButton': true,
                        'clearButtonIcon': loop_duration_clear_icon,
                        'clearButtonTitle': Locale.t('editor.configseditor.AnimationForm.fields.loop-duration.clear-button.title', 'Reset value')
                    }),
                    {
                        'label': Locale.t('editor.configseditor.AnimationForm.fields.loop-duration.label', 'Loop duration')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'reversed':
                this.fields[name] = new Field(
                    new CheckboxInput({
                        'checked': false
                    }),
                    {
                        'label': Locale.t('editor.configseditor.AnimationForm.fields.reversed.label', 'Reversed')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'colors':
                this.fields.colors = new Field(
                    new HiddenInput(),
                    {
                        'label': Locale.t('editor.configseditor.AnimationForm.fields.colors.label', 'Colors')
                    })
                    .data('property', 'colors')
                    .appendTo(this.fields_wrapper);

                this.colors_subinputs = [
                    new ColorInput({'picker': false})
                        .addListener('valuechange', this.onColorsInputValueChange.bind(this))
                        .appendTo(this.fields.colors),
                    new ColorInput({'picker': false})
                        .addListener('valuechange', this.onColorsInputValueChange.bind(this))
                        .appendTo(this.fields.colors),
                ];
                break;

            default:
                super.addField(name);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setComponents(components){
        super.setComponents(components);

        this.updateInputs();

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

        this.updateInputs();

        super.unsetComponents(supressEvent);

        return this;
    }

    /**
     * Component contentload event handler.
     *
     * @private
     */
    onComponentLoad(){
        this.updateInputs();
    }

    /**
     * Colors sub-inputs valuechange event handler
     *
     * @private
     */
    onColorsInputValueChange(){
        const colors = [];
        this.colors_subinputs.forEach((input) => {
            if (!input.disabled) {
                colors.push(input.getValue());
            }
        });
        this.getField('colors').getInput().setValue(colors);
    }

    /**
     * @inheritdoc
     */
    onFieldValueChange(evt) {
        const name = evt.detail.field.data('property');
        const value = evt.detail.value;

        if (name === 'colors' && isString(value)) {
            evt.detail.value = value.split(',');
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

            this.colors_subinputs.forEach((input, index) => {
                input.setValue(value ? value[index] : null, true);
            });
        }
    }

    /**
     * Update inputs.
     *
     * @private
     */
    updateInputs(){
        // Update start-frame max value.
        const frames = [];
        this.components.forEach((component) => {
            frames.push(component.getTotalFrames());
        });
        const min_frames = Math.min(...frames);
        this.getField('start-frame').getInput().setMax(Math.max(min_frames, 0));

        // Hide/show color fields.
        this.colors_subinputs.forEach((input, index) => {
            const enable = this.components.every((component) => {
                return component.contents.find(`.color${index+1}`).count() > 0;
            });
            input[enable ? 'enable' : 'disable']();
        });
    }
}
