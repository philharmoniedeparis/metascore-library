import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';

import {className} from '../../../css/editor/configseditor/BlockForm.scss';

/**
 * A block component form class
 */
export default class BlockForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.BlockForm.title.single', 'Attributes of block'),
        'title_plural': Locale.t('editor.configseditor.BlockForm.title.plural', 'Attributes of @count blocks'),
        'fields': [
            'name',
            'hidden',
            'background',
            'border',
            'position',
            'dimension',
            'pager'
        ]
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        this.addClass(`block-form ${className}`);
    }

    /**
     * @inheritdoc
     */
    addField(name){
        switch(name){
            case 'pager':
                this.fields['pager-visibility'] = new Field(
                    new SelectInput({
                        'options': {
                            'auto': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.options.auto', 'Auto'),
                            'visible': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.options.visible', 'Visible'),
                            'hidden': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.options.hidden', 'Hidden')
                        },
                        'required': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.label', 'Pager visibility')
                    })
                    .data('property', 'pager-visibility')
                    .attr('title', Locale.t('editor.configseditor.BlockForm.fields.pager-visibility.title', 'Affects the pager in player mode'))
                    .appendTo(this.fields_wrapper);
                break;

            default:
                super.addField(name);
        }

        return this;
    }
}
