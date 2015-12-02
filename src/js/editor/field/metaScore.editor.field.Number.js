/**
* Description
* @class editor.field.Number
* @extends editor.Field
*/

metaScore.namespace('editor.field').Number = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function NumberField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        NumberField.parent.call(this, this.configs);

        this.addClass('numberfield');
    }

    NumberField.defaults = {
        /**
        * Defines the default value
        */
        value: 0,

        /**
        * Defines the minimum value allowed
        */
        min: null,

        /**
        * Defines the maximum value allowed
        */
        max: null
    };

    metaScore.editor.Field.extend(NumberField);

    /**
     * Description
     * @method setupUI
     * @return
     */
    NumberField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'number', 'id': uid, 'min': this.configs.min, 'max': this.configs.max, 'step': this.configs.step})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    return NumberField;

})();