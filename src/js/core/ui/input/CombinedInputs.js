import Input from '../Input';
import { isArray } from '../../utils/Var';

import { className } from '../../../../css/core/ui/input/Combined.scss';

/**
 * An input than combines multiple sub-inputs.
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
 * @param {Mixed} value The new value
 * @param {Mixed} previous The old value
 */
export default class CombinedInputs extends Input {

    static defaults = Object.assign({}, super.defaults, {
        'inputs': []
    });

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Number} [value=null] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`combined ${className}`);

        this.reset(true);
    }

    /**
     * @inheritdoc
     */
    setupUI() {
        this.inputs = [];

        this.configs.inputs.forEach((value) => {
            const input = new value.type(value.configs)
                .addListener('valuechange', this.onInputValueChange.bind(this))
                .appendTo(this);

            this.inputs.push(input);
        });
    }

    /**
     * Get the input's id.
     * For use with labels.
     *
     * @param {boolean} from_input Whether to return the id of the first sub-input, or the combined input's id.
     * @return {string} The id.
     */
    getId(from_input = true) {
        if (from_input && this.inputs.length > 0) {
            return this.inputs[0].getId();
        }

        return this.id;
    }

    /**
     * Sub-input valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onInputValueChange(evt) {
        this.value = this.getValue();

        this.triggerEvent('valuechange', { 'input': this, 'value': this.getValue(), 'previous': this.previous_value }, true, false);

        this.previous_value = this.value;

        evt.stopPropagation();
    }

    /**
     * Get a list of the sub-input.
     *
     * @return {Array} The sub-inputs.
     */
    getInputs() {
        return this.inputs;
    }

    /**
     * @inheritdoc
     */
    setValue(value, supressEvent) {
        const inputs = this.getInputs();

        if (isArray(value)) {
            value.forEach((v, index) => {
                const input = inputs[index];
                if (input) {
                    input.setValue(v, supressEvent);
                }
            });
        }
        else {
            inputs.forEach((input) => {
                input.setValue(value);
            });
        }

        this.previous_value = this.getValue();

        return this;
    }

    /**
     * @inheritdoc
     */
    getValue() {
        return this.getInputs().map((input) => input.getValue());
    }

    /**
     * @inheritdoc
     */
    disable() {
        this.getInputs().forEach((input) => {
            input.disable();
        });

        return super.disable();
    }

    /**
     * @inheritdoc
     */
    enable() {
        this.getInputs().forEach((input) => {
            input.enable();
        });

        return super.enable();
    }

    /**
     * @inheritdoc
     */
    readonly(readonly) {
        this.getInputs().forEach((input) => {
            input.readonly(readonly);
        });

        return super.readonly(readonly);
    }

    /**
     * Set the focus on the first sub-input.
     *
     * @return {this}
     */
    focus() {
        const input = this.getInputs()[0];
        if (input) {
            input.focus();
        }

        return super.focus();
    }

    /**
     * Reset all sub-inputs.
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    reset(supressEvent) {
        this.getInputs().forEach((input) => {
            input.reset(supressEvent);
        });

        return super.reset(supressEvent);
    }

    /**
     * Report the validity of all sub-inputs.
     */
    reportValidity() {
        let valid = true;

        this.getInputs().forEach((input) => {
            valid = valid && input.reportValidity();
        });

        return valid;
    }

}
