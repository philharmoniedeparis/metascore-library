import Field from '../Field';
import Dom from '../../core/Dom';
import {getDecimalPlaces} from '../../core/utils/Number';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

export default class Number extends Field {

    /**
     * A number field based on an HTML input[type=number] element
     *
     * @class NumberField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=null] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     * @param {Number} [configs.step=1] The spin up/down step amount
     * @param {Boolean} [configs.spinButtons=true] Whether to show the spin buttons
     * @param {Integer} [configs.spinInterval=200] The speed of the spin buttons
     * @param {String} [configs.spinDirection='horizontal'] The direction of the spin buttons
     * @param {Boolean} [configs.flipSpinButtons=false] Whether to flip the spin buttons
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.spinDown = this.spinDown.bind(this);
        this.spinUp = this.spinUp.bind(this);

        this.addClass('numberfield');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'value': 0,
            'min': null,
            'max': null,
            'step': 1,
            'spinButtons': true,
            'spinInterval': 200,
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
        let buttons;

        super.setupUI();

        this.input
            .addListener('input', this.onInput.bind(this))
            .addListener('mousewheel', this.onMouseWheel.bind(this))
            .addListener('DOMMouseScroll', this.onMouseWheel.bind(this))
            .addListener('keydown', this.onKeyDown.bind(this));

        if(this.configs.spinButtons){
            buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);

            if(this.configs.flipSpinButtons){
                buttons.addClass('flip');
            }

            this.spindown_btn = new Dom('<button/>', {'text': '-', 'data-action': 'spin-down'})
                .addListener('mousedown', this.onSpinBtnMouseDown.bind(this))
                .addListener('mouseup', this.onSpinBtnMouseUp.bind(this))
                .addListener('mouseout', this.onSpinBtnMouseOut.bind(this))
                .appendTo(buttons);

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
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    }

    /**
     * The input event handler
     *
     * @method onInput
     * @private
     * @param {Event} evt The event object
     */
    onInput(evt){
        this.setValue(this.input.val());

        evt.stopPropagation();
    }

    /**
     * The mousewheel event handler
     *
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    onMouseWheel(evt){
        let delta, decimals, value;

        if(this.input.is(':focus')){
            delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));

            value = this.getValue() + (this.configs.step * delta);

            // work around the well-known floating point issue
            decimals = getDecimalPlaces(this.configs.step);
            value = parseFloat(value.toFixed(decimals));

            this.setValue(value);

            evt.preventDefault();
        }
    }

    /**
     * The keydown event handler
     *
     * @method onKeyDown
     * @private
     * @param {Event} evt The event object
     */
    onKeyDown(evt){
        switch(evt.keyCode){
            case 38:
                this.spinUp();
                evt.preventDefault();
                break;

            case 40:
                this.spinDown();
                evt.preventDefault();
                break;
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
        let fn;

        if(this.disabled){
            return;
        }

        switch(Dom.data(evt.target, 'action')){
            case 'spin-down':
                fn = this.spinDown;
                break;

            default:
                fn = this.spinUp;
        }

        fn();

        this.interval = setInterval(fn, this.configs.spinInterval);
    }

    /**
     * The spin button's mouseup event handler
     *
     * @method onSpinBtnMouseUp
     * @private
     */
    onSpinBtnMouseUp(){
        clearInterval(this.interval);
    }

    /**
     * The spin button's mouseout event handler
     *
     * @method onSpinBtnMouseOut
     * @private
     */
    onSpinBtnMouseOut(){
        clearInterval(this.interval);
    }

    /**
     * Decrement the value by one step
     *
     * @method spinDown
     * @private
     */
    spinDown() {
        let decimals, value;

        value = this.getValue() - this.configs.step;

        // work around the well-known floating point issue
        decimals = getDecimalPlaces(this.configs.step);
        value = parseFloat(value.toFixed(decimals));

        this.setValue(value);
    }

    /**
     * Increment the value by one step
     *
     * @method spinUp
     * @private
     */
    spinUp() {
        let decimals, value;

        value = this.getValue() + this.configs.step;

        // work around the well-known floating point issue
        decimals = getDecimalPlaces(this.configs.step);
        value = parseFloat(value.toFixed(decimals));

        this.setValue(value);
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
        value = parseFloat(value);

        if(isNaN(value)){
            value = 0;
        }

        if(this.min !== null){
            value = Math.max(value, this.min);
        }
        if(this.max !== null){
            value = Math.min(value, this.max);
        }

        super.setValue(value, supressEvent);

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
