/**
 * @module Editor
 */

metaScore.namespace('editor.field').Color = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

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
    function ColorField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        ColorField.parent.call(this, this.configs);

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

    metaScore.editor.Field.extend(ColorField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ColorField.prototype.setupUI = function(){
        var buttons;
        
        ColorField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', metaScore.Function.proxy(this.onClick, this));
            
        buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': metaScore.Locale.t('editor.field.Color.clear.tooltip', 'Clear value')})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(buttons);

        this.overlay = new metaScore.editor.overlay.ColorSelector()
            .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {Mixed} value The new color's value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ColorField.prototype.setValue = function(value, supressEvent){
        var rgba;

        this.value = value ? metaScore.Color.parse(value) : null;

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
    ColorField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.overlay
            .setValue(metaScore.Object.copy(this.value))
            .show();
    };

    /**
     * The overlay's submit event handler
     * 
     * @method onOverlaySubmit
     * @private
     * @param {Event} evt The event object
     */
    ColorField.prototype.onOverlaySubmit = function(evt){
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
    ColorField.prototype.onClearClick = function(evt){
        this.setValue("transparent");
    };

    return ColorField;

})();