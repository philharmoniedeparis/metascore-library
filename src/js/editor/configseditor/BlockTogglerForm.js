import BlockForm from './BlockForm';
import Locale from '../../core/Locale';
import SelectInput from '../../core/ui/input/SelectInput';

/**
 * A block toggler component form class
 */
export default class BlockTogglerForm extends BlockForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.BlockTogglerForm.title.single', 'Attributes of block toggler'),
        'title_plural': Locale.t('editor.configseditor.BlockTogglerForm.title.plural', 'Attributes of @count block togglers')
    });

    static field_definitions = {
        'name': super.field_definitions.name,
        'hidden': super.field_definitions.hidden,
        'blocks': {
            'label': Locale.t('editor.configseditor.BlockTogglerForm.fields.blocks.label', 'Blocks'),
            'input': {
                'type': SelectInput,
                'configs': { 'multiple': true }
            }
        },
        'background-color': super.field_definitions['background-color'],
        'background-image': super.field_definitions['background-image'],
        'border': super.field_definitions.border,
        'position': super.field_definitions.position,
        'dimension': super.field_definitions.dimension
    };

    updateComponentFields(components) {
        const input = this.getField('blocks').getInput();

        input.clear();

        components.forEach((component) => {
            input.addOption(component.getId(), component.getName());
        });

        this.updateFieldValue('blocks', true);

        return this;
    }
}
