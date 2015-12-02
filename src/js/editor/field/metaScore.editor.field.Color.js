/**
* Description
* @class editor.field.Color
* @extends editor.Field
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
     * Description
     * @constructor
     * @param {} configs
     */
    function ColorField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        ColorField.parent.call(this, this.configs);

        this.addClass('colorfield');
    }

    ColorField.defaults = {
        /**
        * Defines the default value
        */
        value: {
            r: 255,
            g: 255,
            b: 255,
            a: 1
        }
    };

    metaScore.editor.Field.extend(ColorField);

    /**
     * Description
     * @method setupUI
     * @return 
     */
    ColorField.prototype.setupUI = function(){
        ColorField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', metaScore.Function.proxy(this.onClick, this));

        this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(this.input_wrapper);

        this.overlay = new metaScore.editor.overlay.ColorSelector()
            .addListener('submit', metaScore.Function.proxy(this.onColorSubmit, this));
    };

    /**
     * Description
     * @method setValue
     * @param {} value
     * @param {} supressEvent
     * @return 
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

    };

    /**
     * Description
     * @method onClick
     * @param {} evt
     * @return 
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
     * Description
     * @method onColorSubmit
     * @param {} evt
     * @return 
     */
    ColorField.prototype.onColorSubmit = function(evt){
        var value = evt.detail.value,
            overlay = evt.detail.overlay;

        this.setValue(value);
    };

    /**
     * Description
     * @method onClearClick
     * @param {} evt
     * @return 
     */
    ColorField.prototype.onClearClick = function(evt){
        this.setValue(null);
    };

    return ColorField;

})();