import Input from '../Input';

import {className} from '../../../../css/core/ui/input/Slider.scss';

/**
 * A slider input based on an HTML input[type=number] element
 */
export default class SliderInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Number} [value=0] The default value
     * @property {Number} [min=null] The minimum allowed value
     * @property {Number} [max=null] The maximum allowed value
     * @property {Number} [step=1] The spin up/down step amount
     * @property {Boolean} [spinButtons=true] Whether to show the spin buttons
     * @property {Integer} [initSpinDelay=200] The initial delay between each increment/decrement of the spin buttons
     * @property {Integer} [minSpinDelay=5] The min delay of the spin buttons
     * @property {Float} [spinDelayMultiplier=0.95] The value to multiply the delay of the spin buttons with
     * @property {String} [spinDirection='horizontal'] The direction of the spin buttons
     * @property {Boolean} [flipSpinButtons=false] Whether to flip the spin buttons
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`slider ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'value': 0,
            'min': null,
            'max': null,
            'step': 1,
            'vertical': false,
            'reversed': false,
            'triggerChangeOnDrag': false
        });
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.native_input.attr('type', 'range');

        this
            .toggleClass('vertical', this.configs.vertical)
            .toggleClass('reversed', this.configs.reversed);

        if(this.configs.triggerChangeOnDrag){
            this.native_input.addListener('input', this.onChange.bind(this));
        }
    }

    /**
     * Get the minimum allowed value
     *
     * @return {Number} The minimum allowed value
     */
    getMin(){
        return this.native_input.attr('min');
    }

    /**
     * Set the minimum allowed value
     *
     * @param {Number} value The minimum allowed value
     * @return {this}
     */
    setMin(value){
        this.native_input.attr('min', value);

        return this;
    }

    /**
     * Get the maximum allowed value
     *
     * @return {Number} The maximum allowed value
     */
    getMax(){
        return this.native_input.attr('max');
    }

    /**
     * Set the maximum allowed value
     *
     * @param {Number} value The maximum allowed value
     * @return {this}
     */
    setMax(value){
        this.native_input.attr('max', value);

        return this;
    }

    /**
     * Set the granularity of the slider
     *
     * @param {Number} value The step's value
     * @return {this}
     */
    setStep(value){
        this.native_input.attr('step', value);

        return this;
    }

    /**
     * Reset the input's configs
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    reset(supressEvent){
        this
            .setMin(this.configs.min)
            .setMax(this.configs.max);

        super.reset(supressEvent);

        return this;
    }

}
