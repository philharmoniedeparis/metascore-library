/**
 * @module Editor
 */

metaScore.namespace('editor.field').Textarea = (function () {

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
    function TextareaField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextareaField.parent.call(this, this.configs);

        this.addClass('textareafield');
    }

    TextareaField.defaults = {
        'value': ''
    };

    metaScore.editor.Field.extend(TextareaField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TextareaField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<textarea></textarea>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    return TextareaField;

})();