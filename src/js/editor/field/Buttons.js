import Field from '../Field';
import Dom from '../../core/Dom';

/**
 * Fired when a value is selected though a button click
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The clicked button's key
 */
const EVT_VALUECHANGE = 'valuechange';

/**
 * A simple buttons field based on HTML button elements
 */
export default class Buttons extends Field{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [buttons={}}] The list of buttons as name/attributes pairs
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('buttonsfield');
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'buttons': {}
        });
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        const field = this;

        /**
         * The list of buttons
         * @type {Object}
         */
        this.buttons = {};

        if(this.configs.label){
            /**
             * A potential label
             * @type {Dom}
             */
            this.label = new Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }
        /**
         * The input-wrapper element
         * @type {Dom}
         */
        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        if(this.configs.buttons){
            Object.entries(this.configs.buttons).forEach(([name, attr]) => {
                this.buttons[name] = new Dom('<button/>', attr)
                    .addListener('click', () => {
                        field.triggerEvent(EVT_VALUECHANGE, {'field': field, 'value': name}, true, false);
                    })
                    .appendTo(this.input_wrapper);
            });
        }
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @chainable
     */
    setValue() {
        return this;
    }

    /**
     * Get the list of buttons
     *
     * @method getButtons
     * @return {Object} The list of buttons as a name/Dom pair
     */
    getButtons() {
        return this.buttons;
    }

    /**
     * Get a button by name
     *
     * @method getButton
     * @param {String} name The button's name
     * @return {Dom} The button's Dom object
     */
    getButton(name){
        return this.buttons[name];
    }

}
