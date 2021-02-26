import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';
import { omit } from '../../core/utils/Object';

/**
 * A controller component form class
 */
export default class ControllerForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.ControllerForm.title.single', 'Attributes of controller'),
        'title_plural': Locale.t('editor.configseditor.ControllerForm.title.plural', 'Attributes of @count controllers')
    });

    static field_definitions = omit(super.field_definitions, [
        'border',
        'background-color',
        'background-image',
        'time',
        'dimension',
    ]);
}
