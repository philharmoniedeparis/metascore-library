/**
 * @module Editor
 */

metaScore.namespace('editor.field').BorderRadius = (function () {

    /**
     * A complex field for defining CSS border radius values
     * 
     * @class BorderRadius
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     */
    function BorderRadiusrField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BorderRadiusrField.parent.call(this, this.configs);

        this.addClass('borderradiusrfield');
    }

    metaScore.editor.Field.extend(BorderRadiusrField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    BorderRadiusrField.prototype.setupUI = function(){
        BorderRadiusrField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', metaScore.Function.proxy(this.onClick, this));

        this.overlay = new metaScore.editor.overlay.BorderRadius()
            .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));

        this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    BorderRadiusrField.prototype.setValue = function(value, supressEvent){
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
    BorderRadiusrField.prototype.onClick = function(evt){
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
    BorderRadiusrField.prototype.onOverlaySubmit = function(evt){
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
    BorderRadiusrField.prototype.onClearClick = function(evt){
        this.setValue('0px');
    };

    return BorderRadiusrField;

})();