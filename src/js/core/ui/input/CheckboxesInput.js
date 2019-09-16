import Input from '../Input';
import Dom from '../../Dom';
import {uuid} from '../../utils/String';
import {isArray} from '../../utils/Var';

import {className} from '../../../../css/core/ui/input/Checkboxes.scss';

/**
 * A select list field based on an HTML select element
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
export default class CheckboxesInput extends Input {

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
     * @private
     */
    setupUI() {
        this.configs.options.forEach((option) => {
            this.addCheckbox(option.value, option.text);
        });
    }

    /**
     * The click event handler
     *
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

        this.find('input').forEach((checkbox_el) => {
            const checkbox = new Dom(checkbox_el);

            if(checkbox.is(":checked")){
                this.value.push(checkbox.val());
            }
        });

        this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
    }

    /**
     * Set the field's value
     *
     * @param {Array} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        const arr_value = isArray(value) ? value : [value];

        this.find('input').forEach((checkbox_el) => {
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
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @return {Dom} The created Dom object
     */
    addCheckbox(value, text){
        const uid = `checkbox-${uuid(5)}`;

        const checkbox_wrapper = new Dom('<div/>', {'class': 'checkbox-wrapper'})
            .appendTo(this);

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
     * @param {String} value The value of the option to remove
     * @return {Dom} The checkbox's Dom object
     */
    removeCheckbox(value){
        const checkbox = this.find(`input[value="${value}"]`);

        checkbox.parents().remove();

        return checkbox;
    }

    /**
     * Remove all groups and options
     *
     * @return {this}
     */
    clear() {
        this.empty();

        return this;
    }

    /**
     * Disable the field
     *
     * @return {this}
     */
    disable() {
        /**
         * Whether the field is disabled
         * @type {Boolean}
         */
        this.disabled = true;

        this.addClass('disabled');

        this.find('input').attr('disabled', 'disabled');

        return this;
    }

    /**
     * Enable the field
     *
     * @return {this}
     */
    enable() {
        this.disabled = false;

        this.removeClass('disabled');

        this.find('input').attr('disabled', null);

        return this;
    }

    /**
     * Toggle the readonly attribute of the field
     *
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @return {this}
     */
    readonly(readonly){
        super.readonly(readonly);

        this.find('input').attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    }

}
