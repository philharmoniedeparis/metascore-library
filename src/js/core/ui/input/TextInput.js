import Input from '../Input';

import {className} from '../../../../css/core/ui/input/Text.scss';

/**
 * A single-line text field based on an HTML input[type=text] element
 */
export default class TextInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`text ${className}`);
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
     * @private
     */
    setupUI() {
        super.setupUI();

        this.native_input.attr('type', 'text');
    }

}
