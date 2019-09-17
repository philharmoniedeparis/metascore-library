import Dom from '../Dom';

import {className} from '../../../css/core/ui/Button.scss';

/**
 * A simple button based on an HTML button element
 */
export default class Button extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [label=null] A text to add as a label
     * @property {String} [icon=null] An icon class to use
     */
    constructor(configs) {
        // call the super constructor.
        super('<button/>', {'class': `${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        if(this.configs.label){
            this.setLabel(this.configs.label);
        }
        if(this.configs.icon){
            this.setIcon(this.configs.icon);
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
     * @param {String} text The text to use as the label
     * @return {this}
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
     * Set the button's icon
     *
     * @param {String} name The icons's name
     * @return {this}
     */
    setIcon(name){
        if(typeof this.icon === "undefined"){
            /**
             * An eventual label
             * @type {Dom}
             */
            this.icon = new Dom('<i/>', {'class': `icon`})
                .appendTo(this);
        }
        else{
            this.icon.removeClass(`icon-${this._icon_class}`);
        }

        this.icon.addClass(`icon-${name}`);
        this._icon_class = name;

        return this;
    }

    /**
     * Disable the button
     *
     * @return {this}
     */
    disable() {
        this.attr('disabled', '');

        return this;
    }

    /**
     * Enable the button
     *
     * @return {this}
     */
    enable() {
        this.attr('disabled', null);

        return this;
    }

}
