import Input from '../Input';
import Icon from '../../ui/Icon';
import Dom from '../../Dom';

import arrow_icon from '../../../../img/core/ui/input/select/arrow.svg?sprite'
import {className} from '../../../../css/core/ui/input/Select.scss';

/**
 * A select list field based on an HTML select element
 */
export default class SelectInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [options={}] A list of select options
     * @property {Boolean} [multiple=false] Whether multiple options can be selected at once
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`select ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'options': {},
            'multiple': false
        });
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        const id = this.getId();

        /**
         * The <textarea> element
         * @type {Dom}
         */
        this.native_input = new Dom('<select/>', {'id': id})
            .addListener('change', this.onChange.bind(this))
            .appendTo(this);

        new Icon({'symbol': arrow_icon})
            .appendTo(this);

        if(this.configs.multiple){
            this.native_input.attr('multiple', '');
        }

        Object.entries(this.configs.options).forEach(([value, text]) => {
            this.addOption(value, text);
        });
    }

    /**
     * Adds an option group to the select list
     *
     * @param {String} label The group's text label
     * @param {Dom} [group] A parent group to append the group to, it will be appended to the select if not specified
     * @return {Dom} The new group
     */
    addGroup(label, group){
        return new Dom('<optgroup/>', {'label': label})
            .appendTo(group ? group : this.native_input);
    }

    /**
     * Add an option to the select list
     *
     * @param {String} value The option's value
     * @param {String} text The option's text
     * @param {Dom} [group] A group to append the option to, it will be appended to the select if not specified
     * @return {Dom} The new option
     */
    addOption(value, text, group){
        return new Dom('<option/>', {'text': text, 'value': value})
            .appendTo(group ? group : this.native_input);
    }

    /**
     * Get an option by value
     *
     * @param {String} value The option's value
     * @return {Dom} The corresponding option
     */
    getOption(value){
        return this.native_input.find(`option[value="${value}"]`);
    }

    /**
     * Get options from the select or a group
     *
     * @param {Dom} [parent] The parent group
     * @return {Dom} The options
     */
    getOptions(group){
        return (group ? group : this.native_input).find('option');
    }

    /**
     * Update an option's label by value
     *
     * @param {String} value The value of the option to update
     * @param {String} text The new label's text
     * @return {Dom} The option's Dom object
     */
    updateOption(value, text){
        const option = this.getOption(value);

        option.text(text);

        return option;
    }

    /**
     * Remove an option by value
     *
     * @param {String} value The value of the option to remove
     * @return {Dom} The option's Dom object
     */
    removeOption(value){
        const option = this.getOption(value);

        option.remove();

        return option;
    }

    /**
     * Remove all groups and options
     *
     * @return {this}
     */
    clear() {
        this.native_input.empty();

        return this;
    }

}
