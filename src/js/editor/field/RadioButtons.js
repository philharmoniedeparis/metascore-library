import Field from '../Field';
import Dom from '../../core/Dom';
import {uuid} from '../../core/utils/String';

import '../../../css/editor/field/RadioButtons.less';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

export default class RadioButtons extends Field {

    /**
     * A select list field based on an HTML select element
     *
     * @class RadioButtonsField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.options=[]] A list of select options as objects with 'value' and 'text' keys
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('radiobuttonsfield');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'options': [],
            'name': `radiobuttons-${uuid(5)}`
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
            this.label = new Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.configs.options.forEach((option) => {
            this.addRadioButton(option.value, option.text);
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

        this.value = null;

        const radiobutton = this.input_wrapper.find('input:checked');
        if(radiobutton){
            this.value = radiobutton.val();
        }

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
        this.value = null;

        this.input_wrapper.find('input').forEach((radiobutton_el) => {
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
            this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
        }

        return this;
    }

    /**
     * Add a radio button
     *
     * @method addRadioButton
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @return {Dom} The created Dom object
     */
    addRadioButton(value, text){
        const uid = `radiobutton-${uuid(5)}`;

        const radio_wrapper = new Dom('<div/>', {'class': 'radiobutton-wrapper'})
            .appendTo(this.input_wrapper);

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
     * @method removeCheckbox
     * @param {String} value The value of the option to remove
     * @return {Dom} The checkbox's Dom object
     */
    removeRadioButton(value){
        const radiobutton = this.input_wrapper.find(`input[value="${value}"]`);

        radiobutton.parents().remove();

        return radiobutton;
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
