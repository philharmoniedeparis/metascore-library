import Field from '../Field';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {decodeHTML} from '../../core/utils/String';
import {isArray} from '../../core/utils/Var';

import '../../../css/editor/field/Select.less';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 * @param {Mixed[]} [added] Newly added values
 * @param {Mixed[]} [removed] Removed values
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
            'multiple': false,
            'multiLabel': Locale.t('editor.field.Select.multiple.label', '(!count selected)')
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

        this.input_wrapper.addListener('click', this.onWrapperClick.bind(this));

        this.input
            .attr('readonly', true)
            .addListener('click', this.onInputClick.bind(this));

        this.menu = new Dom('<ul/>', {'class': 'menu', 'tabindex': 1})
            .addDelegate('li', 'click', this.onItemClick.bind(this))
            .addListener('blur', this.onBlur.bind(this), true)
            .appendTo(this.input_wrapper);

        this.configs.options.forEach((option) => {
            this.addOption(option.value, option.text);
        });

        if(this.configs.multiple){
            this.addClass('multiple');
            this.value = [];
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
    }

    addValue(value, supressEvent){
        const options = this.menu.find(`.option[data-value="${value}"]`);

        if(options.count() > 0){
            options.addClass('selected');
            this.updateValue(supressEvent);
        }
    }

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
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
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
                    this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value, 'added': added, 'removed': removed}, true, false);
                }
            }

        }
        else{
            const value = count > 0 ? options.data('value') : '';

            if(this.value !== value){
                this.value = value;
                this.input.val(count > 0 ? decodeHTML(options.text()) : '');

                if(supressEvent !== true){
                    this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
                }
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
    addGroup(label, parent){
        return new Dom('<li/>', {'text': label, 'title': label, 'class': 'group'})
            .append(new Dom('<ul/>'))
            .appendTo(parent ? parent.child('ul') : this.menu);
    }

    /**
     * Add an option to the select list
     *
     * @method addOption
     * @param {String} value The option's value
     * @param {String} label The option's label
     * @param {Dom} [parent] A group to append the option to, it will be appended to the root list if not specified
     * @return {Dom} The created Dom object
     */
    addOption(value, label, parent){
        return new Dom('<li/>', {'text': label, 'title': label, 'class': 'option'})
            .data('value', value)
            .appendTo(parent ? parent.child('ul') : this.menu);
    }

    getOption(value){
        return this.menu.find(`li.option[data-value="${value}"]`);
    }

    getOptions(parent){
        return (parent ? parent : this.menu).find('li.option');
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
