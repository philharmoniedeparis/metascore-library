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
    });

    static field_definitions = {
        'name': super.field_definitions.name,
        'hidden': super.field_definitions.hidden,
        'background-color': super.field_definitions['background-color'],
        'background-image': super.field_definitions['background-image'],
        'border': super.field_definitions.border,
        'position': super.field_definitions.position,
        'dimension': super.field_definitions.dimension,
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
    };
}
