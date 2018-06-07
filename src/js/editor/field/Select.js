import Field from '../Field';
import Dom from '../../core/Dom';
import {uuid} from '../../core/utils/String';

export default class Select extends Field {

    /**
     * A select list field based on an HTML select element
     *
     * @class SelectField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.options=[]] A list of select options as objects with 'value' and 'text' keys
     * @param {Boolean} [configs.multiple=false] Whether multiple options can be selected at once
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('selectfield');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'options': [],
            'multiple': false
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

        this.input = new Dom('<select/>', {'id': uid})
            .addListener('change', this.onChange.bind(this))
            .appendTo(this.input_wrapper);

        this.configs.options.forEach((option) => {
            this.addOption(option.value, option.text);
        });

        if(this.configs.multiple){
            this.input.attr('multiple', 'multiple');
        }
    }

    /**
     * Adds an option group to the select list
     *
     * @method addGroup
     * @param {String} label The group's text label
     * @return {Dom} The created Dom object
     */
    addGroup(label){
        const group = new Dom('<optgroup/>', {'label': label});

        this.input.append(group);

        return group;
    }

    /**
     * Add an option to the select list
     *
     * @method addOption
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @param {Dom} [group] The group to append the option to, it will be appended to the root list if not specified
     * @return {Dom} The created Dom object
     */
    addOption(value, text, group){
        const option = new Dom('<option/>', {'value': value, 'text': text});

        option.appendTo(group ? group : this.input);

        return option;
    }

    /**
     * Update an option's label by value
     *
     * @method updateOption
     * @param {String} value The value of the option to update
     * @param {String} text The new label's text
     * @return {Dom} The option's Dom object
     */
    updateOption(value, text){
        const option = this.input.find(`option[value="${value}"]`);

        option.text(text);

        return option;
    }

    /**
     * Remove an option by value
     *
     * @method removeOption
     * @param {String} value The value of the option to remove
     * @return {Dom} The option's Dom object
     */
    removeOption(value){
        const option = this.input.find(`option[value="${value}"]`);

        option.remove();

        return option;
    }

    /**
     * Remove all groups and options
     *
     * @method clear
     * @chainable
     */
    clear() {
        this.input.empty();

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

        this.input.attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    }

}
