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
    
    var PARTS = [
        {
            "name": "hours",
            "regex": "[–0-9]{1,2}",
            "multiplier": 360000,
            "prefix": "",
            "suffix": "",
            "max_value": 99
        },
        {
            "name": "minutes",
            "regex": "[–0-5]?[–0-9]",
            "multiplier": 6000,
            "prefix": ":",
            "suffix": "",
            "max_value": 59
        },
        {
            "name": "seconds",
            "regex": "[–0-5]?[\–0-9]",
            "multiplier": 100,
            "prefix": ":",
            "suffix": "",
            "max_value": 59
        },
        {
            "name": "centiseconds",
            "regex": "[–0-9]{1,2}",
            "multiplier": 1,
            "prefix": ".",
            "suffix": "",
            "max_value": 99
        }
    ];

    var PART_PLACEHOLDER = "––";

    var GLOBAL_REGEX = new RegExp("^"+ PARTS.reduce(function(accumulator, value) {
          return accumulator + value.prefix +'('+ value.regex +')'+ value.suffix;
    }, "") +"$");

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
     * @param {Boolean} [configs.clearButton=false] Whether to show the clear button
     * @param {Boolean} [configs.inButton=false] Whether to show the in button
     * @param {Boolean} [configs.outButton=false] Whether to show the out button
     */
    function TimeField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TimeField.parent.call(this, this.configs);

        this.addClass('timefield');

        if(this.configs.min !== null){
            this.setMin(this.configs.min);
        }
        if(this.configs.max !== null){
            this.setMax(this.configs.max);
        }
    }

    TimeField.defaults = {
        'value': null,
        'min': 0,
        'max': null,
        'clearButton': false,
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

        TimeField.parent.prototype.setupUI.call(this);

        this.input_el = this.input.get(0);

        this.input
            .addListener('mousedown', metaScore.Function.proxy(this.onMouseDown, this))
            .addListener('mousewheel', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('focus', metaScore.Function.proxy(this.onFocus, this))
            .addListener('blur', metaScore.Function.proxy(this.onBlur, this))
            .addListener('dragstart', metaScore.Function.proxy(this.onDragstart, this))
            .addListener('drop', metaScore.Function.proxy(this.onDrop, this))
            .addListener('cut', metaScore.Function.proxy(this.onCut, this))
            .addListener('paste', metaScore.Function.proxy(this.onPaste, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keypress', metaScore.Function.proxy(this.onKeypress, this));

        if(this.configs.clearButton || this.configs.inButton || this.configs.outButton){
            buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);

            if(this.configs.clearButton){
                this.clearButton = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': metaScore.Locale.t('editor.field.Time.clear.tooltip', 'Clear value')})
                    .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
                    .appendTo(buttons);
            }

            if(this.configs.inButton){
                this.inButton = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'in', 'title': metaScore.Locale.t('editor.field.Time.in.tooltip', 'Set field value to current time')})
                    .addListener('click', metaScore.Function.proxy(this.onInClick, this))
                    .appendTo(buttons);
            }

            if(this.configs.outButton){
                this.outButton = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'out', 'title': metaScore.Locale.t('editor.field.Time.out.tooltip', 'Set current time to field value')})
                    .addListener('click', metaScore.Function.proxy(this.onOutClick, this))
                    .appendTo(buttons);
            }
        }
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
     * The mousedown event handler
     * 
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onMouseDown = function(evt){
        this.skipFocus = true;
    };

    /**
     * The mousewheel event handler
     * 
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onMouseWheel = function(evt){
        var segment = this.getFocusedSegment();

        if(segment !== undefined){
            if(evt.deltaY < 0){
                this.incrementSegmentValue(segment);
                this.setFocusedSegment(segment);
            }
            else if(evt.deltaY > 0){
                this.decrementSegmentValue(segment);
                this.setFocusedSegment(segment);
            }
        }

        evt.preventDefault();
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onClick = function(evt){
        var caretPosition = this.getCaretPosition();

        this.setFocusedSegment(Math.floor(caretPosition / 3));

        delete this.skipFocus;
    };

    /**
     * The focus event handler
     * 
     * @method onFocus
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onFocus = function(evt){
        this.keys_pressed = 0;

        if(!this.skipFocus){
            this.setFocusedSegment(0);
        }
    };

    /**
     * The blur event handler
     * 
     * @method onBlur
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onBlur = function(evt){
        delete this.keys_pressed;
        delete this.focused_segment;

        if(this.dirty){
            delete this.dirty;
            this.input.triggerEvent('change');
        }
    };

    /**
     * The dragstart event handler
     * 
     * @method onDragstart
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onDragstart = function(evt){
        evt.preventDefault();
    };

    /**
     * The drop event handler
     * 
     * @method onDrop
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onDrop = function(evt){
        evt.preventDefault();
    };

    /**
     * The cut event handler
     * 
     * @method onCut
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onCut = function(evt){
        evt.preventDefault();
    };

    /**
     * The paste event handler
     * 
     * @method onPaste
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onPaste = function(evt){
        var clipboard_data = evt.clipboardData || window.clipboardData,
            pasted_data = clipboard_data.getData('Text');

        if(this.isValid(pasted_data)){
            this.setValue(this.getNumericalValue(pasted_data), false);
        }

        evt.preventDefault();
    };

    /**
     * The keydown event handler
     * 
     * @method onKeydown
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onKeydown = function(evt){
        var segment;

        switch (evt.keyCode) {
            case 37: // left arrow
            case 39: // right arrow
                segment = this.getFocusedSegment() + (evt.keyCode === 37 ? -1 : 1);

                if(segment >= 0 && segment < PARTS.length){
                    this.setFocusedSegment(segment);
                }

                evt.preventDefault();
                break;
                
            case 38: // up arrow
                segment = this.getFocusedSegment();

                if(segment !== undefined){
                    this.incrementSegmentValue(segment);
                    this.setFocusedSegment(segment);
                }
                
                evt.preventDefault();
                break;
                
            case 40: // down arrow
                segment = this.getFocusedSegment();

                if(segment !== undefined){
                    this.decrementSegmentValue(segment);
                    this.setFocusedSegment(segment);
                }

                evt.preventDefault();
                break;
                
            case 9: // tab
                segment = this.getFocusedSegment() + (evt.shiftKey ? -1 : 1);

                if(segment >= 0 && segment < PARTS.length){
                    this.setFocusedSegment(segment);
                    evt.preventDefault();
                }

                break;
        }
    };

    /**
     * The keypress event handler
     * 
     * @method onKeypress
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onKeypress = function(evt){
        var focused_segment = this.getFocusedSegment(),
            segment_value;

        // Numeric key
        if(focused_segment < PARTS.length && evt.keyCode >= 48 && evt.keyCode <= 57){
            segment_value = parseInt(this.getSegmentValue(focused_segment));

            if(this.keys_pressed === 0 || isNaN(segment_value)){
                segment_value = 0;
            }

            segment_value += String.fromCharCode(evt.keyCode);

            segment_value = metaScore.String.pad(Math.min(PARTS[focused_segment].max_value, parseInt(segment_value)), 2, "0", "left");

            if(this.setSegmentValue(focused_segment, segment_value, true)){
                this.dirty = true;
            }

            if(++this.keys_pressed === 2){
                this.keys_pressed = 0;
                this.setFocusedSegment(focused_segment + 1);
            }
            else{
                this.setFocusedSegment(focused_segment);
            }
        }
        // Enter key
        else if(evt.keyCode === 13 && this.dirty){
            delete this.dirty;
            this.input.triggerEvent('change');
        }

        evt.preventDefault();
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onClearClick = function(evt){
        this.setValue(null);
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
     * Helper function to check if a certain value is a valid textual value
     * 
     * @method isValid
     * @private
     * @param {String} value The value to check
     */
    TimeField.prototype.isValid = function(value){
        return GLOBAL_REGEX.test(value);
    };

    /**
     * Helper function to retreive the input's current caret position
     * 
     * @method getCaretPosition
     * @private
     * @return {Number} The caret position
     */
    TimeField.prototype.getCaretPosition = function(){
        var caretPosition;
            
        if(typeof this.input_el.selectionStart === 'number'){
            caretPosition = this.input_el.selectionDirection === 'backward' ? this.input_el.selectionStart : this.input_el.selectionEnd;
        }
        
        return caretPosition;
    };

    /**
     * Helper function to retreive the index of the focused segmnet
     * 
     * @method getFocusedSegment
     * @private
     * @return {Number} The focus segment's index
     */
    TimeField.prototype.getFocusedSegment = function(){
        return this.focused_segment;
    };

    /**
     * Helper function to set the focused segmnet
     * 
     * @method setFocusedSegment
     * @private
     * @param {Number} segment The focus segment's index
     */
    TimeField.prototype.setFocusedSegment = function(segment){
        var start = segment * 3,
            end = start + 2;
            
        this.input_el.setSelectionRange(0, 0);
        this.input_el.setSelectionRange(start, end, 'forward');
                  
        this.focused_segment = segment;
    };

    /**
     * Helper function to retreive the value of a segmnet
     * 
     * @method getSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @return {String} The segment's value
     */
    TimeField.prototype.getSegmentValue = function(segment){
        var textual_value = this.input.val(),
            matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            matches.shift();
            return matches[segment];
        }
    };

    /**
     * Helper function to set the value of a segmnet
     * 
     * @method setSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @param {String} value The segment's value
     * @param {Boolean} supressEvent Whether to prevent the change event from firing
     * @return {Boolean} Whether the value was set
     */
    TimeField.prototype.setSegmentValue = function(segment, value, supressEvent){
        var textual_value = this.input.val(),
            matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            textual_value = "";
            matches.shift();

            matches.forEach(function(match, i){
                textual_value += PARTS[i].prefix;
                textual_value += (i === segment) ? value : (matches[i] === "––" ? "00" : matches[i]);
                textual_value += PARTS[i].suffix;
            });

            this.setValue(this.getNumericalValue(textual_value), supressEvent);

            return true;
        }

        return false;
    };

    /**
     * Helper function to increment a segment's value
     * 
     * @method incrementSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @chainable
     */
    TimeField.prototype.incrementSegmentValue = function(segment){
        var value = this.getValue();

        if(value === null){
            value = 0;
        }

        value += PARTS[segment].multiplier;
        this.setValue(Math.max(0, value));

        return this;
    };

    /**
     * Helper function to decrement a segment's value
     * 
     * @method decrementSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @chainable
     */
    TimeField.prototype.decrementSegmentValue = function(segment){
        var value = this.getValue();

        value = this.getValue();

        if(value === null){
            value = 0;
        }
        
        if(value >= PARTS[segment].multiplier){
            value -= PARTS[segment].multiplier;
            this.setValue(Math.max(0, value));
        }

        return this;
    };

    /**
     * Helper function to convert a textual value to a numerical one
     * 
     * @method getNumericalValue
     * @private
     * @param {String} textual_value The textual value
     * @return {Number} The numercial value
     */
    TimeField.prototype.getNumericalValue = function(textual_value){
        var matches, value;

        if(textual_value.indexOf(PART_PLACEHOLDER) !== -1){
            return null;
        }

        matches = textual_value.match(GLOBAL_REGEX);
        value = 0;
        
        if(matches){
            matches.shift();

            matches.forEach(function(match, i){
                value += parseInt(matches[i]) * PARTS[i].multiplier;
            });
        }
        
        return value;
    };

    /**
     * Helper function to convert a numerical value to a textual one
     * 
     * @method getTextualValue
     * @private
     * @param {Number} value The numercial value
     * @return {String} The textual value
     */
    TimeField.prototype.getTextualValue = function(value){
        var textual_value = "";

        PARTS.forEach(function(part, i){
            textual_value += part.prefix;

            if(value === null){
                textual_value += PART_PLACEHOLDER;
            }
            else{
                textual_value += metaScore.String.pad(parseInt((value / part.multiplier) % (part.max_value + 1), 10) || 0, 2, "0", "left");
            }

            textual_value += part.suffix;
        });
        
        return textual_value;
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Number} centiseconds The new value in centiseconds
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TimeField.prototype.setValue = function(value, supressEvent){
        if(value !== null){
            value = parseInt(value);
    
            if(this.min !== null){
                value = Math.max(value, this.min);
            }
    
            if(this.max !== null){
                value = Math.min(value, this.max);
            }
        }

        this.input.val(this.getTextualValue(value));

        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    };

    /**
     * Set the minimum allowed value
     * 
     * @method setMin
     * @param {Number} min The minimum allowed value
     * @chainable
     */
    TimeField.prototype.setMin = function(min){
        var value = this.getValue();

        this.min = min;

        if(this.min !== null && value !== null && value < this.min){
            this.setValue(this.min);
        }

        return this;
    };

    /**
     * Set the maximum allowed value
     * 
     * @method setMax
     * @param {Number} max The maximum allowed value
     * @chainable
     */
    TimeField.prototype.setMax = function(max){
        var value = this.getValue();

        this.max = max;

        if(this.max !== null && value !== null && value > this.max){
            this.setValue(this.max);
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

        if(this.clearButton){
            this.clearButton.attr('disabled', 'disabled');
        }

        if(this.inButton){
            this.inButton.attr('disabled', 'disabled');
        }
        if(this.outButton){
            this.outButton.attr('disabled', 'disabled');
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
        TimeField.parent.prototype.enable.call(this);

        if(this.clearButton){
            this.clearButton.attr('disabled', null);
        }

        if(this.inButton){
            this.inButton.attr('disabled', null);
        }
        if(this.outButton){
            this.outButton.attr('disabled', null);
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

        if(this.clearButton){
            this.clearButton.attr('readonly', readonly_attr);
        }
        
        if(this.inButton){
            this.inButton.attr('readonly', readonly_attr);
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