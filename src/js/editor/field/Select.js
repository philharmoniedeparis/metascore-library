import {Field} from '../Field';
import {Dom} from '../../core/Dom';
import {_Function} from '../../core/utils/Function';
import {_String} from '../../core/utils/String';
import {_Array} from '../../core/utils/Array';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
var EVT_VALUECHANGE = 'valuechange';

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
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super(this.configs);

        this.addClass('selectfield');
    }

    SelectField.defaults = {
        'options': [],
        'multiple': false
    };

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        var uid = 'field-'+ _String.uuid(5);

        if(this.configs.label){
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new Dom('<select/>', {'id': uid})
            .addListener('change', _Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);

        _Array.each(this.configs.options, function(index, option){
            this.addOption(option.value, option.text);
        }, this);
        
        if(this.configs.multiple){
            this.input.attr('multiple', 'multiple');
        }
    };

    /**
     * Adds an option group to the select list
     * 
     * @method addGroup
     * @param {String} label The group's text label
     * @return {Dom} The created Dom object
     */
    addGroup(label){
        var group = new Dom('<optgroup/>', {'label': label});

        this.input.append(group);

        return group;
    };

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
        var option = new Dom('<option/>', {'value': value, 'text': text});

        option.appendTo(group ? group : this.input);

        return option;
    };

    /**
     * Update an option's label by value
     * 
     * @method updateOption
     * @param {String} value The value of the option to update
     * @param {String} text The new label's text
     * @return {Dom} The option's Dom object
     */
    updateOption(value, text){
        var option = this.input.find('option[value="'+ value +'"]');

        option.text(text);

        return option;
    };

    /**
     * Remove an option by value
     * 
     * @method removeOption
     * @param {String} value The value of the option to remove
     * @return {Dom} The option's Dom object
     */
    removeOption(value){
        var option = this.input.find('option[value="'+ value +'"]');

        option.remove();

        return option;
    };

    /**
     * Remove all groups and options
     * 
     * @method clear
     * @chainable
     */
    clear() {
        this.input.empty();

        return this;
    };

    /**
     * Toggle the readonly attribute of the field
     * 
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    readonly(readonly){
        SelectField.parent.prototype.readonly.apply(this, arguments);

        this.input.attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    };
    
}