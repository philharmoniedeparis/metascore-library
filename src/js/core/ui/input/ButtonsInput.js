import Input from '../Input';
import Button from '../Button';

/**
 * A simple buttons input based on HTML button elements
 *
 * @emits {valuechange} Fired when a value is selected though a button click
 * @param {Object} input The input instance
 * @param {Mixed} value The clicked button's key
 */
export default class ButtonsInput extends Input{

    static defaults = Object.assign({}, super.defaults, {
        'buttons': {}
    });

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [buttons={}}] The list of buttons as name/attributes pairs
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('buttons');
    }

    /**
     * @inheritdoc
     */
    setupUI() {
        /**
         * The list of buttons
         * @type {Object}
         */
        this.buttons = {};

        if(this.configs.buttons){
            Object.entries(this.configs.buttons).forEach(([name, configs]) => {
                this.buttons[name] = new Button(configs)
                    .addListener('click', () => {
                        this.triggerEvent('valuechange', {'input': this, 'value': name}, true, false);
                    })
                    .appendTo(this);
            });
        }
    }

    /**
     * Set the input's value
     *
     * @return {this}
     */
    setValue() {
        return this;
    }

    /**
     * Get the list of buttons
     *
     * @return {Object} The list of buttons as a name/Dom pair
     */
    getButtons() {
        return this.buttons;
    }

    /**
     * Get a button by name
     *
     * @param {String} name The button's name
     * @return {Dom} The button's Dom object
     */
    getButton(name){
        return this.buttons[name];
    }

}
