import Dom from '../Dom';
import {uuid} from '../utils/String';

import {className} from '../../../css/core/ui/Input.less';

/**
 * A generic input based on an HTML input element
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
 * @param {Mixed} value The new value
 * @emits {reset} Fired when the input is reset
 * @param {Object} input The input instance
 */
export default class Input extends Dom{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value=null] The default value
     * @property {String} [name] The input's name
     * @property {Boolean} [required=false] Whether the input is required
     * @property {Boolean} [disabled=false] Whether the input is disabled by default
     * @property {Boolean} [readonly=false] Whether the input is readonly by default
     */
    constructor(configs) {
        // call the super constructor.
        super('<div/>', {'class': `input ${className}`, 'tabindex': -1});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.id = `input-${uuid(5)}`;

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        this.setupUI();

        if(this.native_input){
            if(this.configs.name){
                this.native_input.attr('name', this.configs.name);
            }

            if(this.configs.required){
                this.native_input.attr('required', '');
            }
        }

        if(this.configs.required){
            this.addClass('required');
        }

        this.reset(true);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'value': null,
            'name': null,
            'required': false,
            'disabled': false,
            'readonly': false
        };
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        /**
         * The <input> element
         * @type {Dom}
         */
        this.native_input = new Dom('<input/>', {'id': this.getId()})
            .addListener('change', this.onChange.bind(this))
            .addListener('keypress', this.onKeypress.bind(this))
            .appendTo(this);
    }

    getId(){
        return this.id;
    }

    /**
    * Get the input's type
    *
    * @return {String} The input type
    */
    getType(){
        return this.constructor.name;
    }

    getName(){
        return this.configs.name;
    }

    /**
     * The change event handler
     *
     * @private
     */
    onChange(){
        /**
         * The current value
         * @type {String}
         */
        this.value = this.native_input.val();

        this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
    }

    /**
     * The keypress event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeypress(evt){
        if(evt.key === "Enter") {
            this.native_input.triggerEvent('change');
        }
    }

    /**
     * Set the input's value
     *
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        this.native_input.val(value);
        this.value = value;

        if(supressEvent !== true){
            this.native_input.triggerEvent('change');
        }

        return this;
    }

    /**
     * Get the input's current value
     *
     * @return {Mixed} The value
     */
    getValue() {
        return this.value;
    }

    /**
     * Disable the input
     *
     * @return {this}
     */
    disable() {
        /**
         * Whether the input is disabled
         * @type {Boolean}
         */
        this.disabled = true;

        this.addClass('disabled');

        if(this.native_input){
            this.native_input.attr('disabled', 'disabled');
        }

        return this;
    }

    /**
     * Enable the input
     *
     * @return {this}
     */
    enable() {
        this.disabled = false;

        this.removeClass('disabled');

        if(this.native_input){
            this.native_input.attr('disabled', null);
        }

        return this;
    }

    /**
     * Toggle the input's readonly state
     *
     * @param {Boolean} [readonly] Whether the input should be readonly, the current state is toggled if not provided
     * @return {this}
     */
    readonly(readonly){
        /**
         * Whether the input is in a readonly state
         * @type {Boolean}
         */
        this.is_readonly = readonly === true;

        this.toggleClass('readonly', this.is_readonly);

        if(this.native_input){
            this.native_input.attr('readonly', this.is_readonly ? "readonly" : null);
        }

        return this;
    }

    /**
     * Reset the input's configs
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    reset(supressEvent){
        this.setValue(this.configs.value);

        if(this.configs.disabled){
            this.disable();
        }
        else{
            this.enable();
        }

        this.readonly(this.configs.readonly);

        if(supressEvent !== true){
            this.triggerEvent('reset', {'input': this}, true, false);
        }

        return this;
    }

}
