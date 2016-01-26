/**
 * @module Editor
 */

metaScore.namespace('editor.field').File = (function () {

    /**
     * A file field based on an HTML input[type=file] element
     *
     * @class FileField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.accept=null] The list of accepted file types (see {{#crossLink "editor.field.FileField/setAcceptedTypes:method"}}{{/crossLink}})
     */
    function FileField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        FileField.parent.call(this, this.configs);

        if(this.configs.accept){
            this.setAcceptedTypes(this.configs.accept);
        }

        this.addClass('filefield');
    }

    FileField.defaults = {
        'accept': null
    };

    metaScore.editor.Field.extend(FileField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    FileField.prototype.setupUI = function(){
        FileField.parent.prototype.setupUI.call(this);

        this.input.attr('type', 'file');

        this.current = new metaScore.Dom('<div/>')
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the accepted file types
     * 
     * @method setAcceptedTypes
     * @param {String} types A comma seperated list of accepted file types (ex: ".gif,.jpg,.png,.doc" or "audio/*,video/*,image/*")
     */
    FileField.prototype.setAcceptedTypes = function(types){
        this.input.attr('accept', types);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Object} [value] The new value
     * @param {String} value.name The file's name
     * @param {String} [value.url] The file's url
     * @chainable
     */
    FileField.prototype.setValue = function(value){
        var info;

        this.current.empty();

        this.input.val('');

        if(value && ('name' in value)){
            info = new metaScore.Dom('<a/>', {'text': value.name})
                .attr('target', '_blank')
                .appendTo(this.current);

            if('url' in value){
                info.attr('href', value.url);
            }
        }

        return this;
    };

    /**
     * Helper function to get a selected file from the HTML input field
     * 
     * @method getFile
     * @private
     * @param {Integer} [index] The index of the selected file, all files will be returned if not provided
     * @return {Mixed} The <a href="https://developer.mozilla.org/en-US/docs/Web/API/File" target="_blank">File</a> or <a href="https://developer.mozilla.org/en/docs/Web/API/FileList" target="_blank">FileList</a>
     */
    FileField.prototype.getFile = function(index){
        var files = this.input.get(0).files;

        if(index !== undefined){
            return files[index];
        }

        return files;
    };

    return FileField;

})();