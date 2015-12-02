/**
* Description
* @class editor.field.Image
* @extends editor.Field
*/

metaScore.namespace('editor.field').Image = (function () {

    /**
     * Fired when the external filebrowser should be opened
     *
     * @event filebrowser
     * @param {Function} callback The callback to invoke once a file is selected throught the external filebrowser
     */
    var EVT_FILEBROWSER = 'filebrowser';

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function ImageField(configs) {
        this.configs = this.getConfigs(configs);

        // fix event handlers scope
        this.onFileSelect = metaScore.Function.proxy(this.onFileSelect, this);

        // call parent constructor
        ImageField.parent.call(this, this.configs);

        this.addClass('imagefield');
    }

    ImageField.defaults = {
        /**
        * Defines the placeholder
        */
        placeholder: metaScore.Locale.t('editor.field.Image.placeholder', 'Browse...')
    };

    metaScore.editor.Field.extend(ImageField);

    /**
     * Description
     * @method setupUI
     * @return
     */
    ImageField.prototype.setupUI = function(){
        ImageField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .attr('placeholder', this.configs.placeholder)
            .addListener('click', metaScore.Function.proxy(this.onClick, this));

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
    ImageField.prototype.setValue = function(value, supressEvent){
        ImageField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);
    };

    /**
     * Description
     * @method onClick
     * @param {} evt
     * @return
     */
    ImageField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.triggerEvent(EVT_FILEBROWSER, {'callback': this.onFileSelect}, true, false);
    };

    /**
     * Description
     * @method onClearClick
     * @param {} evt
     * @return
     */
    ImageField.prototype.onClearClick = function(evt){
        this.setValue(null);
    };

    /**
     * Description
     * @method onFileSelect
     * @param {} url
     * @return
     */
    ImageField.prototype.onFileSelect = function(url){
        this.setValue(url);
    };

    return ImageField;

})();