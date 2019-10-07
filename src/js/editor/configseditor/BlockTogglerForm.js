import BlockForm from './BlockForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/BlockTogglerForm.scss';

/**
 * A media component form class
 */
export default class BlockTogglerForm extends BlockForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`blocktoggler-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.BlockTogglerForm.title.single', 'Attributes of block toggler'),
            'title_plural': Locale.t('editor.configseditor.BlockTogglerForm.title.plural', 'Attributes of @count block togglers'),
            'fields': [
                'name',
                'hidden',
                'scenario',
                'background',
                'border',
                'position',
                'dimention'
            ]
        });
    }
}
