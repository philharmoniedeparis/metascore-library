import {Field} from '../Field';
import {Dom} from '../../core/Dom';
import {_Function} from '../../core/utils/Function';
import {BorderRadiusOverlay} from '../overlay/BorderRadius';

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
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super(this.configs);

        this.addClass('borderradiusrfield');
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        var buttons;
        
        super.setupUI();

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', _Function.proxy(this.onClick, this));
            
        buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        this.clear = new Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', _Function.proxy(this.onClearClick, this))
            .appendTo(buttons);

        this.overlay = new BorderRadiusOverlay()
            .addListener('submit', _Function.proxy(this.onOverlaySubmit, this));
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        BorderRadiusrField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);

        return this;
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        if(this.disabled){
            return;
        }

        this.overlay
            .setValue(this.value)
            .show();
    };

    /**
     * The overlay's submit event handler
     * 
     * @method onOverlaySubmit
     * @private
     * @param {Event} evt The event object
     */
    onOverlaySubmit(evt){
        var value = evt.detail.value,
            overlay = evt.detail.overlay;

        this.setValue(value);
    };

    /**
     * The clear button's click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    onClearClick(evt){
        this.setValue('0px');
    };
    
}