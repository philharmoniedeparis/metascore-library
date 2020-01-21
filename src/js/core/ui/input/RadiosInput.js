import Input from '../Input';
import Icon from '../Icon';
import Dom from '../../Dom';
import {uuid} from '../../utils/String';

import {className} from '../../../../css/core/ui/input/Radios.scss';

/**
 * A radio buttons input based on an HTML input[type=radio] element
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
 * @param {Mixed} value The new value
 */
export default class RadiosInput extends Input{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [options={}] A list of select options
     * @property {Object} [icon] An optional icon
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`radios ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'options': {},
            'icon': null
        });
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        Object.entries(this.configs.options).forEach(([value, text]) => {
            this.addRadio(value, text);
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

        const radio = this.find('input:checked');
        if(radio){
            this.value = radio.val();
        }

        this.triggerEvent('valuechange', {'input': this, 'value': this.value, 'old': this.old_value}, true, false);

        this.old_value = this.value;
    }

    /**
     * Set the input's value
     *
     * @param {Array} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        this.value = null;

        let matched_checkbox = null;

        this.find('input').forEach((radio_el) => {
            const radio = new Dom(radio_el);

            if(radio.attr('value') === value){
                radio_el.checked = true;

                matched_checkbox = radio;
                this.value = value;
            }
            else{
                radio_el.checked = false;
            }
        });

        if(matched_checkbox && supressEvent !== true){
            matched_checkbox.triggerEvent('change');
        }

        this.old_value = this.value;

        return this;
    }

    /**
     * Add a radio
     *
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @return {Dom} The created Dom object
     */
    addRadio(value, text){
        const uid = `radio-${uuid(5)}`;

        const radio_wrapper = new Dom('<div/>', {'class': 'radio-wrapper'})
            .appendTo(this);

        const radio = new Dom('<input/>', {'id': uid, 'type': 'radio', 'value': value})
            .attr('name', this.configs.name)
            .addListener('click', this.onClick.bind(this))
            .addListener('change', this.onChange.bind(this))
            .appendTo(radio_wrapper);

        const state = new Dom('<div/>', {'class': 'state'})
            .appendTo(radio_wrapper);

        new Dom('<label/>', {'text': text, 'for': uid})
            .appendTo(state);

        if(this.configs.icon){
            this.icon = new Icon({'symbol': this.configs.icon})
                .appendTo(state);
        }

        return radio;
    }

    /**
     * Remove a checkbox by value
     *
     * @param {String} value The value of the option to remove
     * @return {Dom} The checkbox's Dom object
     */
    removeRadio(value){
        const radio = this.find(`input[value="${value}"]`);

        radio.parents().remove();

        return radio;
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
     * Disable the input
     *
     * @return {this}
     */
    disable() {
        super.disable();

        this.find('input').attr('disabled', 'disabled');

        return this;
    }

    /**
     * Enable the input
     *
     * @return {this}
     */
    enable() {
        super.enable();

        this.find('input').attr('disabled', null);

        return this;
    }

    /**
     * Toggle the readonly attribute of the input
     *
     * @param {Boolean} [readonly] Whether the input should be readonly, the current state is toggled if not provided
     * @return {this}
     */
    readonly(readonly){
        super.readonly(readonly);

        this.find('input').attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    }

}
