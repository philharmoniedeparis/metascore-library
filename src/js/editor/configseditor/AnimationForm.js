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
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`animation-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.AnimationForm.title.single', 'Attributes of animation'),
            'title_plural': Locale.t('editor.configseditor.AnimationForm.title.plural', 'Attributes of @count animations'),
            'fields': [
                'name',
                'hidden',
                'scenario',
                'start-frame',
                'loop-duration',
                'color-theme',
                'background',
                'border',
                'time',
                'position',
                'dimention'
            ]
        });
    }
}
