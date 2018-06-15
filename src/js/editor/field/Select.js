import Field from '../Field';
import Dom from '../../core/Dom';
import {uuid, decodeHTML} from '../../core/utils/String';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

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
            .addListener('click', this.onWrapperClick.bind(this))
            .appendTo(this);

        this.input = new Dom('<input/>', {'id': uid, 'readonly': true})
            .addListener('click', this.onInputClick.bind(this))
            .appendTo(this.input_wrapper);

        this.menu = new Dom('<ul/>', {'class': 'menu', 'tabindex': 1})
            .addListener('blur', this.onBlur.bind(this), true)
            .addDelegate('li', 'click', this.onItemClick.bind(this))
            .appendTo(this.input_wrapper);

        this.configs.options.forEach((option) => {
            this.addOption(option.value, option.text);
        });

        if(this.configs.multiple){
            this.addClass('multiple');
        }
    }

    onWrapperClick(){
        this.close();
    }

    onInputClick(evt){
        this.open();
        evt.stopPropagation();
    }

    onBlur(){
        this.close();
    }

    onItemClick(evt){
        const li = new Dom(evt.target),
            value = li.data('value');

        this.setValue(value);

        this.close();
    }

    open(){
        this.addClass('open');
        this.menu.focus(false);
        return this;
    }

    close(){
        this.removeClass('open');
        return this;
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
        const option = this.getOption(value);
        let label;

        this.menu.find('.option').removeClass('selected');

        if(option.count() > 0){
            label = decodeHTML(option.text());
            option.addClass('selected');
        }
        else{
            value = '';
            label = '';
        }

        if(value !== this.value){
            this.value = value;

            this.input.val(label);

            if(supressEvent !== true){
                this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
            }
        }

        return this;
    }

    /**
     * Adds an option group to the select list
     *
     * @method addGroup
     * @param {String} label The group's text label
     * @return {Dom} The created Dom object
     */
    addGroup(label){
        const group = new Dom('<li/>', {'class': 'group', 'text': label});
        group.append(new Dom('<ul/>'));

        this.menu.append(group);

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
        const option = new Dom('<li/>', {'text': text, 'class': 'option'});

        option.data('value', value);
        option.appendTo(group ? group.child('ul') : this.menu);

        return option;
    }

    getOption(value){
        return this.menu.find(`li.option[data-value="${value}"]`);
    }

    getOptions(group){
        return (group ? group : this.menu).find('li.option');
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
        const option = this.getOption(value);

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
        const option = this.getOption(value);

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
        this.menu.empty();

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
        this.is_readonly = readonly === true;

        this.toggleClass('readonly', this.is_readonly);

        return this;
    }

}
