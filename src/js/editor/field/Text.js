
import Field from '../Field';

/**
 * A single-line text field based on an HTML input[type=text] element
 */
export default class Text extends Field {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('text');
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
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input.attr('type', 'text');
    }

}
