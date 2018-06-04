import {Field} from '../Field';
import {Dom} from '../../core/Dom';
import {Locale} from '../../core/Locale';
import {_Function} from '../../core/utils/Function';
import {_String} from '../../core/utils/String';
import {_Number} from '../../core/utils/Number';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
var EVT_VALUECHANGE = 'valuechange';

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
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super(this.configs);
        
        this.spinDown = _Function.proxy(this.spinDown, this);
        this.spinUp = _Function.proxy(this.spinUp, this);

        this.addClass('numberfield');
    }

    NumberField.defaults = {
        'value': 0,
        'min': null,
        'max': null,
        'step': 1,
        'spinButtons': true,
        'spinInterval': 200,
        'spinDirection': 'horizontal',
        'flipSpinButtons': false
    };

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        var uid = 'field-'+ _String.uuid(5),
            buttons;

        if(this.configs.label){
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new Dom('<input/>', {'type': 'text', 'id': uid})
            .addListener('input', _Function.proxy(this.onInput, this))
            .addListener('mousewheel', _Function.proxy(this.onMouseWheel, this))
            .addListener('DOMMouseScroll', _Function.proxy(this.onMouseWheel, this))
            .addListener('keydown', _Function.proxy(this.onKeyDown, this))
            .appendTo(this.input_wrapper);

        if(this.configs.spinButtons){
            buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);
                
            if(this.configs.flipSpinButtons){
                buttons.addClass('flip');
            }
                
            this.spindown_btn = new Dom('<button/>', {'text': '-', 'data-action': 'spin-down'})
                .addListener('mousedown', _Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', _Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', _Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
                
            this.spinup_btn = new Dom('<button/>', {'text': '+', 'data-action': 'spin-up'})
                .addListener('mousedown', _Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', _Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', _Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
        }
        
        this.addClass(this.configs.spinDirection === 'vertical' ? 'vertical' : 'horizontal');

        this.addListener('change', _Function.proxy(this.onChange, this));
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    onChange(evt){
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

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
    };

    /**
     * The mousewheel event handler
     * 
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    onMouseWheel(evt){
        var delta, decimals, value;
        
        if(this.input.is(':focus')){
            delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
            
            value = this.getValue() + (this.configs.step * delta);
            
            // work around the well-known floating point issue
            decimals = _Number.getDecimalPlaces(this.configs.step); 
            value = parseFloat(value.toFixed(decimals));
            
            this.setValue(value);
        
            evt.preventDefault();
        }
    };

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
    };

    /**
     * The spin button's mousedown event handler
     * 
     * @method onSpinBtnMouseDown
     * @private
     * @param {Event} evt The event object
     */
    onSpinBtnMouseDown(evt){
        var fn;
        
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
    };

    /**
     * The spin button's mouseup event handler
     * 
     * @method onSpinBtnMouseUp
     * @private
     * @param {Event} evt The event object
     */
    onSpinBtnMouseUp(evt){
        clearInterval(this.interval);
    };

    /**
     * The spin button's mouseout event handler
     * 
     * @method onSpinBtnMouseOut
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onSpinBtnMouseOut = NumberField.prototype.onSpinBtnMouseUp;

    /**
     * Decrement the value by one step
     * 
     * @method spinDown
     * @private
     */
    spinDown() {
        var decimals, value;
        
        value = this.getValue() - this.configs.step; 
        
        // work around the well-known floating point issue       
        decimals = _Number.getDecimalPlaces(this.configs.step);
        value = parseFloat(value.toFixed(decimals));
        
        this.setValue(value);
    };

    /**
     * Increment the value by one step
     * 
     * @method spinUp
     * @private
     */
    spinUp() {
        var decimals, value;
        
        value = this.getValue() + this.configs.step;
        
        // work around the well-known floating point issue
        decimals = _Number.getDecimalPlaces(this.configs.step);
        value = parseFloat(value.toFixed(decimals));
        
        this.setValue(value);
    };

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
        
        NumberField.parent.prototype.setValue.call(this, value, supressEvent);
        
        return this;
    };

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
    };

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
    };

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
        
        NumberField.parent.prototype.reset.call(this, supressEvent);

        return this;
    };
    
}