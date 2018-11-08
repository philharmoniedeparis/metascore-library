import Dom from '../../core/Dom';
import Field from '../Field';

import {className} from '../../../css/editor/field/Checkbox.less';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

/**
 * A checkbox field based on an HTML input[type=checkbox] element
 */
export default class Checkbox extends Field{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [checked=false] Whether the field is checked by default
     * @property {Boolean} [checked_value=true] The value when checked
     * @property {Boolean} [unchecked_value=false] The value when unchecked
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`checkbox ${className}`);

        this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
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
        super.setupUI();

        this.input
            .attr('type', 'checkbox')
            .addListener('click', this.onClick.bind(this));

        new Dom('<label/>', {'for': this.input.attr('id')})
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
            /**
             * The current value
             * @type {String}
             */
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
