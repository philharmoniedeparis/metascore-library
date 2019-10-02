import ElementForm from './ElementForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/ContentForm.scss';

/**
 * A media component form class
 */
export default class ContentForm extends ElementForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(components, configs) {
        // call parent constructor
        super(components, configs);

        this.addClass(`content-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'title': Locale.t('editor.configseditor.ContentForm.title.single', 'Attributes of content'),
            'title_plural': Locale.t('editor.configseditor.ContentForm.title.plural', 'Attributes of @count contents')
        };
    }

    setupFields(){
        super.setupFields();

        return this;
    }
}
