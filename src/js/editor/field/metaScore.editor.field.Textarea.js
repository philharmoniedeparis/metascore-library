/**
* Description
* @class editor.field.Textarea
* @extends editor.Field
*/

metaScore.namespace('editor.field').Textarea = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function TextareaField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextareaField.parent.call(this, this.configs);

        this.addClass('textareafield');
    }

    TextareaField.defaults = {
        /**
        * Defines the default value
        */
        'value': ''
    };

    metaScore.editor.Field.extend(TextareaField);

    /**
     * Description
     * @method setupUI
     * @return 
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