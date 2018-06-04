import {Dom} from '../core/Dom';
import {_String} from '../core/utils/String';
import {_Function} from '../core/utils/Function';

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

export default class Field extends Dom{

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
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        super('<div/>', {'class': 'field'});

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

    static getDefaults(){
        return {
            'value': null,
            'required': false,
            'disabled': false,
            'readonly': false,
            'description': null
        };
    }

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

        this.input = new Dom('<input/>', {'id': uid})
            .addListener('change', _Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the description text
     *
     * @method setDescription
     * @param {String} description The description text
     * @chainable
     */
    setDescription(description){
        if(!('description' in this)){
            this.description = new Dom('<div/>', {'class': 'description'})
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
    onChange(evt){
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
    setValue(value, supressEvent){
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
    getValue() {
        return this.value;
    };

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    disable() {
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
    enable() {
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
    readonly(readonly){
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
    reset(supressEvent){
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
    
}