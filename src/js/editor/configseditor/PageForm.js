import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';
import { pick } from '../../core/utils/Object';

/**
 * A page component form class
 */
export default class PageForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.PageForm.title.single', 'Attributes of page'),
        'title_plural': Locale.t('editor.configseditor.PageForm.title.plural', 'Attributes of @count pages')
    });

    static field_definitions = pick(super.field_definitions, [
        'background-color',
        'background-image',
        'time'
    ]);

    /**
     * @inheritdoc
     */
    updateFieldValues(supressEvent) {
        if (this.components) {
            if (this.hasField('start-time')) {
                const input = this.getField('start-time').getInput();
                input.readonly(false).setMin(null).enable();

                this.components.forEach((page) => {
                    const block = page.getParent();

                    if (block.getPropertyValue('synched')) {
                        const index = block.getChildIndex(page);
                        const previous_page = block.getChild(index - 1);

                        if (previous_page) {
                            const min = previous_page.getPropertyValue('end-time');
                            input.setMin(min);
                        }
                        else {
                            input.readonly(true);
                        }
                    }
                    else {
                        input.disable();
                    }
                });
            }

            if (this.hasField('end-time')) {
                const input = this.getField('end-time').getInput();
                input.readonly(false).setMax(null).enable();

                this.components.forEach((page) => {
                    const block = page.getParent();

                    if (block.getPropertyValue('synched')) {
                        const index = block.getChildIndex(page);
                        const next_page = block.getChild(index + 1);

                        if (next_page) {
                            const max = next_page.getPropertyValue('end-time');
                            input.setMax(max);
                        }
                        else {
                            input.readonly(true);
                        }
                    }
                    else {
                        input.disable();
                    }
                });
            }
        }

        super.updateFieldValues(supressEvent);

        return this;
    }
}
