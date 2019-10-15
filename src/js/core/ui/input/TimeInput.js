import Input from '../Input';
import Dom from '../../Dom';
import Button from '../Button';
import Locale from '../../Locale';
import {pad} from '../../utils/String';
import {isNumeric} from '../../utils/Var';

import in_icon from '../../../../img/core/ui/input/time/time-in.svg?sprite';
import out_icon from '../../../../img/core/ui/input/time/time-out.svg?sprite';
import clear_icon from '../../../../img/core/ui/input/time/clear.svg?sprite';
import {className} from '../../../../css/core/ui/input/Time.scss';

/**
 * Time parts configurations
 * @type {Array}
 */
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

/**
 * A time part's placeholder
 * @type {String}
 */
const PART_PLACEHOLDER = "––";

/**
 * A regular expression used to retrieve the values of each part
 * @type {RegExp}
 */
const GLOBAL_REGEX = new RegExp(`^${PARTS.reduce((accumulator, value) => {
    return `${accumulator + value.prefix}(${value.regex})${value.suffix}`;
}, "")}$`);

/**
 * A time input for entering time values in hours:minutes:seconds:centiseconds format with optional in/out buttons
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
 * @param {Mixed} value The new value
 * @emits {valuein} Fired when the in button is clicked
 * @emits {valueout} Fired when the out button is clicked
 */
