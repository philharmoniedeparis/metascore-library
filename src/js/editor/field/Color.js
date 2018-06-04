import {Field} from '../Field';
import {Dom} from '../../core/Dom';
import {Locale} from '../../core/Locale';
import {_Function} from '../../core/utils/Function';
import {_Object} from '../../core/utils/Object';
import {_Color} from '../../core/utils/Color';
import {ColorSelector} from '../overlay/ColorSelector';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
var EVT_VALUECHANGE = 'valuechange';

export default class Color extends Field {

    /**
     * A color selection field
     *
     * @class ColorField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.value={r:255, g:255, b:255, a:1}}] The default value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     */
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super(this.configs);

        this.addClass('colorfield');
    }

    ColorField.defaults = {
        value: {
            r: 255,
            g: 255,
            b: 255,
            a: 1
        }
    };

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

        new Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': _Locale.t('editor.field.Color.clear.tooltip', 'Clear value')})
            .addListener('click', _Function.proxy(this.onClearClick, this))
            .appendTo(buttons);

        this.overlay = new ColorSelector()
            .addListener('submit', _Function.proxy(this.onOverlaySubmit, this));
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {Mixed} value The new color's value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        var rgba;

        this.value = value ? _Color.parse(value) : null;

        rgba = this.value ? 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')' : null;

        this.input
            .attr('title', rgba)
            .css('background-color', rgba);

        if(supressEvent !== true){
            this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
        }

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
            .setValue(_Object.copy(this.value))
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
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    onClearClick(evt){
        this.setValue("transparent");
    };

}