/**
 * @module Editor
 */

metaScore.namespace('editor.field').Boolean = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A boolean field based on an HTML input[type=checkbox] element
     *
     * @class Boolean
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.checked=false] Whether the field is checked by default
     * @param {Boolean} [configs.checked_value=true] The value when checked
     * @param {Boolean} [configs.unchecked_value=false] The value when unchecked
     */
    function BooleanField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BooleanField.parent.call(this, this.configs);

        this.addClass('booleanfield');

        this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
    }

    BooleanField.defaults = {
        'checked': false,
        'checked_value': true,
        'unchecked_value': false
    };

    metaScore.editor.Field.extend(BooleanField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    BooleanField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'checkbox', 'id': uid})
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    BooleanField.prototype.onClick = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
        }
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    BooleanField.prototype.onChange = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
            return;
        }

        if(this.input.is(":checked")){
            this.value = this.configs.checked_value;
            this.addClass('checked');
        }
        else{
            this.value = this.configs.unchecked_value;
            this.removeClass('checked');
        }

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    BooleanField.prototype.setValue = function(value, supressEvent){
        this.input.get(0).checked = value === this.configs.checked_value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    };

    return BooleanField;

})();