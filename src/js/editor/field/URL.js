
import Field from '../Field';

export default class URL extends Field {

    /**
     * A single-line text field based on an HTML input[type=text] element
     *
     * @class URLField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('urlfield');
    }

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

        this.input.attr('type', 'url');
    }

}
