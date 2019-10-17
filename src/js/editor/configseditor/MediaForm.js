import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

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
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`media-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.MediaForm.title.single', 'Attributes of media'),
            'title_plural': Locale.t('editor.configseditor.MediaForm.title.plural', 'Attributes of @count media'),
            'fields': [
                'hidden',
                'position',
                'dimension'
            ]
        });
    }
}
