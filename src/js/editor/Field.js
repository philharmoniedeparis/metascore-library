import Dom from '../core/Dom';

import {className} from '../../css/editor/Field.scss';

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
     * @property {Object} input The input configs
     * @property {String} [description=''] A description to add to the field
     */
    constructor(input, configs) {
        // call the super constructor.
        super('<div/>', {'class': `field ${className}`, 'tabindex': -1});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        /**
         * The input
         * @type {Input}
         */
        this.input = input;

        if(this.configs.label){
            this.setLabelText(this.configs.label);
        }

        /**
         * The input
         * @type {Input}
         */
        this.input
            .addListener('valuechange', this.onInputValueChange.bind(this))
            .appendTo(this);

        if(this.configs.description){
            this.setDescriptionText(this.configs.description);
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'label': null,
            'description': null
        };
    }

    /**
     * Input valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onInputValueChange(evt){
        const detail = Object.assign({}, evt.detail, {'field': this});
        this.triggerEvent('valuechange', detail, true, false);
        evt.stopPropagation();
    }

    /**
     * Get the label element
     *
     * @return {Dom}
     */
    getLabel(){
        return this.label;
    }

    /**
     * Set the label text
     *
     * @param {String} text The label text
     * @return {this}
     */
    setLabelText(text){
        if(!('label' in this)){
            const id = this.getInput().getId();
            /**
             * A potential <label> element
             * @type {Dom}
             */
            this.label = new Dom('<label/>', {'for': id})
                .appendTo(this);
        }

        this.label.text(text);

        return this;
    }

    /**
     * Get the description element
     *
     * @return {Dom}
     */
    getDescription(){
        return this.description;
    }

    /**
     * Set the description text
     *
     * @param {String} text The description text
     * @return {this}
     */
    setDescriptionText(text){
        if(!('description' in this)){
            /**
             * A potential description container
             * @type {Dom}
             */
            this.description = new Dom('<div/>', {'class': 'description'})
                .appendTo(this);
        }

        this.description.text(text);

        return this;
    }

    /**
     * Get the field's input
     *
     * @return {Input} The input
     */
    getInput() {
        return this.input;
    }

}
