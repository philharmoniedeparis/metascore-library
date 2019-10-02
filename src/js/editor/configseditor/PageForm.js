import ComponentForm from './ComponentForm';
import Field from '../Field';
import Locale from '../../core/Locale';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import NumberInput from '../../core/ui/input/NumberInput';

import {className} from '../../../css/editor/configseditor/PageForm.scss';

/**
 * A media component form class
 */
export default class PageForm extends ComponentForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(components, configs) {
        // call parent constructor
        super(components, configs);

        this.addClass(`page-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'title': Locale.t('editor.configseditor.PageForm.title.single', 'Attributes of media'),
            'title_plural': Locale.t('editor.configseditor.PageForm.title.plural', 'Attributes of @count media')
        };
    }

    setupFields(){
        super.setupFields();

        // Background image
        this.fields['background-image'] = new Field(
            new SelectInput(),
            {
                'label': Locale.t('editor.configseditor.ElementForm.fields.background-image.label', 'Background image')
            })
            .data('property', 'background-image')
            .appendTo(this.fields_wrapper);

        // Background color
        this.fields['background-color'] = new Field(
            new ColorInput(),
            {
                'label': Locale.t('editor.configseditor.ElementForm.fields.background-color.label', 'Background color')
            })
            .data('property', 'background-color')
            .appendTo(this.fields_wrapper);

        // Start
        this.fields.start_time = new Field(
            new TimeInput({
                'inButton': true,
                'outButton': true
            }),
            {
                'label': Locale.t('editor.configseditor.ElementForm.fields.start-time.label', 'Start')
            })
            .data('property', 'start-time')
            .appendTo(this.fields_wrapper);

        // End
        this.fields.end_time = new Field(
            new TimeInput({
                'inButton': true,
                'outButton': true
            }),
            {
                'label': Locale.t('editor.configseditor.ElementForm.fields.end-time.label', 'End')
            })
            .data('property', 'end-time')
            .appendTo(this.fields_wrapper);

        return this;
    }
}
