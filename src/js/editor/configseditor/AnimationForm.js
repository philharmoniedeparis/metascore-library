import ElementForm from './ElementForm';
import Locale from '../../core/Locale';

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
    constructor(components, configs) {
        // call parent constructor
        super(components, configs);

        this.addClass(`animation-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'title': Locale.t('editor.configseditor.AnimationForm.title.single', 'Attributes of cursor'),
            'title_plural': Locale.t('editor.configseditor.AnimationForm.title.plural', 'Attributes of @count cursors')
        };
    }

    setupFields(){
        super.setupFields();

        return this;
    }
}
