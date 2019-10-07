import Input from '../Input';
import Icon from '../Icon';
import Dom from '../../Dom';

import check_icon from '../../../../img/core/ui/input/checkbox/check.svg?sprite';
import {className} from '../../../../css/core/ui/input/Checkbox.scss';

/**
 * A checkbox input based on an HTML input[type=checkbox] element
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
 * @param {Mixed} value The new value
 */
export default class CheckboxInput extends Input{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [label] An optional label text
     * @property {Boolean} [checked=false] Whether the input is checked by default
     * @property {Boolean} [checked_value=true] The value when checked
     * @property {Boolean} [unchecked_value=false] The value when unchecked
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`checkbox ${className}`);

        this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'label': null,
            'icon': check_icon,
            'checked': false,
            'checked_value': true,
            'unchecked_value': false
        });
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.native_input
            .attr('type', 'checkbox')
            .addListener('click', this.onClick.bind(this));

        const state = new Dom('<div/>', {'class': 'state'})
            .appendTo(this);

        new Dom('<label/>', {'for': this.getId(), 'text': this.configs.label})
            .appendTo(state);

        if(this.configs.icon){
            this.icon = new Icon({'symbol': this.configs.icon})
                .appendTo(state);
        }
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

        if(this.native_input.is(":checked")){
            /**
             * The current value
             * @type {String}
             */
            this.value = this.configs.checked_value;
            this.addClass('checked');
        }
        else{
            this.value = this.configs.unchecked_value;
            this.removeClass('checked');
        }

        this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
    }

    /**
     * Set the input's value
     *
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        this.native_input.get(0).checked = value === this.configs.checked_value;

        if(supressEvent !== true){
            this.native_input.triggerEvent('change');
        }

        return this;
    }

}
