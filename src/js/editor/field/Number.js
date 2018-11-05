import Field from '../Field';
import Dom from '../../core/Dom';
import {isNumeric} from '../../core/utils/Var';
import {getDecimalPlaces} from '../../core/utils/Number';

import {className} from '../../../css/editor/field/Number.less';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

/**
 * A number field based on an HTML input[type=number] element
 */
export default class Number extends Field {

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

        this.spinDown = this.spinDown.bind(this);
        this.spinUp = this.spinUp.bind(this);

        this.addClass(`number ${className}`);
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
            'spinButtons': true,
            'initSpinDelay': 200,
            'minSpinDelay': 5,
            'spinDelayMultiplier': 0.95,
            'spinDirection': 'horizontal',
            'flipSpinButtons': false
        });
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input
            .addListener('input', this.onInput.bind(this))
            .addListener('keydown', this.onKeyDown.bind(this))
            .addListener('mousewheel', this.onMouseWheel.bind(this))
            .addListener('DOMMouseScroll', this.onMouseWheel.bind(this));

        if(this.configs.spinButtons){
            const buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);

            if(this.configs.flipSpinButtons){
                buttons.addClass('flip');
            }

            /**
             * The spin down button
             * @type {Dom}
             */
            this.spindown_btn = new Dom('<button/>', {'text': '-', 'data-action': 'spin-down'})
                .addListener('mousedown', this.onSpinBtnMouseDown.bind(this))
                .addListener('mouseup', this.onSpinBtnMouseUp.bind(this))
                .addListener('mouseout', this.onSpinBtnMouseOut.bind(this))
                .appendTo(buttons);

            /**
             * The spin up button
             * @type {Dom}
             */
            this.spinup_btn = new Dom('<button/>', {'text': '+', 'data-action': 'spin-up'})
                .addListener('mousedown', this.onSpinBtnMouseDown.bind(this))
                .addListener('mouseup', this.onSpinBtnMouseUp.bind(this))
                .addListener('mouseout', this.onSpinBtnMouseOut.bind(this))
                .appendTo(buttons);
        }

        this.addClass(this.configs.spinDirection === 'vertical' ? 'vertical' : 'horizontal');
    }

    /**
     * The change event handler
     *
     * @method onChange
     * @private
     */
    onChange(){
        if(this.dirty){
            delete this.dirty;
            this.setValue(this.input.val());
        }

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    }

    /**
     * The input event handler
     *
     * @private
     */
    onInput(){
        /**
         * Whether an input occured but the current value has not yet been updated
         * @type {Boolean}
         */
        this.dirty = true;
    }

    /**
     * The keydown event handler
     *
     * @method onKeyDown
     * @private
     * @param {Event} evt The event object
     */
    onKeyDown(evt){
        switch(evt.key){
            case "ArrowUp":
                this.spinUp(false);
                evt.preventDefault();
                break;

            case "ArrowDown":
                this.spinDown(false);
                evt.preventDefault();
                break;
        }
    }

    /**
     * The keypress event handler
     *
     * @method onKeypress
     * @private
     * @param {Event} evt The event object
     */
    onKeypress(evt){
        if(isNumeric(evt.key) || ((evt.key === '.') && this.configs.step < 1) || (evt.key === "Enter")){
            return;
        }

        evt.preventDefault();
    }

    /**
     * The mousewheel event handler
     *
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    onMouseWheel(evt){
        if(this.input.is(':focus')){
            const delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
            const decimals = getDecimalPlaces(this.configs.step);
            let value = this.getValue() + (this.configs.step * delta);

            // work around the well-known floating point issue
            value = parseFloat(value.toFixed(decimals));

            this.setValue(value);

            evt.preventDefault();
        }
    }

    /**
     * The spin button's mousedown event handler
     *
     * @method onSpinBtnMouseDown
     * @private
     * @param {Event} evt The event object
     */
    onSpinBtnMouseDown(evt){
        if(this.disabled){
            return;
        }

        /**
         * The current spin button delay
         * @type {Number}
         */
        this.spin_delay = this.configs.initSpinDelay;

        switch(Dom.data(evt.target, 'action')){
            case 'spin-down':
                this.spinDown();
                break;

            default:
                this.spinUp();
        }
    }

    /**
     * The spin button's mouseup event handler
     *
     * @method onSpinBtnMouseUp
     * @private
     */
    onSpinBtnMouseUp(){
        delete this.spin_delay;
        clearTimeout(this.timeout);
    }

    /**
     * The spin button's mouseout event handler
     *
     * @method onSpinBtnMouseOut
     * @private
     */
    onSpinBtnMouseOut(){
        delete this.spin_delay;
        clearTimeout(this.timeout);
    }

    /**
     * Decrement the value by one step
     *
     * @method spinDown
     * @private
     */
    spinDown(loop) {
        let value = this.getValue() - this.configs.step;
        const decimals = getDecimalPlaces(this.configs.step);

        // work around the well-known floating point issue
        value = parseFloat(value.toFixed(decimals));

        this.setValue(value);

        if(loop !== false){
            if(this.spin_delay > this.configs.minSpinDelay){
                this.spin_delay *= this.configs.spinDelayMultiplier;
            }

            /**
             * The spin timer id
             * @type {Number}
             */
            this.timeout = setTimeout(this.spinDown, this.spin_delay);
        }
    }

    /**
     * Increment the value by one step
     *
     * @method spinUp
     * @private
     */
    spinUp(loop) {
        let value = this.getValue() + this.configs.step;
        const decimals = getDecimalPlaces(this.configs.step);

        // work around the well-known floating point issue
        value = parseFloat(value.toFixed(decimals));

        this.setValue(value);

        if(loop !== false){
            if(this.spin_delay > this.configs.minSpinDelay){
                this.spin_delay *= this.configs.spinDelayMultiplier;
            }
            this.timeout = setTimeout(this.spinUp, this.spin_delay);
        }
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Number} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        let val = parseFloat(value);

        if(isNaN(val)){
            val = 0;
        }

        if(this.min !== null){
            val = Math.max(val, this.min);
        }
        if(this.max !== null){
            val = Math.min(val, this.max);
        }

        super.setValue(val, supressEvent);

        return this;
    }

    /**
     * Set the minimum allowed value
     *
     * @method setMin
     * @param {Number} value The minimum allowed value
     * @chainable
     */
    setMin(value){
        /**
         * The minimum allowed value
         * @type {Number}
         */
        this.min = value;

        return this;
    }

    /**
     * Set the maximum allowed value
     *
     * @method setMax
     * @param {Number} value The maximum allowed value
     * @chainable
     */
    setMax(value){
        /**
         * The maximum allowed value
         * @type {Number}
         */
        this.max = value;

        return this;
    }

    /**
     * Reset the field's configs
     *
     * @method reset
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    reset(supressEvent){
        this
            .setMin(this.configs.min)
            .setMax(this.configs.max);

        super.reset(supressEvent);

        return this;
    }

}
