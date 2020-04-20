
import Field from '../Field';

/**
 * A hidden field based on an HTML input[type=hidden] element
 */
export default class Hidden extends Field {

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
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input.attr('type', 'hidden');
    }

}