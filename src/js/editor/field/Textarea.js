import Field from '../Field';
import Dom from '../../core/Dom';
import {uuid} from '../../core/utils/String';

/**
 * A multi-line text field based on an HTML textarea element
 */
export default class Textarea extends Field {

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
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        const uid = `field-${uuid(5)}`;

        if(this.configs.label){
            /**
             * A potential <label> element
             * @type {Dom}
             */
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        /**
         * The input-wrapper container
         * @type {Dom}
         */
        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        /**
         * The <textarea> element
         * @type {Dom}
         */
        this.input = new Dom('<textarea/>', {'id': uid})
            .addListener('change', this.onChange.bind(this))
            .appendTo(this.input_wrapper);
    }

}
