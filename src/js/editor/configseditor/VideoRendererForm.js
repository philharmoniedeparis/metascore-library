import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

/**
 * A video renderer component form class
 */
export default class VideoRendererForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.VideoRendererForm.title.single', 'Attributes of video renderer'),
        'title_plural': Locale.t('editor.configseditor.VideoRendererForm.title.plural', 'Attributes of @count video renderers')
    });

    static field_definitions = {
        'name': super.field_definitions.name,
        'hidden': super.field_definitions.hidden,
        'background-color': super.field_definitions['background-color'],
        'background-image': super.field_definitions['background-image'],
        'border': super.field_definitions.border,
        'position': super.field_definitions.position,
        'dimension': super.field_definitions.dimension
    };
}
