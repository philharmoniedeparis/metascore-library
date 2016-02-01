/**
 * @module Editor
 */

metaScore.namespace('editor.field').Number = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

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
    function NumberField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        NumberField.parent.call(this, this.configs);
        
        this.spinDown = metaScore.Function.proxy(this.spinDown, this);
        this.spinUp = metaScore.Function.proxy(this.spinUp, this);

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

    metaScore.editor.Field.extend(NumberField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    NumberField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5),
            buttons;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
            .addListener('input', metaScore.Function.proxy(this.onInput, this))
            .addListener('mousewheel', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('DOMMouseScroll', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeyDown, this))
            .appendTo(this.input_wrapper);

        if(this.configs.spinButtons){
            buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);
                
            if(this.configs.flipSpinButtons){
                buttons.addClass('flip');
            }
                
            this.spindown_btn = new metaScore.Dom('<button/>', {'text': '-', 'data-action': 'spin-down'})
                .addListener('mousedown', metaScore.Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', metaScore.Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', metaScore.Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
                
            this.spinup_btn = new metaScore.Dom('<button/>', {'text': '+', 'data-action': 'spin-up'})
                .addListener('mousedown', metaScore.Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', metaScore.Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', metaScore.Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
        }
        
        this.addClass(this.configs.spinDirection === 'vertical' ? 'vertical' : 'horizontal');

        this.addListener('change', metaScore.Function.proxy(this.onChange, this));
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onChange = function(evt){
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The input event handler
     * 
     * @method onInput
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onInput = function(evt){
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
    NumberField.prototype.onMouseWheel = function(evt){
        var delta;
        
        if(this.input.is(':focus')){
            delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
            
            this.setValue(this.getValue() + (this.configs.step * delta));
        
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
    NumberField.prototype.onKeyDown = function(evt){
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
    NumberField.prototype.onSpinBtnMouseDown = function(evt){
        var fn;

        switch(metaScore.Dom.data(evt.target, 'action')){
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
    NumberField.prototype.onSpinBtnMouseUp = function(evt){
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
    NumberField.prototype.spinDown = function(){
        this.setValue(this.getValue() - this.configs.step);
    };

    /**
     * Increment the value by one step
     * 
     * @method spinUp
     * @private
     */
    NumberField.prototype.spinUp = function(){
        this.setValue(this.getValue() + this.configs.step);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Number} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    NumberField.prototype.setValue = function(value, supressEvent){
        value = parseFloat(value);
        
        if(!isNaN(value)){
            this.value = value;
        }
        else if(isNaN(this.value)){
            this.value = 0;
        }

        if(this.configs.min !== null){
            this.value = Math.max(this.value, this.configs.min);
        }
        if(this.configs.max !== null){
            this.value = Math.min(this.value, this.configs.max);
        }
        
        this.input.val(this.value);
    
        if(supressEvent !== true){
            this.triggerEvent('change');
        }

        return this;
    };

    /**
     * Set the minimum allowed value
     * 
     * @method setMin
     * @param {Number} value The minimum allowed value
     * @chainable
     */
    NumberField.prototype.setMin = function(value){
        this.configs.min = value;

        if(this.getValue() < value){
            this.setValue(value);
        }

        return this;
    };

    /**
     * Set the maximum allowed value
     * 
     * @method setMax
     * @param {Number} value The maximum allowed value
     * @chainable
     */
    NumberField.prototype.setMax = function(value){
        this.configs.max = value;

        if(this.getValue() > value){
            this.setValue(value);
        }

        return this;
    };

    return NumberField;

})();