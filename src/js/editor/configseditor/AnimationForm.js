import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';
import NumberInput from '../../core/ui/input/NumberInput';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import TimeInput from '../../core/ui/input/TimeInput';

import {className} from '../../../css/editor/configseditor/AnimationForm.scss';

/**
 * A media component form class
 */
export default class AnimationForm extends ElementForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`animation-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.AnimationForm.title.single', 'Attributes of animation'),
            'title_plural': Locale.t('editor.configseditor.AnimationForm.title.plural', 'Attributes of @count animations'),
            'fields': [
                'name',
                'hidden',
                'start-frame',
                'loop-duration',
                'reversed',
                'color-theme',
                'background',
                'border',
                'time',
                'position',
                'dimention'
            ]
        });
    }

    addField(name){
        switch(name){
            case 'start-frame':
                this.fields[name] = new Field(
                    new NumberInput({
                        'min': 0
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
                        'clearButton': true
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

            case 'color-theme':
                this.fields[name] = new Field(
                    new SelectInput({
                    }),
                    {
                        'label': Locale.t('editor.configseditor.AnimationForm.fields.color-theme.label', 'Color theme')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
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

        const frames = [];
        this.components.forEach((component) => {
            frames.push(component.getTotalFrames());
        });
        this.getField('start-frame').getInput().setMax(Math.min(...frames) - 1);

        return this;
    }
}
