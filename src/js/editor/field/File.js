import Field from '../Field';
import Dom from '../../core/Dom';

export default class File extends Field {

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
    constructor(configs) {
        // call parent constructor
        super(configs);

        if(this.configs.accept){
            this.setAcceptedTypes(this.configs.accept);
        }

        this.addClass('filefield');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'accept': null
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

        this.input.attr('type', 'file');

        this.current = new Dom('<div/>')
            .appendTo(this.input_wrapper);
    }

    /**
     * Set the accepted file types
     *
     * @method setAcceptedTypes
     * @param {String} types A comma seperated list of accepted file types (ex: ".gif,.jpg,.png,.doc" or "audio/*,video/*,image/*")
     */
    setAcceptedTypes(types){
        this.input.attr('accept', types);
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Object} [value] The new value
     * @param {String} value.name The file's name
     * @param {String} [value.url] The file's url
     * @chainable
     */
    setValue(value){
        let info;

        this.current.empty();

        this.input.val('');

        if(value && ('name' in value)){
            info = new Dom('<a/>', {'text': value.name})
                .attr('target', '_blank')
                .appendTo(this.current);

            if('url' in value){
                info.attr('href', value.url);
            }

            this.input.attr('required', null);
        }
        else if(this.configs.required){
            this.input.attr('required', '');
        }

        return this;
    }

    /**
     * Helper function to get a selected file from the HTML input field
     *
     * @method getFile
     * @private
     * @param {Integer} [index] The index of the selected file, all files will be returned if not provided
     * @return {Mixed} The <a href="https://developer.mozilla.org/en-US/docs/Web/API/File" target="_blank">File</a> or <a href="https://developer.mozilla.org/en/docs/Web/API/FileList" target="_blank">FileList</a>
     */
    getFile(index){
        const files = this.input.get(0).files;

        if(index !== undefined){
            return files[index];
        }

        return files;
    }

}