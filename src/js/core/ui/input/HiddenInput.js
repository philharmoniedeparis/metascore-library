
import Input from '../Input';

/**
 * A hidden input based on an HTML input[type=hidden] element
 */
export default class HiddenInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('hidden');
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.native_input.attr('type', 'hidden');
    }

}
