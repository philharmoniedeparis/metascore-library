import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';
import SelectInput from '../../core/ui/input/SelectInput';

/**
 * A block component form class
 */
export default class BlockForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.BlockForm.title.single', 'Attributes of block'),
        'title_plural': Locale.t('editor.configseditor.BlockForm.title.plural', 'Attributes of @count blocks'),
        'fields': {
            'name': super.defaults.fields.name,
            'hidden': super.defaults.fields.hidden,
            'background-color': super.defaults.fields['background-color'],
            'background-image': super.defaults.fields['background-image'],
            'border': super.defaults.fields.border,
            'position': super.defaults.fields.position,
            'dimension': super.defaults.fields.dimension,
            'pager-visibility': {
                'label': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.label', 'Pager visibility'),
                'attributes': {
                    'title': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.title', 'Affects the pager in player mode'),
                },
                'input': {
                    'type': SelectInput,
                    'configs': {
                        'options': {
                            'auto': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.options.auto', 'Auto'),
                            'visible': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.options.visible', 'Visible'),
                            'hidden': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.options.hidden', 'Hidden')
                        },
                        'required': true
                    }
                }
            },
        }
    });
}
