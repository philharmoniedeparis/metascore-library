import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import Dom from '../../core/Dom';
import Field from '../Field';
import NumberInput from '../../core/ui/input/NumberInput';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import TimeInput from '../../core/ui/input/TimeInput';
import ColorInput from '../../core/ui/input/ColorInput';

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

            case 'colors': {
                    const wrapper = new Dom('<div/>', {'class': 'field-group colors'})
                        .appendTo(this.fields_wrapper);

                    const colors_fields_label = new Dom('<label/>', {'text': Locale.t('editor.configseditor.AnimationForm.fields.colors-fields.label', 'Colors')})
                        .appendTo(wrapper);

                    this.fields.color1 = new Field(new ColorInput({
                            'picker': false
                        }))
                        .data('property', 'colors')
                        .appendTo(wrapper);

                    colors_fields_label.attr('for', this.fields.color1.getInput().getId());

                    this.fields.color2 = new Field(new ColorInput({
                            'picker': false
                        }))
                        .data('property', 'colors')
                        .appendTo(wrapper);
                }
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
     * @inheritdoc
     */
    onFieldValueChange(evt){
        const name = evt.detail.field.data('property');

        if (name === 'colors') {
            const color1 = this.getField('color1').getInput().getValue();
            const color2 = this.getField('color2').getInput().getValue();
            evt.detail.value = [color1, color2];
        }

        super.onFieldValueChange(evt);
    }

    /**
     * Update inputs.
     *
     * @private
     */
    updateInputs(){
        const frames = [];
        this.components.forEach((component) => {
            frames.push(component.getTotalFrames());
        });
        const min_frames = Math.min(...frames);
        this.getField('start-frame').getInput().setMax(Math.max(min_frames, 0));
    }
}
