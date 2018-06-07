import Field from '../Field';
import Dom from '../../core/Dom';
import BorderRadiusOverlay from '../overlay/BorderRadius';

export default class BorderRadius extends Field{

    /**
     * A complex field for defining CSS border radius values
     *
     * @class BorderRadius
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('borderradiusrfield');
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

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', this.onClick.bind(this));

        buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        this.clear = new Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', this.onClearClick.bind(this))
            .appendTo(buttons);

        this.overlay = new BorderRadiusOverlay()
            .addListener('submit', this.onOverlaySubmit.bind(this));
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        super.setValue(value, supressEvent);

        this.input.attr('title', value);

        return this;
    }

    /**
     * The click event handler
     *
     * @method onClick
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
     * @method onOverlaySubmit
     * @private
     * @param {Event} evt The event object
     */
    onOverlaySubmit(evt){
        this.setValue(evt.detail.value);
    }

    /**
     * The clear button's click event handler
     *
     * @method onClearClick
     * @private
     */
    onClearClick(){
        this.setValue('0px');
    }

}
