import Input from '../Input';
import Dom from '../../Dom';

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

        this.addClass('file');
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
            .addListener('change', this.onChange.bind(this))
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

        this.triggerEvent('valuechange', {'input': this, 'value': this.value, 'files': this.files}, true, false);
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
