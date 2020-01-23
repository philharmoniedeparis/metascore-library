import Input from '../Input';
import Dom from '../../Dom';
import Locale from '../../Locale';

import {className} from '../../../../css/core/ui/input/File.scss';

/**
 * A file input based on an HTML input[type=file] element
 */
export default class FileInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`file ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'multiple': false,
            'accept': null,
            'emptyLabel': Locale.t('core.input.FileInput.emptyLabel', 'Browse...'),
            'multipleLabel': Locale.t('core.input.FileInput.multipleLabel', '%count files selected'),
        });
    }

    /**
     * @inheritdoc
     */
    setupUI() {
        const id = this.getId();

        /**
         * The <textarea> element
         * @type {Dom}
         */
        this.native_input = new Dom('<input/>', {'id': id, 'type': 'file'})
            .attr('multiple', this.configs.multiple ? 'multiple' : null)
            .attr('accept', this.configs.accept ? this.configs.accept : null)
            .addListener('change', this.onChange.bind(this))
            .addListener('focus', this.onFocus.bind(this))
            .addListener('blur', this.onBlur.bind(this))
            .appendTo(this);

        this.label = new Dom('<label/>', {'for': id, 'text': this.configs.emptyLabel})
            .appendTo(this);
    }

    /**
     * @inheritdoc
     */
    onChange(){
        /**
         * The selected files
         * @type {FileList}
         */
        this.files = this.native_input.get(0).files;

        /**
         * The current value
         * @type {String}
         */
        this.value = this.native_input.val();

        // Update the label text
        let label_text = this.configs.emptyLabel;
        if(this.files && this.files.length > 0){
            if(this.files.length > 1){
                label_text = Locale.formatString(this.configs.multipleLabel, {'%count': this.files.length});
            }
            else{
                label_text = this.files.item(0).name;
            }
        }
        this.label.text(label_text);

        this.triggerEvent('valuechange', {'input': this, 'value': this.value, 'previous': this.previous_value, 'files': this.files}, true, false);

        this.previous_value = this.value;
    }

    /**
     * The focus event handler
     *
     * @private
     */
    onFocus(){
        // CSS input[type="file"]:focus doesn't work in some browsers (namely FireFox)
        this.native_input.addClass('has-focus');
    }

    /**
     * The blur event handler
     *
     * @private
     */
    onBlur(){
        this.native_input.removeClass('has-focus');
    }

    /**
     * Get the input's files
     *
     * @return {FileList} The value
     */
    getFiles() {
        return this.files;
    }

}
