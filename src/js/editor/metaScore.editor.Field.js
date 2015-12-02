/**
* Description
* @class editor.Field
* @extends Dom
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
     * Description
     * @constructor
     * @param {} configs
     */
    function Field(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<div/>', {'class': 'field'});

        this.setupUI();

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        if(this.configs.value !== null){
            this.setValue(this.configs.value);
        }

        if(this.input){
            if(this.configs.name){
                this.input.attr('name', this.configs.name);
            }

            if(this.configs.required){
                this.addClass('required');
                this.input.attr('required', '');
            }
        }

        if(this.configs.disabled){
            this.disable();
        }
        else{
            this.enable();
        }

        if(this.configs.description){
            this.setDescription(this.configs.description);
        }

        this.readonly(this.configs.readonly);
    }

    Field.defaults = {
        /**
        * Defines the default value
        */
        'value': null,

        /**
        * Defines whether the field is required
        */
        'required': false,

        /**
        * Defines whether the field is disabled by default
        */
        'disabled': false,

        /**
        * Defines whether the field is readonly by default
        */
        'readonly': false,

        /**
        * A description to add to the field
        */
        'description': null
    };

    metaScore.Dom.extend(Field);

    /**
     * Description
     * @method setupUI
     * @return 
     */
    Field.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }
            
        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Description
     * @method setDescription
     * @return 
     */
    Field.prototype.setDescription = function(description){
        if(!('description' in this)){
            this.description = new metaScore.Dom('<div/>', {'class': 'description'})
                .appendTo(this.input_wrapper);
        }
        
        this.description.text(description);    
    };

    /**
     * Description
     * @method onChange
     * @param {} evt
     * @return 
     */
    Field.prototype.onChange = function(evt){
        this.value = this.input.val();

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Description
     * @method setValue
     * @param {} value
     * @param {} supressEvent
     * @return 
     */
    Field.prototype.setValue = function(value, supressEvent){
        this.input.val(value);
        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }
    };

    /**
     * Description
     * @method getValue
     * @return MemberExpression
     */
    Field.prototype.getValue = function(){
        return this.value;
    };

    /**
     * Disable the field
     * @method disable
     * @return ThisExpression
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
     * @method enable
     * @return ThisExpression
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
     * Toggle the readonly attribute of the field
     * @method readonly
     * @return ThisExpression
     */
    Field.prototype.readonly = function(readonly){
        this.is_readonly = readonly === true;

        this.toggleClass('readonly', this.is_readonly);
        
        if(this.input){
            this.input.attr('readonly', this.is_readonly ? "readonly" : null);
        }

        return this;
    };

    return Field;

})();