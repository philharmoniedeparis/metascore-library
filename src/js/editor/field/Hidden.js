
import Field from '../Field';

export default class Hidden extends Field {

    /**
     * A hidden field based on an HTML input[type=hidden] element
     *
     * @class HiddenField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('hiddenfield');
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input.attr('type', 'hidden');
    }

}
