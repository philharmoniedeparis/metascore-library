import BlockForm from './BlockForm';
import Locale from '../../core/Locale';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';

import {className} from '../../../css/editor/configseditor/BlockTogglerForm.scss';

/**
 * A media component form class
 */
export default class BlockTogglerForm extends BlockForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`blocktoggler-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.BlockTogglerForm.title.single', 'Attributes of block toggler'),
            'title_plural': Locale.t('editor.configseditor.BlockTogglerForm.title.plural', 'Attributes of @count block togglers'),
            'fields': [
                'name',
                'hidden',
                'scenario',
                'blocks',
                'background',
                'border',
                'position',
                'dimension'
            ]
        });
    }

    addField(name){
        switch(name){
            case 'blocks':
                this.fields[name] = new Field(
                    new SelectInput({
                        'multiple': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.BlockTogglerForm.fields.blocks.label', 'Blocks')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            default:
                super.addField(name);
        }

        return this;
    }

    updateComponentFields(components){
        const input = this.getField('blocks').getInput();

        input.clear();

        components.forEach((component) => {
            input.addOption(component.getId(), component.getName());
        });

        this.updateFieldValue('blocks', true);

        return this;
    }
}
