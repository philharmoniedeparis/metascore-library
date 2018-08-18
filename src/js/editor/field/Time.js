import Field from '../Field';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {pad} from '../../core/utils/String';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

/**
 * Fired when the in button is clicked
 *
 * @event valuein
 */
const EVT_VALUEIN = 'valuein';

/**
 * Fired when the out button is clicked
 *
 * @event valueout
 */
const EVT_VALUEOUT = 'valueout';

const PARTS = [
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
        "regex": "[–0-5]?[–0-9]",
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

const PART_PLACEHOLDER = "––";

const GLOBAL_REGEX = new RegExp(`^${PARTS.reduce((accumulator, value) => {
        return `${accumulator + value.prefix}(${value.regex})${value.suffix}`;
}, "")}$`);

export default class Time extends Field {

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
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('timefield');

        if(this.configs.min !== null){
            this.setMin(this.configs.min);
        }
        if(this.configs.max !== null){
            this.setMax(this.configs.max);
        }
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'value': null,
            'min': 0,
            'max': null,
            'clearButton': false,
            'inButton': false,
            'outButton': false
        });
    }

    /**
     * Helper function to convert a textual value to a numerical one
     *
     * @method getNumericalValue
     * @private
     * @param {String} textual_value The textual value
     * @return {Number} The numercial value
     */
    static getNumericalValue(textual_value){
        let matches, value;

        if(textual_value.indexOf(PART_PLACEHOLDER) !== -1){
            return null;
        }

        matches = textual_value.match(GLOBAL_REGEX);
        value = 0;

        if(matches){
            matches.shift();

            matches.forEach((match, i) => {
                value += parseInt(matches[i], 10) * PARTS[i].multiplier;
            });
        }

        return value;
    }

    /**
     * Helper function to convert a numerical value to a textual one
     *
     * @method getTextualValue
     * @private
     * @param {Number} value The numercial value
     * @return {String} The textual value
     */
    static getTextualValue(value){
        let textual_value = "";

        PARTS.forEach((part) => {
            textual_value += part.prefix;

            if(value === null){
                textual_value += PART_PLACEHOLDER;
            }
            else{
                textual_value += pad(parseInt((value / part.multiplier) % (part.max_value + 1), 10) || 0, 2, "0", "left");
            }

            textual_value += part.suffix;
        });

        return textual_value;
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

        this.input_el = this.input.get(0);

        this.input
            .addListener('mousedown', this.onMouseDown.bind(this))
            .addListener('mousewheel', this.onMouseWheel.bind(this))
            .addListener('click', this.onClick.bind(this))
            .addListener('focus', this.onFocus.bind(this))
            .addListener('dragstart', this.onDragstart.bind(this))
            .addListener('drop', this.onDrop.bind(this))
            .addListener('cut', this.onCut.bind(this))
            .addListener('paste', this.onPaste.bind(this))
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keypress', this.onKeypress.bind(this));

        if(this.configs.clearButton || this.configs.inButton || this.configs.outButton){
            buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);

            if(this.configs.clearButton){
                this.clearButton = new Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': Locale.t('editor.field.Time.clear.tooltip', 'Clear value')})
                    .addListener('click', this.onClearClick.bind(this))
                    .appendTo(buttons);
            }

            if(this.configs.inButton){
                this.inButton = new Dom('<button/>', {'text': '.', 'data-action': 'in', 'title': Locale.t('editor.field.Time.in.tooltip', 'Set field value to current time')})
                    .addListener('click', this.onInClick.bind(this))
                    .appendTo(buttons);
            }

            if(this.configs.outButton){
                this.outButton = new Dom('<button/>', {'text': '.', 'data-action': 'out', 'title': Locale.t('editor.field.Time.out.tooltip', 'Set current time to field value')})
                    .addListener('click', this.onOutClick.bind(this))
                    .appendTo(buttons);
            }
        }
    }

    /**
     * The change event handler
     *
     * @method onChange
     * @private
     */
    onChange(){
        delete this.keys_pressed;
        delete this.focused_segment;

        if(this.dirty){
            delete this.dirty;
            this.setValue(this.constructor.getNumericalValue(this.input.val()));
        }

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    }

    /**
     * The mousedown event handler
     *
     * @method onMouseDown
     * @private
     */
    onMouseDown(){
        this.skipFocus = true;
    }

    /**
     * The mousewheel event handler
     *
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    onMouseWheel(evt){
        const segment = this.getFocusedSegment();

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
    }

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     */
    onClick(){
        const caretPosition = this.getCaretPosition();

        this.setFocusedSegment(Math.floor(caretPosition / 3));

        delete this.skipFocus;
    }

    /**
     * The focus event handler
     *
     * @method onFocus
     * @private
     */
    onFocus(){
        this.keys_pressed = 0;

        if(!this.skipFocus){
            this.setFocusedSegment(0);
        }
    }

    /**
     * The dragstart event handler
     *
     * @method onDragstart
     * @private
     * @param {Event} evt The event object
     */
    onDragstart(evt){
        evt.preventDefault();
    }

    /**
     * The drop event handler
     *
     * @method onDrop
     * @private
     * @param {Event} evt The event object
     */
    onDrop(evt){
        evt.preventDefault();
    }

    /**
     * The cut event handler
     *
     * @method onCut
     * @private
     * @param {Event} evt The event object
     */
    onCut(evt){
        evt.preventDefault();
    }

    /**
     * The paste event handler
     *
     * @method onPaste
     * @private
     * @param {Event} evt The event object
     */
    onPaste(evt){
        let clipboard_data = evt.clipboardData || window.clipboardData,
            pasted_data = clipboard_data.getData('Text');

        if(this.isValid(pasted_data)){
            this.setValue(this.constructor.getNumericalValue(pasted_data), false);
        }

        evt.preventDefault();
    }

    /**
     * The keydown event handler
     *
     * @method onKeydown
     * @private
     * @param {Event} evt The event object
     */
    onKeydown(evt){
        let segment;

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
    }

    /**
     * The keypress event handler
     *
     * @method onKeypress
     * @private
     * @param {Event} evt The event object
     */
    onKeypress(evt){
        let focused_segment = this.getFocusedSegment(),
            segment_value;

        // Numeric key
        if(focused_segment < PARTS.length && evt.keyCode >= 48 && evt.keyCode <= 57){
            segment_value = parseInt(this.getSegmentValue(focused_segment), 10);

            if(this.keys_pressed === 0 || isNaN(segment_value)){
                segment_value = 0;
            }

            segment_value += String.fromCharCode(evt.keyCode);

            segment_value = pad(Math.min(PARTS[focused_segment].max_value, parseInt(segment_value, 10)), 2, "0", "left");

            this.setSegmentValue(focused_segment, segment_value);

            if(++this.keys_pressed === 2){
                this.keys_pressed = 0;
                this.setFocusedSegment(focused_segment + 1);
            }
            else{
                this.setFocusedSegment(focused_segment);
            }
        }
        // not Enter key
        else if(evt.keyCode !== 13){
            evt.preventDefault();
        }

    }

    /**
     * The clear button click event handler
     *
     * @method onClearClick
     * @private
     */
    onClearClick(){
        this.setValue(null);
    }

    /**
     * The in button's click event handler
     *
     * @method onInClick
     * @private
     */
    onInClick(){
        this.triggerEvent(EVT_VALUEIN, {'field': this});
    }

    /**
     * The out button's click event handler
     *
     * @method onOutClick
     * @private
     */
    onOutClick(){
        this.triggerEvent(EVT_VALUEOUT, {'field': this, 'value': this.getValue()});
    }

    /**
     * Helper function to check if a certain value is a valid textual value
     *
     * @method isValid
     * @private
     * @param {String} value The value to check
     */
    isValid(value){
        return GLOBAL_REGEX.test(value);
    }

    /**
     * Helper function to retreive the input's current caret position
     *
     * @method getCaretPosition
     * @private
     * @return {Number} The caret position
     */
    getCaretPosition() {
        let caretPosition;

        if(typeof this.input_el.selectionStart === 'number'){
            caretPosition = this.input_el.selectionDirection === 'backward' ? this.input_el.selectionStart : this.input_el.selectionEnd;
        }

        return caretPosition;
    }

    /**
     * Helper function to retreive the index of the focused segmnet
     *
     * @method getFocusedSegment
     * @private
     * @return {Number} The focus segment's index
     */
    getFocusedSegment() {
        return this.focused_segment;
    }

    /**
     * Helper function to set the focused segmnet
     *
     * @method setFocusedSegment
     * @private
     * @param {Number} segment The focus segment's index
     */
    setFocusedSegment(segment){
        let start = segment * 3,
            end = start + 2;

        this.input_el.setSelectionRange(0, 0);
        this.input_el.setSelectionRange(start, end, 'forward');

        this.focused_segment = segment;
    }

    /**
     * Helper function to retreive the value of a segmnet
     *
     * @method getSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @return {String} The segment's value
     */
    getSegmentValue(segment){
        let textual_value = this.input.val(),
            matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            matches.shift();
            return matches[segment];
        }
    }

    /**
     * Helper function to set the value of a segmnet
     *
     * @method setSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @param {String} value The segment's value
     * @param {Boolean} supressEvent Whether to prevent the change event from firing
     */
    setSegmentValue(segment, value){
        let textual_value = this.input.val(),
            matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            textual_value = "";
            matches.shift();

            matches.forEach((match, i) => {
                textual_value += PARTS[i].prefix;
                textual_value += (i === segment) ? value : (matches[i] === "––" ? "00" : matches[i]);
                textual_value += PARTS[i].suffix;
            });

            this.input.val(textual_value);

            this.dirty = true;
        }
    }

    /**
     * Helper function to increment a segment's value
     *
     * @method incrementSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @chainable
     */
    incrementSegmentValue(segment){
        let value = this.getValue();

        if(value === null){
            value = 0;
        }

        value += PARTS[segment].multiplier;
        this.setValue(Math.max(0, value));

        return this;
    }

    /**
     * Helper function to decrement a segment's value
     *
     * @method decrementSegmentValue
     * @private
     * @param {Number} segment The segment's index
     * @chainable
     */
    decrementSegmentValue(segment){
        let value = this.getValue();

        value = this.getValue();

        if(value === null){
            value = 0;
        }

        if(value >= PARTS[segment].multiplier){
            value -= PARTS[segment].multiplier;
            this.setValue(Math.max(0, value));
        }

        return this;
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Number} centiseconds The new value in centiseconds
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        if(value !== null){
            value = parseInt(value, 10);

            if(this.min !== null){
                value = Math.max(value, this.min);
            }

            if(this.max !== null){
                value = Math.min(value, this.max);
            }
        }

        this.input.val(this.constructor.getTextualValue(value));

        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    }

    /**
     * Set the minimum allowed value
     *
     * @method setMin
     * @param {Number} min The minimum allowed value
     * @chainable
     */
    setMin(min){
        const value = this.getValue();

        this.min = min;

        if(this.min !== null && value !== null && value < this.min){
            this.setValue(this.min);
        }

        return this;
    }

    /**
     * Set the maximum allowed value
     *
     * @method setMax
     * @param {Number} max The maximum allowed value
     * @chainable
     */
    setMax(max){
        const value = this.getValue();

        this.max = max;

        if(this.max !== null && value !== null && value > this.max){
            this.setValue(this.max);
        }

        return this;
    }

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    disable() {
        super.disable();

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
    }

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    enable() {
        super.enable();

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
    }

    /**
     * Toggle the field's readonly state
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    readonly(readonly){
        let readonly_attr;

        super.readonly(readonly);

        readonly_attr = this.is_readonly ? "readonly" : null;

        if(this.clearButton){
            this.clearButton.attr('readonly', readonly_attr);
        }

        if(this.inButton){
            this.inButton.attr('readonly', readonly_attr);
        }

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
