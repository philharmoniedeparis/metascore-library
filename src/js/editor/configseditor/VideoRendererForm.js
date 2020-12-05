import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

/**
 * A video renderer component form class
 */
export default class VideoRendererForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.VideoRendererForm.title.single', 'Attributes of video renderer'),
        'title_plural': Locale.t('editor.configseditor.VideoRendererForm.title.plural', 'Attributes of @count video renderers'),
        'fields': {
            'name': super.defaults.fields.name,
            'hidden': super.defaults.fields.hidden,
            'background-color': super.defaults.fields['background-color'],
            'background-image': super.defaults.fields['background-image'],
            'border': super.defaults.fields.border,
            'position': super.defaults.fields.position,
            'dimension': super.defaults.fields.dimension
        }
    });
}
