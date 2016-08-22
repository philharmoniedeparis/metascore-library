/**
 * @module Editor
 */

metaScore.namespace('editor.field').Image = (function () {

    /**
     * Fired when the external filebrowser should be opened
     *
     * @event filebrowser
     * @param {Function} callback The callback to invoke once a file is selected throught the external file browser
     */
    var EVT_FILEBROWSER = 'filebrowser';

    /**
     * Fired when the resize button is clicked
     *
     * @event resize
     * @param {Object} field The field instance
     * @param {Mixed} value The field value
     */
    var EVT_RESIZE = 'resize';

    /**
     * An image field wich depends on an external file browser to function
     *
     * @class ImageField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.placeholder="Browse..."] A placeholder text
     * @param {Boolean} [configs.resizeButton=false] Whether to show the resize button
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
        'placeholder': metaScore.Locale.t('editor.field.Image.placeholder', 'Browse...')
    };

    metaScore.editor.Field.extend(ImageField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ImageField.prototype.setupUI = function(){
        var buttons;
        
        ImageField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .attr('placeholder', this.configs.placeholder)
            .addListener('click', metaScore.Function.proxy(this.onClick, this));
            
        buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);
            
        if(this.configs.resizeButton){
            this.resize = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'resize', 'title': metaScore.Locale.t('editor.field.Image.resize.tooltip', 'Adapt container size to image')})
                .addListener('click', metaScore.Function.proxy(this.onResizeClick, this))
                .appendTo(buttons);
        }

        this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': metaScore.Locale.t('editor.field.Image.clear.tooltip', 'Clear value')})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(buttons);
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {String} value The image file's url
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ImageField.prototype.setValue = function(value, supressEvent){
        ImageField.parent.prototype.setValue.call(this, value, supressEvent);

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
    ImageField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.triggerEvent(EVT_FILEBROWSER, {'callback': this.onFileSelect}, true, false);
    };

    /**
     * The resize button click event handler
     * 
     * @method onResizeClick
     * @private
     * @param {Event} evt The event object
     */
    ImageField.prototype.onResizeClick = function(evt){
        this.triggerEvent(EVT_RESIZE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    ImageField.prototype.onClearClick = function(evt){
        this.setValue(null);
    };

    /**
     * The file select event handler
     * 
     * @method onFileSelect
     * @private
     * @param {String} url The image file's url
     */
    ImageField.prototype.onFileSelect = function(url){
        this.setValue(url);
    };

    return ImageField;

})();