export default class TimeInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Number} [value=0] The default value
     * @property {Number} [min=0] The minimum allowed value
     * @property {Number} [max=null] The maximum allowed value
     * @property {Boolean} [clearButton=false] Whether to show the clear button
     * @property {Boolean} [inButton=false] Whether to show the in button
     * @property {Boolean} [outButton=false] Whether to show the out button
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`time ${className}`);

        if(this.configs.min !== null){
            this.setMin(this.configs.min);
        }
        if(this.configs.max !== null){
            this.setMax(this.configs.max);
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'value': null,
            'min': 0,
            'max': null,
            'inButton': false,
            'outButton': false,
            'clearButton': false
        });
    }

    /**
     * Helper function to convert a textual value to a numerical one
     *
     * @private
     * @param {String} textual_value The textual value
     * @return {Number} The numercial value
     */
    static getNumericalValue(textual_value){
        if(textual_value.indexOf(PART_PLACEHOLDER) !== -1){
            return null;
        }

        let value = 0;
        const matches = textual_value.match(GLOBAL_REGEX);

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
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.native_input
            .addListener('mousedown', this.onMouseDown.bind(this))
            .addListener('mousewheel', this.onMouseWheel.bind(this))
            .addListener('click', this.onClick.bind(this))
            .addListener('focus', this.onFocus.bind(this))
            .addListener('blur', this.onBlur.bind(this))
            .addListener('dragstart', this.onDragstart.bind(this))
            .addListener('drop', this.onDrop.bind(this))
            .addListener('cut', this.onCut.bind(this))
            .addListener('paste', this.onPaste.bind(this))
            .addListener('keydown', this.onKeydown.bind(this));

        if(this.configs.clearButton || this.configs.inButton || this.configs.outButton){
            const buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(this);

            if(this.configs.inButton){
                /**
                 * The potential time-in button
                 * @type {Button}
                 */
                this.in_button = new Button({'icon': in_icon})
                    .data('action', 'in')
                    .attr('title', Locale.t('core.ui.input.TimeInput.in.tooltip', 'Set value to current time'))
                    .addListener('click', this.onInClick.bind(this))
                    .appendTo(buttons);
            }

            if(this.configs.outButton){
                /**
                 * The potential time-out button
                 * @type {Button}
                 */
                this.out_button = new Button({'icon': out_icon})
                    .data('action', 'out')
                    .attr('title', Locale.t('core.ui.input.TimeInput.out.tooltip', 'Set current time to this value'))
                    .addListener('click', this.onOutClick.bind(this))
                    .appendTo(buttons);
            }

            if(this.configs.clearButton){
                /**
                 * The potential clear button
                 * @type {Button}
                 */
                this.clear_button = new Button({'icon': clear_icon})
                    .data('action', 'clear')
                    .attr('title', Locale.t('core.ui.input.TimeInput.clear.tooltip', 'Clear value'))
                    .addListener('click', this.onClearClick.bind(this))
                    .appendTo(buttons);
            }
        }
    }

    /**
     * The change event handler
     *
     * @private
     */
    onChange(){
        this.keys_pressed = 0;
        delete this.focused_segment;

        if(this.dirty){
            delete this.dirty;
            this.setValue(this.constructor.getNumericalValue(this.native_input.val()), true);
        }

        this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
    }

    /**
     * The mousedown event handler
     *
     * @private
     */
    onMouseDown(){
        /**
         * Whether to skip setting the focused segment on focus
         * @type {Boolean}
         */
        this.skip_focus = true;
    }

    /**
     * The mousewheel event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseWheel(evt){
        const segment = this.getFocusedSegment();

        if(typeof segment !== "undefined"){
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
     * @private
     */
    onClick(){
        const caretPosition = this.getCaretPosition();

        this.setFocusedSegment(Math.floor(caretPosition / 3));

        delete this.skip_focus;
    }

    /**
     * The focus event handler
     *
     * @private
     */
    onFocus(){
        /**
         * The count of pressed keys, used for automatic segment changes
         * @type {Number}
         */
        this.keys_pressed = 0;

        if(!this.skip_focus){
            this.setFocusedSegment(0);
        }
    }

    /**
     * The blur event handler
     *
     * @private
     */
    onBlur(){
        if(this.dirty){
            this.native_input.triggerEvent('change');
        }
    }

    /**
     * The dragstart event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onDragstart(evt){
        evt.preventDefault();
    }

    /**
     * The drop event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onDrop(evt){
        evt.preventDefault();
    }

    /**
     * The cut event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onCut(evt){
        evt.preventDefault();
    }

    /**
     * The paste event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPaste(evt){
        const clipboard_data = evt.clipboardData || window.clipboardData;
        const pasted_data = clipboard_data.getData('Text');

        if(this.isValid(pasted_data)){
            this.setValue(this.constructor.getNumericalValue(pasted_data), false);
        }

        evt.preventDefault();
    }

    /**
     * The keydown event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeydown(evt){
        switch (evt.key) {
            case "ArrowLeft":
            case "ArrowRight": {
                const segment = this.getFocusedSegment() + (evt.key === "ArrowLeft" ? -1 : 1);

                if(segment >= 0 && segment < PARTS.length){
                    this.setFocusedSegment(segment);
                }

                evt.preventDefault();
                break;
            }
            case "ArrowUp": {
                const segment = this.getFocusedSegment();

                if(typeof segment !== "undefined"){
                    this.incrementSegmentValue(segment);
                    this.setFocusedSegment(segment);
                }

                evt.preventDefault();
                break;
            }
            case "ArrowDown": {
                const segment = this.getFocusedSegment();

                if(typeof segment !== "undefined"){
                    this.decrementSegmentValue(segment);
                    this.setFocusedSegment(segment);
                }

                evt.preventDefault();
                break;
            }
            case "Tab": {
                const segment = this.getFocusedSegment() + (evt.shiftKey ? -1 : 1);

                if(segment >= 0 && segment < PARTS.length){
                    this.setFocusedSegment(segment);
                    evt.preventDefault();
                }

                break;
            }
        }
    }

    /**
     * The keypress event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeypress(evt){
        if(isNumeric(evt.key)){
            const focused_segment = this.getFocusedSegment();

            // Numeric key
            if(focused_segment < PARTS.length){
                let segment_value = parseInt(this.getSegmentValue(focused_segment), 10);

                if(this.keys_pressed === 0 || isNaN(segment_value)){
                    segment_value = 0;
                }

                segment_value += evt.key;

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
        }
        else if(evt.key === "Enter"){
            if(this.dirty){
                this.native_input.triggerEvent('change');
            }
        }

        evt.preventDefault();
    }

    /**
     * The clear button click event handler
     *
     * @private
     */
    onClearClick(){
        this.setValue(null);
    }

    /**
     * The in button's click event handler
     *
     * @private
     */
    onInClick(){
        this.triggerEvent('valuein', {'input': this});
    }

    /**
     * The out button's click event handler
     *
     * @private
     */
    onOutClick(){
        this.triggerEvent('valueout', {'input': this, 'value': this.getValue()});
    }

    /**
     * Helper function to check if a certain value is a valid textual value
     *
     * @private
     * @param {String} value The value to check
     */
    isValid(value){
        return GLOBAL_REGEX.test(value);
    }

    /**
     * Helper function to retreive the input's current caret position
     *
     * @private
     * @return {Number} The caret position
     */
    getCaretPosition() {
        const el = this.native_input.get(0);
        let caretPosition = 0;

        if(typeof el.selectionStart === 'number'){
            caretPosition = el.selectionDirection === 'backward' ? el.selectionStart : el.selectionEnd;
        }

        return caretPosition;
    }

    /**
     * Helper function to retreive the index of the focused segmnet
     *
     * @private
     * @return {Number} The focus segment's index
     */
    getFocusedSegment() {
        return this.focused_segment;
    }

    /**
     * Helper function to set the focused segmnet
     *
     * @private
     * @param {Number} segment The focus segment's index
     */
    setFocusedSegment(segment){
        const el = this.native_input.get(0);
        const start = segment * 3;
        const end = start + 2;

        el.setSelectionRange(0, 0);
        el.setSelectionRange(start, end, 'forward');

        /**
         * The index of the currenty focused segment
         * @type {Number}
         */
        this.focused_segment = segment;
    }

    /**
     * Helper function to retreive the value of a segmnet
     *
     * @private
     * @param {Number} segment The segment's index
     * @return {String} The segment's value
     */
    getSegmentValue(segment){
        const textual_value = this.native_input.val();
        const matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            matches.shift();
            return matches[segment];
        }

        return null;
    }

    /**
     * Helper function to set the value of a segmnet
     *
     * @private
     * @param {Number} segment The segment's index
     * @param {String} value The segment's value
     */
    setSegmentValue(segment, value){
        let textual_value = this.native_input.val();
        const matches = textual_value.match(GLOBAL_REGEX);

        if(matches){
            textual_value = "";
            matches.shift();

            matches.forEach((match, i) => {
                textual_value += PARTS[i].prefix;
                textual_value += (i === segment) ? value : (matches[i] === "––" ? "00" : matches[i]);
                textual_value += PARTS[i].suffix;
            });

            this.native_input.val(textual_value);

            /**
             * Whether an input occured but the current value has not yet been updated
             * @type {Boolean}
             */
            this.dirty = true;
        }
    }

    /**
     * Helper function to increment a segment's value
     *
     * @private
     * @param {Number} segment The segment's index
     * @return {this}
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
     * @private
     * @param {Number} segment The segment's index
     * @return {this}
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
     * Set the input's value
     *
     * @param {Number} value The new value in centiseconds
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        let _value = value;

        if(_value !== null){
            _value = parseInt(_value, 10);

            if(this.min !== null){
                _value = Math.max(_value, this.min);
            }

            if(this.max !== null){
                _value = Math.min(_value, this.max);
            }
        }

        this.native_input.val(this.constructor.getTextualValue(_value));

        /**
         * The current value
         * @type {String}
         */
        this.value = _value;

        if(supressEvent !== true){
            this.native_input.triggerEvent('change');
        }

        return this;
    }

    /**
     * Set the minimum allowed value
     *
     * @param {Number} min The minimum allowed value
     * @return {this}
     */
    setMin(min){
        const value = this.getValue();

        /**
         * The minimum allowed value
         * @type {Number}
         */
        this.min = min;

        if(this.min !== null && value !== null && value < this.min){
            this.setValue(this.min);
        }

        return this;
    }

    /**
     * Set the maximum allowed value
     *
     * @param {Number} max The maximum allowed value
     * @return {this}
     */
    setMax(max){
        const value = this.getValue();

        /**
         * The maximum allowed value
         * @type {Number}
         */
        this.max = max;

        if(this.max !== null && value !== null && value > this.max){
            this.setValue(this.max);
        }

        return this;
    }

    /**
     * Disable the input
     *
     * @return {this}
     */
    disable() {
        super.disable();

        if(this.clear_button){
            this.clear_button.attr('disabled', 'true');
        }

        if(this.in_button){
            this.in_button.attr('disabled', 'true');
        }
        if(this.out_button){
            this.out_button.attr('disabled', 'true');
        }

        return this;
    }

    /**
     * Enable the input
     *
     * @return {this}
     */
    enable() {
        super.enable();

        if(this.clear_button){
            this.clear_button.attr('disabled', null);
        }

        if(this.in_button){
            this.in_button.attr('disabled', null);
        }
        if(this.out_button){
            this.out_button.attr('disabled', null);
        }

        return this;
    }

    /**
     * Toggle the input's readonly state
     *
     * @param {Boolean} [readonly] Whether the input should be readonly, the current state is toggled if not provided
     * @return {this}
     */
    readonly(readonly){
        super.readonly(readonly);

        const readonly_attr = this.is_readonly ? "readonly" : null;

        if(this.clear_button){
            this.clear_button.attr('readonly', readonly_attr);
        }

        if(this.in_button){
            this.in_button.attr('readonly', readonly_attr);
        }

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
