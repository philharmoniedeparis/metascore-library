import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

/**
 * A controller component form class
 */
export default class ControllerForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.ControllerForm.title.single', 'Attributes of controller'),
        'title_plural': Locale.t('editor.configseditor.ControllerForm.title.plural', 'Attributes of @count controllers'),
        'fields': {
            'name': super.defaults.fields.name,
            'border': super.defaults.fields.border,
            'position': super.defaults.fields.position,
        }
    });
}
