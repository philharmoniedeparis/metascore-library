import Input from '../Input';
import Dom from '../../Dom';
import {uuid} from '../../utils/String';

import {className} from '../../../../css/core/ui/input/RadioButtons.scss';

/**
 * A select list field based on an HTML select element
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
export default class RadioButtonsInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [options=[]] A list of select options as objects with 'value' and 'text' keys
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`radiobuttons ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'options': [],
            'name': `radiobuttons-${uuid(5)}`
        });
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        this.configs.options.forEach((option) => {
            this.addRadioButton(option.value, option.text);
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
         * @type {String}
         */
        this.value = null;

        const radiobutton = this.find('input:checked');
        if(radiobutton){
            this.value = radiobutton.val();
        }

        this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
    }

    /**
     * Set the field's value
     *
     * @param {Array} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        this.value = null;

        this.find('input').forEach((radiobutton_el) => {
            const radiobutton = new Dom(radiobutton_el);

            if(radiobutton.attr('value') === value){
                radiobutton_el.checked = true;
                this.value = value;
            }
            else{
                radiobutton_el.checked = false;
            }
        });

        if(supressEvent !== true){
            this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
        }

        return this;
    }

    /**
     * Add a radio button
     *
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @return {Dom} The created Dom object
     */
    addRadioButton(value, text){
        const uid = `radiobutton-${uuid(5)}`;

        const radio_wrapper = new Dom('<div/>', {'class': 'radiobutton-wrapper'})
            .appendTo(this);

        const radiobutton = new Dom('<input/>', {'id': uid, 'type': 'radio', 'value': value})
            .attr('name', this.configs.name)
            .addListener('click', this.onClick.bind(this))
            .addListener('change', this.onChange.bind(this))
            .appendTo(radio_wrapper);

        new Dom('<label/>', {'text': text, 'for': uid})
            .appendTo(radio_wrapper);

        return radiobutton;
    }

    /**
     * Remove a checkbox by value
     *
     * @param {String} value The value of the option to remove
     * @return {Dom} The checkbox's Dom object
     */
    removeRadioButton(value){
        const radiobutton = this.find(`input[value="${value}"]`);

        radiobutton.parents().remove();

        return radiobutton;
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
        super.disable();

        this.find('input').attr('disabled', 'disabled');

        return this;
    }

    /**
     * Enable the field
     *
     * @return {this}
     */
    enable() {
        super.enable();

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
