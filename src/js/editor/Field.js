import Dom from '../core/Dom';
import {uuid} from '../core/utils/String';

import {className} from '../../css/editor/Field.less';

/**
 * A generic field based on an HTML input element
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 * @emits {reset} Fired when the field is reset
 * @param {Object} field The field instance
 */
export default class Field extends Dom{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value=null] The default value
     * @property {Boolean} [required=false] Whether the field is required
     * @property {Boolean} [disabled=false] Whether the field is disabled by default
     * @property {Boolean} [readonly=false] Whether the field is readonly by default
     * @property {String} [description=''] A description to add to the field
     */
    constructor(configs) {
        // call the super constructor.
        super('<div/>', {'class': `field ${className}`, 'tabindex': -1});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        this.setupUI();

        if(this.input){
            if(this.configs.name){
                this.input.attr('name', this.configs.name);
            }

            if(this.configs.required){
                this.input.attr('required', '');
            }
        }

        if(this.configs.required){
            this.addClass('required');
        }

        if(this.configs.description){
            this.setDescription(this.configs.description);
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
            'required': false,
            'disabled': false,
            'readonly': false,
            'description': null
        };
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        const uid = `field-${uuid(5)}`;

        if(this.configs.label){
            /**
             * A potential <label> element
             * @type {Dom}
             */
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        /**
         * The input-wrapper container
         * @type {Dom}
         */
        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        /**
         * The <input> element
         * @type {Dom}
         */
        this.input = new Dom('<input/>', {'id': uid})
            .addListener('change', this.onChange.bind(this))
            .addListener('keypress', this.onKeypress.bind(this))
            .appendTo(this.input_wrapper);
    }

    /**
     * Set the description text
     *
     * @param {String} description The description text
     * @return {this}
     */
    setDescription(description){
        if(!('description' in this)){
            /**
             * A potential description container
             * @type {Dom}
             */
            this.description = new Dom('<div/>', {'class': 'description'})
                .appendTo(this.input_wrapper);
        }

        this.description.text(description);

        return this;
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
        this.value = this.input.val();

        this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
    }

    /**
     * The keypress event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeypress(evt){
        if(evt.key === "Enter") {
            this.input.triggerEvent('change');
        }
    }

    /**
     * Set the field's value
     *
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        this.input.val(value);
        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    }

    /**
     * Get the field's current value
     *
     * @return {Mixed} The value
     */
    getValue() {
        return this.value;
    }

    /**
     * Disable the field
     *
     * @return {this}
     */
    disable() {
        /**
         * Whether the field is disabled
         * @type {Boolean}
         */
        this.disabled = true;

        this.addClass('disabled');

        if(this.input){
            this.input.attr('disabled', 'disabled');
        }

        return this;
    }

    /**
     * Enable the field
     *
     * @return {this}
     */
    enable() {
        this.disabled = false;

        this.removeClass('disabled');

        if(this.input){
            this.input.attr('disabled', null);
        }

        return this;
    }

    /**
     * Toggle the field's readonly state
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

        this.toggleClass('readonly', this.is_readonly);

        if(this.input){
            this.input.attr('readonly', this.is_readonly ? "readonly" : null);
        }

        return this;
    }

    /**
     * Reset the field's configs
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
            this.triggerEvent('reset', {'field': this}, true, false);
        }

        return this;
    }

}
