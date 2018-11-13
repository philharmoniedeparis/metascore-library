import Field from '../Field';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {decodeHTML} from '../../core/utils/String';
import {isArray} from '../../core/utils/Var';

import {className} from '../../../css/editor/field/Select.less';

/**
 * A select list field based on an HTML select element
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 * @param {Mixed[]} [added] Newly added values
 * @param {Mixed[]} [removed] Removed values
 */
export default class Select extends Field {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [options=[]] A list of select options as objects with 'value' and 'text' keys
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
            'options': [],
            'multiple': false,
            'multiLabel': Locale.t('editor.field.Select.multiple.label', '(!count selected)')
        });
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input_wrapper.addListener('click', this.onWrapperClick.bind(this));

        this.input.addListener('keypress', this.onInputKeypress.bind(this));

        /**
         * The top <ul> element
         * @type {Dom}
         */
        this.menu = new Dom('<ul/>', {'class': 'menu', 'tabindex': 1})
            .addDelegate('li', 'click', this.onItemClick.bind(this))
            .addListener('blur', this.onBlur.bind(this), true)
            .appendTo(this.input_wrapper);

        this.configs.options.forEach((option) => {
            this.addOption(option.value, option.text);
        });

        if(this.configs.multiple){
            /**
             * The current value
             * @type {Array}
             */
            this.value = [];

            this.addClass('multiple');
        }
    }

    /**
     * The wrapper click event handler
     *
     * @private
     */
    onWrapperClick(){
        this.open();
    }

    /**
     * The input keypress event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onInputKeypress(evt){
        evt.preventDefault();
    }

    /**
     * The blur event handler
     *
     * @private
     */
    onBlur(){
        this.close();
    }

    /**
     * The item click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onItemClick(evt){
        const li = new Dom(evt.target);

        if(li.hasClass('group')){
            evt.stopImmediatePropagation();
            evt.preventDefault();
            return;
        }

        if(evt.shiftKey && this.configs.multiple){
            li.toggleClass('selected');
        }
        else{
            this.menu.find('.option').removeClass('selected');
            li.addClass('selected');
        }

        this.updateValue();

        this.close();

        evt.stopPropagation();
    }

    /**
     * Add a value to the selected ones
     *
     * @param {String} value The value to add
     * @param {Boolean} [supressEvent=false] Whether to supress the valuechange event
     */
    addValue(value, supressEvent){
        const options = this.menu.find(`.option[data-value="${value}"]`);

        if(options.count() > 0){
            options.addClass('selected');
            this.updateValue(supressEvent);
        }
    }

    /**
     * Remove a value to the selected ones
     *
     * @param {String} value The value to add
     * @param {Boolean} [supressEvent=false] Whether to supress the valuechange event
     */
    removeValue(value, supressEvent){
        const options = this.menu.find(`.option[data-value="${value}"]`);

        if(options.count() > 0){
            options.removeClass('selected');
            this.updateValue(supressEvent);
        }
    }

    /**
     * Set the field's value
     *
     * @param {Mixed} value The new value
     * @param {Boolean} [supressEvent=false] Whether to supress the valuechange event
     * @return {this}
     */
    setValue(value, supressEvent){
        const options = this.menu.find('.option');

        options.removeClass('selected');

        if(this.configs.multiple){
            if(isArray(value)){
                options.filter(`[data-value="${value.join('"], [data-value="')}"]`)
                    .addClass('selected');
            }
            else{
                options.filter(`[data-value="${value}"]`)
                    .addClass('selected');
            }
        }
        else{
            options.filter(`[data-value="${value}"]`)
                .addClass('selected');
        }

        this.updateValue(supressEvent);

        return this;
    }

    /**
     * Update the field's value
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the valuechange event
     * @return {this}
     */
    updateValue(supressEvent){
        const options = this.menu.find('.option.selected');
        const count = options.count();
        const added = [];
        const removed = [];

        if(this.configs.multiple){
            const value = [];
            options.forEach((option) => {
                value.push(Dom.data(option, 'value'));
            });

            value.forEach((val) => {
                if(!this.value.includes(val)){
                    added.push(val);
                }
            });
            this.value.forEach((val) => {
                if(!value.includes(val)){
                    removed.push(val);
                }
            });

            if(added.length > 0 || removed.length > 0){
                this.value = value;

                if(count > 1){
                    this.input.val(Locale.formatString(this.configs.multiLabel, {'!count': options.count()}));
                }
                else if(count > 0){
                    this.input.val(decodeHTML(options.text()));
                }
                else{
                    this.input.val('');
                }

                if(supressEvent !== true){
                    this.triggerEvent('valuechange', {'field': this, 'value': this.value, 'added': added, 'removed': removed}, true, false);
                }
            }

        }
        else{
            const value = count > 0 ? options.data('value') : '';

            if(this.value !== value){
                this.value = value;
                this.input.val(count > 0 ? decodeHTML(options.text()) : '');

                if(supressEvent !== true){
                    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
                }
            }
        }

        return this;
    }

    /**
     * Adds an option group to the select list
     *
     * @param {String} label The group's text label
     * @param {Dom} [parent] A parent group to append the group to, it will be appended to the root list if not specified
     * @return {Dom} The new group
     */
    addGroup(label, parent){
        return new Dom('<li/>', {'text': label, 'title': label, 'class': 'group'})
            .append(new Dom('<ul/>'))
            .appendTo(parent ? parent.child('ul') : this.menu);
    }

    /**
     * Add an option to the select list
     *
     * @param {String} value The option's value
     * @param {String} label The option's label
     * @param {Dom} [parent] A group to append the option to, it will be appended to the root list if not specified
     * @return {Dom} The new option
     */
    addOption(value, label, parent){
        return new Dom('<li/>', {'text': label, 'title': label, 'class': 'option'})
            .data('value', value)
            .appendTo(parent ? parent.child('ul') : this.menu);
    }

    /**
     * Get an option by value
     *
     * @param {String} value The option's value
     * @return {Dom} The corresponding option
     */
    getOption(value){
        return this.menu.find(`li.option[data-value="${value}"]`);
    }

    /**
     * Get options from the root list or a sub-list
     *
     * @param {Dom} [parent=this.menu] The parent list
     * @return {Dom} The options
     */
    getOptions(parent){
        return (parent ? parent : this.menu).find('li.option');
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
     * Show the options menu
     */
    open(){
        if(!this.is_readonly){
            this.addClass('open');
            this.menu.focus(false);
        }

        return this;
    }

    /**
     * Hide the options menu
     */
    close(){
        this.removeClass('open');
        return this;
    }

    /**
     * Remove all groups and options
     *
     * @return {this}
     */
    clear() {
        this.menu.empty();

        return this;
    }

    /**
     * Toggle the readonly attribute of the field
     *
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @return {this}
     */
    readonly(readonly){
        /**
         * Whether the field is in a readonly state
         * @type {Boolean}
         */
        this.is_readonly = readonly === true;

        this.input.attr('readonly', this.is_readonly ? true : null);

        this.toggleClass('readonly', this.is_readonly);

        return this;
    }

}
