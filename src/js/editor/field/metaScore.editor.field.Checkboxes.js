/**
 * @module Editor
 */

metaScore.namespace('editor.field').Checkboxes = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A select list field based on an HTML select element
     *
     * @class CheckboxesField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.options=[]] A list of select options as objects with 'value' and 'text' keys
     */
    function CheckboxesField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        CheckboxesField.parent.call(this, this.configs);

        this.addClass('checkboxesfield');
    }

    CheckboxesField.defaults = {
        'options': []
    };

    metaScore.editor.Field.extend(CheckboxesField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    CheckboxesField.prototype.setupUI = function(){
        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.checkboxes_wrapper = new metaScore.Dom('<div/>', {'class': 'checkboxes-wrapper'})
            .appendTo(this.input_wrapper);
        
        metaScore.Array.each(this.configs.options, function(index, option){
            this.addCheckbox(option.value, option.text);
        }, this);
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    CheckboxesField.prototype.onClick = function(evt){
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
    CheckboxesField.prototype.onChange = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
            return;
        }
        
        this.value = [];
        
        this.checkboxes_wrapper.find('input').each(function(index, checkbox_el){
            var checkbox = new metaScore.Dom(checkbox_el);
            
            if(checkbox.is(":checked")){
                this.value.push(checkbox.val());
            }
        }, this);

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Array} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    CheckboxesField.prototype.setValue = function(value, supressEvent){
        var arr_value = metaScore.Var.is(value, "array") ? value : [value];
        
        this.checkboxes_wrapper.find('input').each(function(index, checkbox_el){
            var checkbox = new metaScore.Dom(checkbox_el);
            
            checkbox_el.checked = metaScore.Array.inArray(checkbox.attr('value'), arr_value) >= 0;
            
            if(supressEvent !== true){
                checkbox.triggerEvent('change');
            }   
        }, this);

        return this;
    };

    /**
     * Add a checkbox to the list of checkboxes
     * 
     * @method addCheckbox
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @return {Dom} The created Dom object
     */
    CheckboxesField.prototype.addCheckbox = function(value, text){
        var uid, checkbox_wrapper, label, checkbox;
        
        uid = 'checkbox-'+ metaScore.String.uuid(5);
        
        checkbox_wrapper = new metaScore.Dom('<div/>', {'class': 'checkbox-wrapper'})
            .appendTo(this.checkboxes_wrapper);
        
        checkbox = new metaScore.Dom('<input/>', {'id': uid, 'type': 'checkbox', 'value': value})
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(checkbox_wrapper);

        label = new metaScore.Dom('<label/>', {'text': text, 'for': uid})
            .appendTo(checkbox_wrapper);
            
        if(this.configs.name){
            checkbox.attr('name', this.configs.name);
        }
            
        return checkbox;
    };

    /**
     * Remove a checkbox by value
     * 
     * @method removeCheckbox
     * @param {String} value The value of the option to remove
     * @return {Dom} The checkbox's Dom object
     */
    CheckboxesField.prototype.removeCheckbox = function(value){
        var checkbox = this.checkboxes_wrapper.find('input[value="'+ value +'"]');

        checkbox.parents().remove();

        return checkbox;
    };

    /**
     * Remove all groups and options
     * 
     * @method clear
     * @chainable
     */
    CheckboxesField.prototype.clear = function(){
        this.checkboxes_wrapper.empty();

        return this;
    };

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    CheckboxesField.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        this.checkboxes_wrapper.find('input').attr('disabled', 'disabled');

        return this;
    };

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    CheckboxesField.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        this.checkboxes_wrapper.find('input').attr('disabled', null);

        return this;
    };

    /**
     * Toggle the readonly attribute of the field
     * 
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    CheckboxesField.prototype.readonly = function(readonly){
        CheckboxesField.parent.prototype.readonly.apply(this, arguments);

        this.checkboxes_wrapper.find('input').attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    };

    return CheckboxesField;

})();