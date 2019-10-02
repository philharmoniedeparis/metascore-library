import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/ControllerForm.scss';

/**
 * A media component form class
 */
export default class ControllerForm extends ComponentForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(components, configs) {
        // call parent constructor
        super(components, configs);

        this.addClass(`controller-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'title': Locale.t('editor.configseditor.ControllerForm.title.single', 'Attributes of controller'),
            'title_plural': Locale.t('editor.configseditor.ControllerForm.title.plural', 'Attributes of @count controllers')
        };
    }

    setupFields(){
        super.setupFields();

        return this;
    }
}
