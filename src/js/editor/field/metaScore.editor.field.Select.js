/**
* Description
* @class editor.field.Select
* @extends editor.Field
*/

metaScore.namespace('editor.field').Select = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function SelectField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        SelectField.parent.call(this, this.configs);

        this.addClass('selectfield');
    }

    SelectField.defaults = {
        /**
        * Defines the maximum value allowed
        */
        options: {}
    };

    metaScore.editor.Field.extend(SelectField);

    /**
     * Description
     * @method setupUI
     * @return
     */
    SelectField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<select/>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);

            metaScore.Object.each(this.configs.options, function(key, value){
                this.addOption(key, value);
            }, this);
    };

    /**
     * Description
     * @method addOption
     * @param {} value
     * @param {} text
     * @chainable
     */
    SelectField.prototype.addGroup = function(label){
        var group = new metaScore.Dom('<optgroup/>', {'label': label});

        this.input.append(group);

        return group;
    };

    /**
     * Description
     * @method addOption
     * @param {} value
     * @param {} text
     * @chainable
     */
    SelectField.prototype.addOption = function(value, text, group){
        var option = new metaScore.Dom('<option/>', {'value': value, 'text': text});

        option.appendTo(group ? group : this.input);

        return option;
    };

    /**
     * Description
     * @method updateOption
     * @param {} value
     * @param {} text
     * @chainable
     */
    SelectField.prototype.updateOption = function(value, text, attr){
        var option = this.input.find('option[value="'+ value +'"]');

        option.text(text);

        return option;
    };

    /**
     * Description
     * @method removeOption
     * @param {} value
     * @chainable
     */
    SelectField.prototype.removeOption = function(value){
        var option = this.input.find('option[value="'+ value +'"]');

        option.remove();

        return option;
    };

    /**
     * Toggle the readonly attribute of the field
     * @method readonly
     * @return ThisExpression
     */
    SelectField.prototype.readonly = function(readonly){
        SelectField.parent.prototype.readonly.call(this, readonly);

        this.input.attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    };

    /**
     * Description
     * @method clear
     * @return ThisExpression
     */
    SelectField.prototype.clear = function(){
        this.input.empty();

        return this;
    };

    return SelectField;

})();