import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/ElementForm.scss';

/**
 * An element component form class
 */
export default class ElementForm extends ComponentForm {

    /**
     * Instantiate
     *
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

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
                'background',
                'border',
                'opacity',
                'time',
                'position',
                'dimension'
            ]
        });
    }
}
