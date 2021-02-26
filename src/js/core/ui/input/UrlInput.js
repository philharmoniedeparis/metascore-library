import Input from '../Input';

/**
 * A single-line text input based on an HTML input[type=text] element
 */
export default class UrlInput extends Input {

    static defaults = Object.assign({}, super.defaults, {
        'value': ''
    });

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('url');
    }

    /**
     * @inheritdoc
     */
    setupUI() {
        super.setupUI();

        this.native_input.attr('type', 'url');
    }

}
