/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').Alert = (function () {

    /**
     * Fired when a button is clicked
     *
     * @event buttonclick
     * @param {Object} alert The alert instance
     * @param {String} action The buttons's action
     */
    var EVT_BUTTONCLICK = 'buttonclick';

    /**
     * An alert overlay to show a simple message with buttons
     *
     * @class Alert
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.draggable=false] Whether the overlay is draggable
     * @param {String} [configs.text=''] The message's text
     * @param {Array} [configs.buttons={}] The list of buttons as action/label pairs
     */
    function Alert(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Alert.parent.call(this, this.configs);

        this.addClass('alert');
    }

    Alert.defaults = {
        'draggable': false,
        'text': '',
        'buttons': {}
    };

    metaScore.editor.Overlay.extend(Alert);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Alert.prototype.setupUI = function(){
        // call parent method
        Alert.parent.prototype.setupUI.call(this);

        this.text = new metaScore.Dom('<div/>', {'class': 'text'})
            .appendTo(this.contents);

        if(this.configs.text){
            this.setText(this.configs.text);
        }

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .addDelegate('button', 'click', metaScore.Function.proxy(this.onButtonClick, this))
            .appendTo(this.contents);

        if(this.configs.buttons){
            metaScore.Object.each(this.configs.buttons, function(action, label){
                this.addButton(action, label);
            }, this);
        }

    };

    /**
     * Set the message's text
     * 
     * @method setText
     * @param {String} str The message's text
     * @chainable
     */
    Alert.prototype.setText = function(str){
        this.text.text(str);

        return this;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The button's associated action
     * @param {String} label The button's text label
     * @return {Button} The button object
     */
    Alert.prototype.addButton = function(action, label){
        var button = new metaScore.editor.Button()
            .setLabel(label)
            .data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * The button click event handler
     * 
     * @method onButtonClick
     * @private
     * @param {Event} evt The event object
     */
    Alert.prototype.onButtonClick = function(evt){
        var action = new metaScore.Dom(evt.target).data('action');

        this.hide();

        this.triggerEvent(EVT_BUTTONCLICK, {'alert': this, 'action': action}, false);

        evt.stopPropagation();
    };

    return Alert;

})();