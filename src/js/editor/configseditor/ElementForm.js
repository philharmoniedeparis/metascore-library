import ComponentForm from './ComponentForm';
import Locale from '../../core/Locale';

/**
 * An element component form class
 */
export default class ElementForm extends ComponentForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.ElementForm.title.single', 'Attributes of element'),
        'title_plural': Locale.t('editor.configseditor.ElementForm.title.plural', 'Attributes of @count elements'),
    });

    /**
     * @inheritdoc
     */
    updateColorFieldsEmptyValue(input, name) {
        // Element background-color and border-color are applied to contents.
        // @todo: uniform this

        if (!['backgroud-color', 'border-color'].includes(name)) {
            return super.updateColorFieldsEmptyValue(input, name);
        }

        const master_component = this.getMasterComponent();

        // Get current value.
        const value = master_component.getPropertyValue(name);

        // Get default value.
        master_component.setPropertyValue(name, null, true);

        const empty_value = master_component.contents.css(name);

        // Revert to current value.
        master_component.setPropertyValue(name, value, true);

        // Update input's empty value.
        input.setEmptyValue(empty_value);

        return this;
    }
}
