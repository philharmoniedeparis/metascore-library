import Input from '../Input';
import Dom from '../../Dom';
import Button from '../Button';
import Locale from '../../Locale';
import {toRGBA} from '../../utils/Color';
import ColorSelector from '../overlay/ColorSelector';

import {className} from '../../../../css/core/ui/input/Color.scss';
/**
 * A color selection field
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
export default class ColorInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value={r:255, g:255, b:255, a:1}}] The default value (see {@link toRGBA} for valid values)
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`color ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            value: {
                r: 255,
                g: 255,
                b: 255,
                a: 1
            }
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
            .attr('readonly', 'readonly')
            .addListener('click', this.onClick.bind(this));

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        new Button({'icon': 'clear'})
            .attr('title', Locale.t('core.ui.input.ColorInput.clear.tooltip', 'Clear value'))
            .addListener('click', this.onClearClick.bind(this))
            .appendTo(buttons);

        /**
         * The overlay
         * @type {ColorSelector}
         */
        this.overlay = new ColorSelector()
            .addListener('submit', this.onOverlaySubmit.bind(this));
    }

    /**
     * Set the field'S value
     *
     * @param {Mixed} value The new color's value (see {@link toRGBA} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        /**
         * The current value
         * @type {Object}
         */
        this.value = value ? toRGBA(value) : null;

        const rgba = this.value ? `rgba(${this.value.r},${this.value.g},${this.value.b},${this.value.a})` : null;

        this.native_input
            .attr('title', rgba)
            .css('background-color', rgba);

        if(supressEvent !== true){
            this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
        }

        return this;

    }

    /**
     * The click event handler
     *
     * @private
     */
    onClick(){
        if(this.disabled){
            return;
        }

        this.overlay
            .setValue(Object.assign({}, this.value))
            .show();
    }

    /**
     * The overlay's submit event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onOverlaySubmit(evt){
        this.setValue(evt.detail.value);
    }

    /**
     * The clear button click event handler
     *
     * @private
     */
    onClearClick(){
        this.setValue("transparent");
    }

}