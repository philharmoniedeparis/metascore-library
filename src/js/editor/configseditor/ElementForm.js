import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/ElementForm.scss';

/**
 * A media component form class
 */
export default class ElementForm extends ComponentForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`element-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.ElementForm.title.single', 'Attributes of element'),
            'title_plural': Locale.t('editor.configseditor.ElementForm.title.plural', 'Attributes of @count elements'),
            'fields': [
                'name',
                'hidden',
                'scenario',
                'background',
                'border',
                'time',
                'position',
                'dimention'
            ]
        });
    }
}
