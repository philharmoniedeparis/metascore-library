import ComponentForm from './ComponentForm';
import Field from '../Field';
import Locale from '../../core/Locale';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import NumberInput from '../../core/ui/input/NumberInput';

import {className} from '../../../css/editor/configseditor/MediaForm.scss';

/**
 * A media component form class
 */
export default class MediaForm extends ComponentForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(components, configs) {
        // call parent constructor
        super(components, configs);

        this.addClass(`media-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'title': Locale.t('editor.configseditor.MediaForm.title.single', 'Attributes of media'),
            'title_plural': Locale.t('editor.configseditor.MediaForm.title.plural', 'Attributes of @count media')
        };
    }

    setupFields(){
        super.setupFields();

        // Hidden on start
        this.fields.hidden = new Field(
            new CheckboxInput({
                'checked': false
            }),
            {
                'label': Locale.t('editor.configseditor.MediaForm.fields.hidden.label', 'Hidden on start')
            })
            .data('property', 'hidden')
            .appendTo(this.fields_wrapper);

        // X
        this.fields.x = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true,
                'spinDirection': 'horizontal'
            }),
            {
                'label': Locale.t('editor.configseditor.MediaForm.fields.x.label', 'X')
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
                'label': Locale.t('editor.configseditor.MediaForm.fields.y.label', 'Y')
            })
            .data('property', 'y')
            .appendTo(this.fields_wrapper);

        // Widht
        this.fields.width = new Field(
            new NumberInput({
                'min': 0,
                'spinButtons': true,
                'spinDirection': 'horizontal'
            }),
            {
                'label': Locale.t('editor.configseditor.MediaForm.fields.width.label', 'Width')
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
                'label': Locale.t('editor.configseditor.MediaForm.fields.height.label', 'Height')
            })
            .data('property', 'height')
            .appendTo(this.fields_wrapper);

        return this;
    }
}
