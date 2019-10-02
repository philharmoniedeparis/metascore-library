import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';

import {className} from '../../../css/editor/configseditor/CursorForm.scss';

/**
 * A media component form class
 */
export default class CursorForm extends ElementForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(components, configs) {
        // call parent constructor
        super(components, configs);

        this.addClass(`cursor-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'title': Locale.t('editor.configseditor.CursorForm.title.single', 'Attributes of cursor'),
            'title_plural': Locale.t('editor.configseditor.CursorForm.title.plural', 'Attributes of @count cursors')
        };
    }

    setupFields(){
        super.setupFields();

        // Form
        this.fields.form = new Field(
            new SelectInput({
                'options': {
                    'linear': Locale.t('editor.configseditor.CursorForm.fields.form.options.linear', 'Linear'),
                    'circular': Locale.t('editor.configseditor.CursorForm.fields.form.options.circular', 'Circular')
                }
            }),
            {
                'label': Locale.t('editor.configseditor.CursorForm.fields.form.label', 'Form')
            })
            .data('property', 'form')
            .appendTo(this.fields_wrapper);

        // Direction
        this.fields.direction = new Field(
            new SelectInput({
                'options': {
                    'right': Locale.t('editor.configseditor.CursorForm.fields.direction.options.right', 'Left > Right'),
                    'left': Locale.t('editor.configseditor.CursorForm.fields.direction.options.left', 'Right > Left'),
                    'bottom': Locale.t('editor.configseditor.CursorForm.fields.direction.options.bottom', 'Top > Bottom'),
                    'top': Locale.t('editor.configseditor.CursorForm.fields.direction.options.top', 'Bottom > Top'),
                    'cw': Locale.t('editor.configseditor.CursorForm.fields.direction.options.cw', 'Clockwise'),
                    'ccw': Locale.t('editor.configseditor.CursorForm.fields.direction.options.ccw', 'Counterclockwise')
                }
            }),
            {
                'label': Locale.t('editor.configseditor.CursorForm.fields.direction.label', 'Direction')
            })
            .data('property', 'direction')
            .appendTo(this.fields_wrapper);

        return this;
    }
}
