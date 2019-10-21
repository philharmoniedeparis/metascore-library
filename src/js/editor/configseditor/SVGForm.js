import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';
import NumberInput from '../../core/ui/input/NumberInput';
import ColorInput from '../../core/ui/input/ColorInput';

import {className} from '../../../css/editor/configseditor/SVGForm.scss';

/**
 * A media component form class
 */
export default class SVGForm extends ElementForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`svg-form ${className}`);
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
                'stroke',
                'stroke-width',
                'stroke-dasharray',
                'fill',
                'background',
                'border',
                'time',
                'position',
                'dimension'
            ]
        });
    }

    addField(name){
        switch(name){
            case 'stroke':
                this.fields[name] = new Field(
                    new ColorInput(),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.stroke.label', 'Stroke color')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'stroke-width':
                this.fields[name] = new Field(
                    new NumberInput({
                        'min': 0
                    }),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.stroke-width.label', 'Stroke width')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'stroke-dasharray':
                this.fields[name] = new Field(
                    new SelectInput({
                        'options': {
                            'none': Locale.t('editor.configseditor.SVGForm.fields.stroke-dasharray.options.none', 'Solid'),
                            '5,5': Locale.t('editor.configseditor.SVGForm.fields.stroke-dasharray.options.5,5', 'Dotted'),
                            '20,10': Locale.t('editor.configseditor.SVGForm.fields.stroke-dasharray.options.20,10', 'Dashed')
                        }
                    }),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.stroke-dasharray.label', 'Stroke style')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                    break;

                case 'fill':
                    this.fields[name] = new Field(
                        new ColorInput(),
                        {
                            'label': Locale.t('editor.configseditor.SVGForm.fields.fill.label', 'Fill color')
                        })
                        .data('property', name)
                        .appendTo(this.fields_wrapper);
                        break;

            default:
                super.addField(name);
        }

        return this;
    }
}
