import Dom from '../Dom';

/**
 * A simple button based on an HTML button element
 */
export default class Button extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.label=null] A text to add as a label
     */
    constructor(configs) {
        // call the super constructor.
        super('<button/>');

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        if(this.configs.label){
            this.setLabel(this.configs.label);
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'label': null
        };
    }

    /**
     * Set the button's text
     *
     * @method setLabel
     * @param {String} text The text to use as the label
     * @chainable
     */
    setLabel(text){
        if(typeof this.label === "undefined"){
            /**
             * An eventual label
             * @type {Dom}
             */
            this.label = new Dom('<span/>', {'class': 'label'})
                .appendTo(this);
        }

        this.label.text(text);

        return this;
    }

    /**
     * Disable the button
     *
     * @method disable
     * @chainable
     */
    disable() {
        this.attr('disabled', '');

        return this;
    }

    /**
     * Enable the button
     *
     * @method enable
     * @chainable
     */
    enable() {
        this.attr('disabled', null);

        return this;
    }

}
