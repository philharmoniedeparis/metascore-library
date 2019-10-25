import Input from '../Input';
import Dom from '../../Dom';
import Button from '../Button';
import BorderRadiusOverlay from '../overlay/BorderRadius';

import clear_icon from '../../../../img/core/ui/input/borderradius/clear.svg?svg-sprite';

import {className} from '../../../../css/core/ui/input/BorderRadius.scss';

/**
 * A complex input for defining CSS border radius values
 */
export default class BorderRadiusInput extends Input{

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'overlay': {}
        });
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [format="css"] The format of the value (css, object)
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`borderradius ${className}`);
    }

    /**
     * Setup the input's UI
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

        /**
         * The clear button
         * @type {Dom}
         */
        this.clear = new Button({'icon': clear_icon})
            .data('action', 'clear')
            .addListener('click', this.onClearClick.bind(this))
            .appendTo(buttons);

        /**
         * The overlay
         * @type {BorderRadiusOverlay}
         */
        this.overlay = new BorderRadiusOverlay(Object.assign({
                'autoShow': false
            }, this.configs.overlay))
            .addListener('submit', this.onOverlaySubmit.bind(this));
    }

    /**
     * Set the input's value
     *
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        super.setValue(value, supressEvent);

        this.native_input.attr('title', value);

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
