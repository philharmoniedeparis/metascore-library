import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

import {className} from '../../../css/editor/configseditor/ControllerForm.scss';

/**
 * A controller component form class
 */
export default class ControllerForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.ControllerForm.title.single', 'Attributes of controller'),
        'title_plural': Locale.t('editor.configseditor.ControllerForm.title.plural', 'Attributes of @count controllers'),
        'fields': [
            'border',
            'position'
        ]
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        this.addClass(`controller-form ${className}`);
    }
}
