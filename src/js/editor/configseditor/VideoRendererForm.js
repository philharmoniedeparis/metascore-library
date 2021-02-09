import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';
import { omit } from '../../core/utils/Object';

/**
 * A video renderer component form class
 */
export default class VideoRendererForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.VideoRendererForm.title.single', 'Attributes of video renderer'),
        'title_plural': Locale.t('editor.configseditor.VideoRendererForm.title.plural', 'Attributes of @count video renderers')
    });

    static field_definitions = omit(super.field_definitions, ['time']);
}
