/**
* Description
* @class editor.field.BorderRadius
* @extends editor.Field
*/

metaScore.namespace('editor.field').BorderRadius = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function BorderRadiusrField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BorderRadiusrField.parent.call(this, this.configs);

        this.addClass('borderradiusrfield');
    }

    metaScore.editor.Field.extend(BorderRadiusrField);

    /**
     * Description
     * @method setupUI
     * @return
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
     * Description
     * @method setValue
     * @param {} value
     * @param {} supressEvent
     * @return
     */
    BorderRadiusrField.prototype.setValue = function(value, supressEvent){
        BorderRadiusrField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);
    };

    /**
     * Description
     * @method onClick
     * @param {} evt
     * @return
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
     * Description
     * @method onOverlaySubmit
     * @param {} evt
     * @return
     */
    BorderRadiusrField.prototype.onOverlaySubmit = function(evt){
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
    BorderRadiusrField.prototype.onClearClick = function(evt){
        this.setValue('0px');
    };

    return BorderRadiusrField;

})();