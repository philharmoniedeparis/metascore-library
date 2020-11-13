import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

/**
 * A video renderer component form class
 */
export default class VideoRendererForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.VideoRendererForm.title.single', 'Attributes of video renderer'),
        'title_plural': Locale.t('editor.configseditor.VideoRendererForm.title.plural', 'Attributes of @count video renderers'),
        'fields': [
            'name',
            'hidden',
            'background',
            'border',
            'position',
            'dimension'
        ]
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        this.addClass(`video-renderer-form`);
    }
}
