import {Field} from '../Field';
import {Dom} from '../../core/Dom';
import {_Function} from '../../core/utils/Function';
import {_String} from '../../core/utils/String';

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
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super(this.configs);

        this.addClass('textareafield');
    }

    TextareaField.defaults = {
        'value': ''
    };

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        var uid = 'field-'+ _String.uuid(5);

        if(this.configs.label){
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new Dom('<textarea></textarea>', {'id': uid})
            .addListener('change', _Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

}