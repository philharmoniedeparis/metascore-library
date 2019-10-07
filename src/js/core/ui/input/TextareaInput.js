import Input from '../Input';
import Dom from '../../Dom';

/**
 * A multi-line text input based on an HTML textarea element
 */
export default class TextareaInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('textarea');
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'value': ''
        });
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        const id = this.getId();

        /**
         * The <textarea> element
         * @type {Dom}
         */
        this.native_input = new Dom('<textarea/>', {'id': id})
            .addListener('input', this.onInput.bind(this))
            .addListener('change', this.onChange.bind(this))
            .appendTo(this);
    }

}
