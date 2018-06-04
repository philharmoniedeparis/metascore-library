import {Field} from '../Field';
import {Dom} from '../../core/Dom';
import {_Function} from '../../core/utils/Function';
import {_Object} from '../../core/utils/Object';

/**
 * Fired when a value is selected though a button click
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The clicked button's key
 */
var EVT_VALUECHANGE = 'valuechange';

export default class Buttons extends Field{

    /**
     * A simple buttons field based on HTML button elements
     *
     * @class ButtonsField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.buttons={}}] The list of buttons as name/attributes pairs
     */
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        this.buttons = {};

        // fix event handlers scope
        this.onClick = _Function.proxy(this.onClick, this);

        // call parent constructor
        super(this.configs);

        this.addClass('buttonsfield');
    }

    static getDefaults(){
        return {
            'buttons': {}
        };
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        var field = this;

        if(this.configs.label){
            this.label = new Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        _Object.each(this.configs.buttons, function(name, attr){
            this.buttons[name] = new Dom('<button/>', attr)
                .addListener('click', function(){
                    field.triggerEvent(EVT_VALUECHANGE, {'field': field, 'value': name}, true, false);
                })
                .appendTo(this.input_wrapper);
        }, this);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @chainable
     */
    setValue() {
        return this;
    };

    /**
     * Get the list of buttons
     * 
     * @method getButtons
     * @return {Object} The list of buttons as a name/Dom pair
     */
    getButtons() {
        return this.buttons;
    };

    /**
     * Get a button by name
     * 
     * @method getButton
     * @param {String} name The button's name
     * @return {Dom} The button's Dom object
     */
    getButton(name){
        return this.buttons[name];
    };
    
}