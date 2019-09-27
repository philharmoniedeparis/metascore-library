import Input from '../Input';
import Dom from '../../Dom';
import Button from '../Button';
import {isNumeric, isFunction} from '../../utils/Var';
import {getDecimalPlaces} from '../../utils/Number';

import {className} from '../../../../css/core/ui/input/Number.scss';

/**
 * A number field based on an HTML input[type=number] element
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
export default class NumberInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Number} [value=0] The default value
     * @property {Number} [min=null] The minimum allowed value
     * @property {Number} [max=null] The maximum allowed value
     * @property {Number} [step=1] The spin up/down step amount
     * @property {Boolean} [spinButtons=true] Whether to show the spin buttons
     * @property {Integer} [initSpinDelay=500] The delay between the first increment/decrement and the second one
     * @property {Integer} [spinDelay=40] The delay between each increment/decrement of the spin buttons
     * @property {Boolean|Function} [spinIncremental=true] Defines whether the steps taken when holding down a spin button increases, and how
     * @property {String} [spinDirection='horizontal'] The direction of the spin buttons
     * @property {Boolean} [flipSpinButtons=false] Whether to flip the spin buttons
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

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
            'initSpinDelay': 500,
            'spinDelay': 40,
            'spinIncremental': true,
            'spinDirection': 'horizontal',
            'flipSpinButtons': false
        });
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.native_input
            .addListener('input', this.onInput.bind(this))
            .addListener('keydown', this.onKeyDown.bind(this))
            .addListener('keyup', this.onKeyUp.bind(this))
            .addListener('mousewheel', this.onMouseWheel.bind(this))
            .addListener('DOMMouseScroll', this.onMouseWheel.bind(this));

        if(this.configs.spinButtons){
            const buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(this);

            if(this.configs.flipSpinButtons){
                buttons.addClass('flip');
            }

            /**
             * The spin down button
             * @type {Button}
             */
            this.spindown_btn = new Button({'icon': this.configs.spinDirection === 'vertical' ? 'spinner-left' : 'spinner-down'})
                .data('action', 'spin')
                .data('direction', 'down')
                .addListener('mousedown', this.onSpinBtnMouseDown.bind(this))
                .addListener('mouseup', this.onSpinBtnMouseUp.bind(this))
                .addListener('mouseout', this.onSpinBtnMouseOut.bind(this))
                .appendTo(buttons);

            /**
             * The spin up button
             * @type {Button}
             */
            this.spinup_btn = new Button({'icon': this.configs.spinDirection === 'vertical' ? 'spinner-right' : 'spinner-up'})
                .data('action', 'spin')
                .data('direction', 'up')
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
     * @private
     */
    onChange(){
        if(this.dirty){
            delete this.dirty;
            this.setValue(this.native_input.val(), true);
        }

        this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
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
     * @private
     * @param {Event} evt The event object
     */
    onKeyDown(evt){
        switch(evt.key){
            case "ArrowUp":
                this.spin('up', false);
                evt.preventDefault();
                break;

            case "ArrowDown":
                this.spin('down', false);
                evt.preventDefault();
                break;
        }
    }

    /**
     * The keyup event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeyUp(evt){
        switch(evt.key){
            case "ArrowUp":
            case "ArrowDown":
                delete this.spin_count;
                break;
        }
    }

    /**
     * The keypress event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeypress(evt){
        if(isNumeric(evt.key) || ((evt.key === '.') && this.configs.step < 1) || (evt.key === "Enter")){
            // do nothing, to allow the triggering of the input event
            return;
        }

        evt.preventDefault();
    }

    /**
     * The mousewheel event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseWheel(evt){
        if(this.native_input.is(':focus')){
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
     * @private
     * @param {Event} evt The event object
     */
    onSpinBtnMouseDown(evt){
        if(this.disabled){
            return;
        }

        const direction = Dom.data(evt.target, 'direction');
        this.spin(direction);
    }

    /**
     * The spin button's mouseup event handler
     *
     * @private
     */
    onSpinBtnMouseUp(){
        clearTimeout(this.timeout);
        delete this.timeout;
        delete this.spin_count;
    }

    /**
     * The spin button's mouseout event handler
     *
     * @private
     */
    onSpinBtnMouseOut(){
        clearTimeout(this.timeout);
        delete this.timeout;
        delete this.spin_count;
    }

    /**
     * Increment or decrement the value by one step
     *
     * @private
     */
    spin(direction, loop) {
        const step = this.configs.step * this.getSpinIncrement();
        const decimals = getDecimalPlaces(step);
        let value = this.getValue() + step * (direction === 'down' ? -1 : 1);

        // work around the well-known floating point issue
        value = parseFloat(value.toFixed(decimals));

        this.setValue(value);

        if(loop !== false){
            const delay = this.spin_count === 1 ? this.configs.initSpinDelay : this.configs.spinDelay;

            this.timeout = setTimeout(() => {
                this.spin(direction, loop);
            }, delay);
        }
    }

    getSpinIncrement(){

        /**
         * The current spin count
         * @type {Number}
         */
        if(!this.spin_count){
            this.spin_count = 0;
        }

        this.spin_count++;

        if(this.configs.spinIncremental && this.spin_count > 1){
            if(isFunction(this.configs.spinIncremental)){
                return this.configs.spinIncremental(this.spin_count);
            }

            return Math.ceil(this.spin_count * 0.4);
        }

        return 1;
    }

    /**
     * Set the field's value
     *
     * @param {Number} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
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
     * @param {Number} value The minimum allowed value
     * @return {this}
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
     * @param {Number} value The maximum allowed value
     * @return {this}
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
