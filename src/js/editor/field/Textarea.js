import Field from '../Field';
import Dom from '../../core/Dom';
import {uuid} from '../../core/utils/String';

export default class Textarea extends Field {

    /**
     * A multi-line text field based on an HTML textarea element
     *
     * @class TextareaField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('textareafield');
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
        const uid = `field-${uuid(5)}`;

        if(this.configs.label){
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new Dom('<textarea/>', {'id': uid})
            .addListener('change', this.onChange.bind(this))
            .appendTo(this.input_wrapper);
    }

}
