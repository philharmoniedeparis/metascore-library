/**
 * @module Editor
 */

metaScore.namespace('editor.field').Buttons = (function () {

    /**
     * Fired when a value is selected though a button click
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The clicked button's key
     */
    var EVT_VALUECHANGE = 'valuechange';

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
    function ButtonsField(configs) {
        this.configs = this.getConfigs(configs);

        this.buttons = {};

        // fix event handlers scope
        this.onClick = metaScore.Function.proxy(this.onClick, this);

        // call parent constructor
        ButtonsField.parent.call(this, this.configs);

        this.addClass('buttonsfield');
    }

    ButtonsField.defaults = {
        'buttons': {}
    };

    metaScore.editor.Field.extend(ButtonsField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ButtonsField.prototype.setupUI = function(){
        var field = this;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        metaScore.Object.each(this.configs.buttons, function(name, attr){
            this.buttons[name] = new metaScore.Dom('<button/>', attr)
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
    ButtonsField.prototype.setValue = function(){
        return this;
    };

    /**
     * Get the list of buttons
     * 
     * @method getButtons
     * @return {Object} The list of buttons as a name/Dom pair
     */
    ButtonsField.prototype.getButtons = function(){
        return this.buttons;
    };

    /**
     * Get a button by name
     * 
     * @method getButton
     * @param {String} name The button's name
     * @return {Dom} The button's Dom object
     */
    ButtonsField.prototype.getButton = function(name){
        return this.buttons[name];
    };

    return ButtonsField;

})();