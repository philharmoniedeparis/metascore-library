import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

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
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`page-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.PageForm.title.single', 'Attributes of page'),
            'title_plural': Locale.t('editor.configseditor.PageForm.title.plural', 'Attributes of @count pages'),
            'fields': [
                'background',
                'time'
            ]
        });
    }
}
