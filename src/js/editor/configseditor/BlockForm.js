import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/BlockForm.scss';

/**
 * A media component form class
 */
export default class BlockForm extends ComponentForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`block-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.BlockForm.title.single', 'Attributes of block'),
            'title_plural': Locale.t('editor.configseditor.BlockForm.title.plural', 'Attributes of @count blocks'),
            'fields': [
                'name',
                'hidden',
                'scenario',
                'background',
                'border',
                'position',
                'dimension'
            ]
        });
    }
}
