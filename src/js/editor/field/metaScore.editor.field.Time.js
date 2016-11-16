/**
 * @module Editor
 */

metaScore.namespace('editor.field').Time = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * Fired when the field's checkbox changes
     *
     * @event checkboxchange
     */
    var EVT_CHECKBOXCHANGE = 'checkboxchange';

    /**
     * Fired when the in button is clicked
     *
     * @event valuein
     */
    var EVT_VALUEIN = 'valuein';

    /**
     * Fired when the out button is clicked
     *
     * @event valueout
     */
    var EVT_VALUEOUT = 'valueout';

    /**
     * A time field for entering time values in hours:minutes:seconds:centiseconds format with optional in/out buttons
     *
     * @class TimeField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=0] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     * @param {Boolean} [configs.checkbox=false] Whether to show the enable/disable checkbox
     * @param {Boolean} [configs.inButton=false] Whether to show the in button
     * @param {Boolean} [configs.outButton=false] Whether to show the out button
     */
    function TimeField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TimeField.parent.call(this, this.configs);

        this.addClass('timefield');
    }

    TimeField.defaults = {
        'value': 0,
        'min': 0,
        'max': null,
        'checkbox': false,
        'inButton': false,
        'outButton': false
    };

    metaScore.editor.Field.extend(TimeField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TimeField.prototype.setupUI = function(){
        var buttons;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        if(this.configs.checkbox){
            this.checkbox = new metaScore.Dom('<input/>', {'type': 'checkbox'})
                .addListener('change', metaScore.Function.proxy(this.onCheckboxChange, this))
                .appendTo(this.input_wrapper);
         }

        this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'})
            .addListener('input', metaScore.Function.proxy(this.onTimeInput, this))
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
            .appendTo(this.input_wrapper);

        this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'})
            .addListener('input', metaScore.Function.proxy(this.onTimeInput, this))
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
            .appendTo(this.input_wrapper);

        this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'})
            .addListener('input', metaScore.Function.proxy(this.onTimeInput, this))
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'})
            .appendTo(this.input_wrapper);

        this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'})
            .addListener('input', metaScore.Function.proxy(this.onTimeInput, this))
            .appendTo(this.input_wrapper);

        if(this.configs.inButton || this.configs.outButton){
            buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);

            if(this.configs.inButton){
                this.in = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'in', 'title': metaScore.Locale.t('editor.field.Time.in.tooltip', 'Set field value to current time')})
                    .addListener('click', metaScore.Function.proxy(this.onInClick, this))
                    .appendTo(buttons);
            }

            if(this.configs.outButton){
                this.out = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'out', 'title': metaScore.Locale.t('editor.field.Time.out.tooltip', 'Set current time to field value')})
                    .addListener('click', metaScore.Function.proxy(this.onOutClick, this))
                    .appendTo(buttons);
            }
        }

        this.addListener('change', metaScore.Function.proxy(this.onChange, this));
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onChange = function(evt){
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The checkbox change event handler
     * 
     * @method onCheckboxChange
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onCheckboxChange = function(evt){        
        this.onTimeInput(evt);
        
        this.triggerEvent(EVT_CHECKBOXCHANGE, {'field': this, 'active': this.isActive()}, true, false);
    };

    /**
     * The sub-field's input event handler
     * 
     * @method onInput
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onTimeInput = function(evt){
        var active = this.isActive(),
            centiseconds_val, seconds_val, minutes_val, hours_val;

        if(active){
            centiseconds_val = parseInt(this.centiseconds.val(), 10) || 0;
            seconds_val = parseInt(this.seconds.val(), 10) || 0;
            minutes_val = parseInt(this.minutes.val(), 10) || 0;
            hours_val = parseInt(this.hours.val(), 10) || 0;

            this.setValue(centiseconds_val + (seconds_val * 100) + (minutes_val * 6000) + (hours_val * 360000));
        }
        else{
            this.setValue(null);
        }

        evt.stopPropagation();
    };

    /**
     * The in button's click event handler
     * 
     * @method onInClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onInClick = function(evt){
        this.triggerEvent(EVT_VALUEIN, {'field': this});
    };

    /**
     * The out button's click event handler
     * 
     * @method onOutClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onOutClick = function(evt){
        this.triggerEvent(EVT_VALUEOUT, {'field': this, 'value': this.getValue()});
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Number} centiseconds The new value in centiseconds
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TimeField.prototype.setValue = function(centiseconds, supressEvent){
        var centiseconds_val, seconds_val, minutes_val, hours_val;

        centiseconds = parseFloat(centiseconds);

        if(isNaN(centiseconds)){
            this.value = null;

            this.centiseconds.val(0);
            this.seconds.val(0);
            this.minutes.val(0);
            this.hours.val(0);

            if(!this.disabled){
                this.hours.attr('disabled', 'disabled');
                this.minutes.attr('disabled', 'disabled');
                this.seconds.attr('disabled', 'disabled');
                this.centiseconds.attr('disabled', 'disabled');

                if(this.in){
                    this.in.attr('disabled', 'disabled');
                }
                if(this.out){
                    this.out.attr('disabled', 'disabled');
                }
            }

            this.toggle(false);
        }
        else{
            this.value = Math.floor(centiseconds);
            
            if(this.min !== null){
                this.value = Math.max(this.value, this.min);
            }
            if(this.max !== null){
                this.value = Math.min(this.value, this.max);
            }

            centiseconds_val = parseInt((this.value) % 100, 10) || 0;
            seconds_val = parseInt((this.value / 100) % 60, 10) || 0;
            minutes_val = parseInt((this.value / 6000) % 60, 10) || 0;
            hours_val = parseInt((this.value / 360000), 10) || 0;

            if(!this.disabled){
                this.hours.attr('disabled', null);
                this.minutes.attr('disabled', null);
                this.seconds.attr('disabled', null);
                this.centiseconds.attr('disabled', null);

                if(this.in){
                    this.in.attr('disabled', null);
                }
                if(this.out){
                    this.out.attr('disabled', null);
                }
            }

            this.centiseconds.val(centiseconds_val);
            this.seconds.val(seconds_val);
            this.minutes.val(minutes_val);
            this.hours.val(hours_val);

            this.toggle(true);
        }

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
    TimeField.prototype.setMin = function(value){
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
    TimeField.prototype.setMax = function(value){
        this.max = value;

        return this;
    };

    /**
     * Check whether the field's checkbox is checked
     * 
     * @method isActive
     * @return {Boolean} Whether the field does not have a checkbox or is active
     */
    TimeField.prototype.isActive = function(){
        return !this.checkbox || this.checkbox.is(":checked");
    };

    /**
     * Activate or deactivate the field by toggling its checkbox if available
     * 
     * @method toggle
     * @param {Boolean} state True to activate or false to deactivate the field
     * @chainable
     */
    TimeField.prototype.toggle = function(state){
        if(this.checkbox && (state !== this.checkbox.is(":checked"))){
            this.checkbox.get(0).click();
        }
        
        return this;
    };

    /**
     * Disable the field
     * 
     * @method disable
     * @chainable
     */
    TimeField.prototype.disable = function(){
        TimeField.parent.prototype.disable.call(this);

        if(this.checkbox){
            this.checkbox.attr('disabled', 'disabled');
        }

        this.hours.attr('disabled', 'disabled');
        this.minutes.attr('disabled', 'disabled');
        this.seconds.attr('disabled', 'disabled');
        this.centiseconds.attr('disabled', 'disabled');

        if(this.in){
            this.in.attr('disabled', 'disabled');
        }
        if(this.out){
            this.out.attr('disabled', 'disabled');
        }

        return this;
    };

    /**
     * Enable the field
     * 
     * @method enable
     * @chainable
     */
    TimeField.prototype.enable = function(){
        var active = this.isActive(),
            disabled_attr;
        
        TimeField.parent.prototype.enable.call(this);

        if(this.checkbox){
            this.checkbox.attr('disabled', null);
        }
        
        disabled_attr = active ? null : 'disabled';

        this.hours.attr('disabled', disabled_attr);
        this.minutes.attr('disabled', disabled_attr);
        this.seconds.attr('disabled', disabled_attr);
        this.centiseconds.attr('disabled', disabled_attr);

        if(this.in){
            this.in.attr('disabled', disabled_attr);
        }
        if(this.out){
            this.out.attr('disabled', disabled_attr);
        }

        return this;
    };

    /**
     * Toggle the field's readonly state
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    TimeField.prototype.readonly = function(readonly){
        var readonly_attr;
        
        TimeField.parent.prototype.readonly.call(this, readonly);
        
        readonly_attr = this.is_readonly ? "readonly" : null;

        if(this.checkbox){
            this.checkbox.attr('readonly', readonly_attr);
        }

        this.hours.attr('readonly', readonly_attr);
        this.minutes.attr('readonly', readonly_attr);
        this.seconds.attr('readonly', readonly_attr);
        this.centiseconds.attr('readonly', readonly_attr);
        
        if(this.in){
            this.in.attr('readonly', readonly_attr);
        }

        return this;
    };

    /**
     * Reset the field's configs
     *
     * @method reset
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TimeField.prototype.reset = function(supressEvent){
        this
            .setMin(this.configs.min)
            .setMax(this.configs.max);
        
        TimeField.parent.prototype.reset.call(this, supressEvent);

        return this;
    };

    return TimeField;

})();