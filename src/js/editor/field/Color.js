import Field from '../Field';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {toRGBA} from '../../core/utils/Color';
import ColorSelector from '../overlay/ColorSelector';

import '../../../css/editor/field/Color.less';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

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
        // call parent constructor
        super(configs);

        this.addClass('colorfield');
    }

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
     * @method setupUI
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', this.onClick.bind(this));

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        new Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': Locale.t('editor.field.Color.clear.tooltip', 'Clear value')})
            .addListener('click', this.onClearClick.bind(this))
            .appendTo(buttons);

        this.overlay = new ColorSelector()
            .addListener('submit', this.onOverlaySubmit.bind(this));
    }

    /**
     * Set the field'S value
     *
     * @method setValue
     * @param {Mixed} value The new color's value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        this.value = value ? toRGBA(value) : null;

        const rgba = this.value ? `rgba(${this.value.r},${this.value.g},${this.value.b},${this.value.a})` : null;

        this.input
            .attr('title', rgba)
            .css('background-color', rgba);

        if(supressEvent !== true){
            this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
        }

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
            .setValue(Object.assign({}, this.value))
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
     * The clear button click event handler
     *
     * @method onClearClick
     * @private
     */
    onClearClick(){
        this.setValue("transparent");
    }

}
