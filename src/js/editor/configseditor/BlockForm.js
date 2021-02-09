import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';
import SelectInput from '../../core/ui/input/SelectInput';
import {omit} from '../../core/utils/Object';

/**
 * A block component form class
 */
export default class BlockForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.BlockForm.title.single', 'Attributes of block'),
        'title_plural': Locale.t('editor.configseditor.BlockForm.title.plural', 'Attributes of @count blocks'),
    });

    static field_definitions = Object.assign(omit(super.field_definitions, ['time']), {
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
    });
}
