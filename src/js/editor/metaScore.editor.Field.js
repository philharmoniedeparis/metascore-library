/**
 * @module Editor
 */

metaScore.namespace('editor').Field = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * Fired when the field is reset
     *
     * @event reset
     * @param {Object} field The field instance
     */
    var EVT_RESET = 'reset';

    /**
     * A generic field based on an HTML input element
     *
     * @class Field
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.value=null] The default value
     * @param {Boolean} [configs.required=false] Whether the field is required
     * @param {Boolean} [configs.disabled=false] Whether the field is disabled by default
     * @param {Boolean} [configs.readonly=false] Whether the field is readonly by default
     * @param {String} [configs.description=''] A description to add to the field
     */
    function Field(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<div/>', {'class': 'field'});

        this.setupUI();

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        if(this.input){
            if(this.configs.name){
                this.input.attr('name', this.configs.name);
            }

            if(this.configs.required){
                this.addClass('required');
                this.input.attr('required', '');
            }
        }

        if(this.configs.description){
            this.setDescription(this.configs.description);
        }
        
        this.reset(true);
    }

    Field.defaults = {
        'value': null,
        'required': false,
        'disabled': false,
        'readonly': false,
        'description': null
    };

    metaScore.Dom.extend(Field);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    Field.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the description text
     *
     * @method setDescription
     * @param {String} description The description text
     * @chainable
     */
    Field.prototype.setDescription = function(description){
        if(!('description' in this)){
            this.description = new metaScore.Dom('<div/>', {'class': 'description'})
                .appendTo(this.input_wrapper);
        }

        this.description.text(description);
        
        return this;
    };

    /**
     * The change event handler
     *
     * @method onChange
     * @param {Event} evt The event object
     * @private
     */
    Field.prototype.onChange = function(evt){
        this.value = this.input.val();

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
    Field.prototype.setValue = function(value, supressEvent){
        this.input.val(value);
        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }
        
        return this;
    };

    /**
     * Get the field's current value
     *
     * @method getValue
     * @return {Mixed} The value
     */
    Field.prototype.getValue = function(){
        return this.value;
    };

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    Field.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        if(this.input){
            this.input.attr('disabled', 'disabled');
        }

        return this;
    };

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    Field.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        if(this.input){
            this.input.attr('disabled', null);
        }

        return this;
    };

    /**
     * Toggle the field's readonly state
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    Field.prototype.readonly = function(readonly){
        this.is_readonly = readonly === true;

        this.toggleClass('readonly', this.is_readonly);

        if(this.input){
            this.input.attr('readonly', this.is_readonly ? "readonly" : null);
        }

        return this;
    };
    
    /**
     * Reset the field's configs
     *
     * @method reset
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Field.prototype.reset = function(supressEvent){
        this.setValue(this.configs.value);

        if(this.configs.disabled){
            this.disable();
        }
        else{
            this.enable();
        }

        this.readonly(this.configs.readonly);

        if(supressEvent !== true){
            this.triggerEvent(EVT_RESET, {'field': this}, true, false);
        }

        return this;
    };

    return Field;

})();