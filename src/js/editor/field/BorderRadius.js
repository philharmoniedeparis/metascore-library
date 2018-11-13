import Field from '../Field';
import Dom from '../../core/Dom';
import BorderRadiusOverlay from '../overlay/BorderRadius';

import {className} from '../../../css/editor/field/BorderRadius.less';

/**
 * A complex field for defining CSS border radius values
 */
export default class BorderRadius extends Field{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`borderradius ${className}`);
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', this.onClick.bind(this));

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        /**
         * The clear button
         * @type {Dom}
         */
        this.clear = new Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', this.onClearClick.bind(this))
            .appendTo(buttons);

        /**
         * The overlay
         * @type {BorderRadiusOverlay}
         */
        this.overlay = new BorderRadiusOverlay()
            .addListener('submit', this.onOverlaySubmit.bind(this));
    }

    /**
     * Set the field's value
     *
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        super.setValue(value, supressEvent);

        this.input.attr('title', value);

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
            .setValue(this.value)
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
     * The clear button's click event handler
     *
     * @private
     */
    onClearClick(){
        this.setValue('0px');
    }

}
