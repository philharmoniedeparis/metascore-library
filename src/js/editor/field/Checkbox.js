import Field from '../Field';
import Dom from '../../core/Dom';
import {uuid} from '../../core/utils/String';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

export default class Checkbox extends Field{

    /**
     * A checkbox field based on an HTML input[type=checkbox] element
     *
     * @class Checkbox
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.checked=false] Whether the field is checked by default
     * @param {Boolean} [configs.checked_value=true] The value when checked
     * @param {Boolean} [configs.unchecked_value=false] The value when unchecked
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('checkboxfield');

        this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'checked': false,
            'checked_value': true,
            'unchecked_value': false
        });
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        const uid = `field-${uuid(5)}`;

        if(this.configs.label){
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new Dom('<input/>', {'type': 'checkbox', 'id': uid})
            .addListener('click', this.onClick.bind(this))
            .addListener('change', this.onChange.bind(this))
            .appendTo(this.input_wrapper);
    }

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        if(this.is_readonly){
            evt.preventDefault();
        }
    }

    /**
     * The change event handler
     *
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    onChange(evt){
        if(this.is_readonly){
            evt.preventDefault();
            return;
        }

        if(this.input.is(":checked")){
            this.value = this.configs.checked_value;
            this.addClass('checked');
        }
        else{
            this.value = this.configs.unchecked_value;
            this.removeClass('checked');
        }

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        this.input.get(0).checked = value === this.configs.checked_value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    }

}
