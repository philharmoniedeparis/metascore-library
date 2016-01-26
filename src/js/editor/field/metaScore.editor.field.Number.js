/**
 * @module Editor
 */

metaScore.namespace('editor.field').Number = (function () {

    /**
     * A number field based on an HTML input[type=number] element
     *
     * @class NumberField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=null] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     */
    function NumberField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        NumberField.parent.call(this, this.configs);

        this.addClass('numberfield');
    }

    NumberField.defaults = {
        'value': 0,
        'min': null,
        'max': null
    };

    metaScore.editor.Field.extend(NumberField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
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