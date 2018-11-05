import Field from '../Field';
import Dom from '../../core/Dom';
import {uuid} from '../../core/utils/String';
import {isArray} from '../../core/utils/Var';

import {className} from '../../../css/editor/field/Checkboxes.less';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

/**
 * A select list field based on an HTML select element
 */
export default class Checkboxes extends Field {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [options=[]] A list of select options as objects with 'value' and 'text' keys
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`checkboxes ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'options': []
        });
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        if(this.configs.label){
            /**
             * A potential <label> element
             * @type {Dom}
             */
            this.label = new Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        /**
         * The input-wrapper container
         * @type {Dom}
         */
        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.configs.options.forEach((option) => {
            this.addCheckbox(option.value, option.text);
        });
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

        /**
         * The current value
         * @type {Array}
         */
        this.value = [];

        this.input_wrapper.find('input').forEach((checkbox_el) => {
            const checkbox = new Dom(checkbox_el);

            if(checkbox.is(":checked")){
                this.value.push(checkbox.val());
            }
        });

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Array} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        const arr_value = isArray(value) ? value : [value];

        this.input_wrapper.find('input').forEach((checkbox_el) => {
            const checkbox = new Dom(checkbox_el);

            checkbox_el.checked = arr_value.includes(checkbox.attr('value'));

            if(supressEvent !== true){
                checkbox.triggerEvent('change');
            }
        });

        return this;
    }

    /**
     * Add a checkbox to the list of checkboxes
     *
     * @method addCheckbox
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @return {Dom} The created Dom object
     */
    addCheckbox(value, text){
        const uid = `checkbox-${uuid(5)}`;

        const checkbox_wrapper = new Dom('<div/>', {'class': 'checkbox-wrapper'})
            .appendTo(this.input_wrapper);

        const checkbox = new Dom('<input/>', {'id': uid, 'type': 'checkbox', 'value': value})
            .addListener('click', this.onClick.bind(this))
            .addListener('change', this.onChange.bind(this))
            .appendTo(checkbox_wrapper);

        new Dom('<label/>', {'text': text, 'for': uid})
            .appendTo(checkbox_wrapper);

        if(this.configs.name){
            checkbox.attr('name', this.configs.name);
        }

        return checkbox;
    }

    /**
     * Remove a checkbox by value
     *
     * @method removeCheckbox
     * @param {String} value The value of the option to remove
     * @return {Dom} The checkbox's Dom object
     */
    removeCheckbox(value){
        const checkbox = this.input_wrapper.find(`input[value="${value}"]`);

        checkbox.parents().remove();

        return checkbox;
    }

    /**
     * Remove all groups and options
     *
     * @method clear
     * @chainable
     */
    clear() {
        this.input_wrapper.empty();

        return this;
    }

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    disable() {
        /**
         * Whether the field is disabled
         * @type {Boolean}
         */
        this.disabled = true;

        this.addClass('disabled');

        this.input_wrapper.find('input').attr('disabled', 'disabled');

        return this;
    }

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    enable() {
        this.disabled = false;

        this.removeClass('disabled');

        this.input_wrapper.find('input').attr('disabled', null);

        return this;
    }

    /**
     * Toggle the readonly attribute of the field
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    readonly(readonly){
        super.readonly(readonly);

        this.input_wrapper.find('input').attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    }

}
