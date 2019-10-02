import ComponentForm from './ComponentForm';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Field from '../Field';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import TextInput from '../../core/ui/input/TextInput';
import SelectInput from '../../core/ui/input/SelectInput';
import ColorInput from '../../core/ui/input/ColorInput';
import NumberInput from '../../core/ui/input/NumberInput';
import BorderRadiusInput from '../../core/ui/input/BorderRadiusInput';

import {className} from '../../../css/editor/configseditor/BlockForm.scss';

/**
 * A media component form class
 */
export default class BlockForm extends ComponentForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(components, configs) {
        // call parent constructor
        super(components, configs);

        this.addClass(`block-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'title': Locale.t('editor.configseditor.BlockForm.title.single', 'Attributes of cursor'),
            'title_plural': Locale.t('editor.configseditor.BlockForm.title.plural', 'Attributes of @count cursors')
        };
    }

    setupFields(){
        super.setupFields();

        // Name
        this.fields.name = new Field(
            new TextInput(),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.name.label', 'Name')
            })
            .data('property', 'name')
            .appendTo(this.fields_wrapper);

        // Hidden on start
        this.fields.hidden = new Field(
            new CheckboxInput({
                'checked': false
            }),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.hidden.label', 'Hidden on start')
            })
            .data('property', 'hidden')
            .appendTo(this.fields_wrapper);

        // Background image
        this.fields['background-image'] = new Field(
            new SelectInput(),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.background-image.label', 'Background image')
            })
            .data('property', 'background-image')
            .appendTo(this.fields_wrapper);

        // Background color
        this.fields['background-color'] = new Field(
            new ColorInput(),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.background-color.label', 'Background color')
            })
            .data('property', 'background-color')
            .appendTo(this.fields_wrapper);

        const border_fields_wrapper = new Dom('<div/>', {'class': 'border-fields'})
            .appendTo(this.fields_wrapper);

        const border_fields_label = new Dom('<label/>', {'text': Locale.t('editor.configseditor.BlockForm.fields.border-fields.label', 'Border')})
            .appendTo(border_fields_wrapper);

        // Border color
        this.fields['border-color'] = new Field(
            new ColorInput(),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.border-color.label', 'Border color')
            })
            .data('property', 'border-color')
            .appendTo(border_fields_wrapper);

        border_fields_label.attr('for', this.fields['border-color'].getInput().getId());

        // Border width
        this.fields['border-width'] = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true
            }),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.border-width.label', 'Border width')
            })
            .data('property', 'border-width')
            .appendTo(border_fields_wrapper);

        // Border radius
        this.fields['border-radius'] = new Field(
            new BorderRadiusInput(),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.border-radius.label', 'Border radius')
            })
            .data('property', 'border-radius')
            .appendTo(this.fields_wrapper);

        // X
        this.fields.x = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true,
                'spinDirection': 'horizontal'
            }),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.x.label', 'X')
            })
            .data('property', 'x')
            .appendTo(this.fields_wrapper);

        // Y
        this.fields.y = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true
            }),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.y.label', 'Y')
            })
            .data('property', 'y')
            .appendTo(this.fields_wrapper);

        // Width
        this.fields.width = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true,
                'spinDirection': 'horizontal'
            }),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.width.label', 'Width')
            })
            .data('property', 'width')
            .appendTo(this.fields_wrapper);

        // Height
        this.fields.height = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true
            }),
            {
                'label': Locale.t('editor.configseditor.BlockForm.fields.height.label', 'Height')
            })
            .data('property', 'height')
            .appendTo(this.fields_wrapper);

        return this;
    }
}
