import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/VideoRendererForm.scss';

/**
 * A video renderer component form class
 */
export default class VideoRendererForm extends ComponentForm {

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        this.addClass(`video-renderer-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.VideoRendererForm.title.single', 'Attributes of video renderer'),
            'title_plural': Locale.t('editor.configseditor.VideoRendererForm.title.plural', 'Attributes of @count video renderers'),
            'fields': [
                'name',
                'hidden',
                'background',
                'border',
                'position',
                'dimension'
            ]
        });
    }
}
