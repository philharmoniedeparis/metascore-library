import {Dom} from '../../Dom';
import {Button} from '../Button';
import {Overlay} from '../Overlay';

import {FunctionUtils} from '../../utils/Function';
import {ObjectUtils} from '../../utils/Object';

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
 */
export default class Alert extends Overlay{

    /**
     * Create an alert
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.text=''] The message's text
     * @param {Array} [configs.buttons={}] The list of buttons as action/label pairs
     */
    constructor(configs){
        super(configs);

        this.addClass('alert');
    }

    static getDefaults(){
        return {
            'text': '',
            'buttons': {}
        };
    }

    /**
     * Setup the overlay's UI
     * @private
     */
    setupUI(){
        // call parent method
        super.setupUI();

        this.text = new Dom('<div/>', {'class': 'text'})
            .appendTo(this.contents);

        if(this.configs.text){
            this.setText(this.configs.text);
        }

        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .addDelegate('button', 'click', FunctionUtils.proxy(this.onButtonClick, this))
            .appendTo(this.contents);

        if(this.configs.buttons){
            ObjectUtils.each(this.configs.buttons, function(action, label){
                this.addButton(action, label);
            }, this);
        }

    }
    
    /**
     * Set the message's text
     * @param {String} str The message's text
     * @chainable
     */
    setText(str){
        this.text.text(str);

        return this;
    }

    /**
     * Add a button
     * @param {String} action The button's associated action
     * @param {String} label The button's text label
     * @return {Button} The button object
     */
    addButton(action, label){
        var button = new Button()
            .setLabel(label)
            .data('action', action)
            .appendTo(this.buttons);

        return button;
    }

    /**
     * The button click event handler
     * @private
     * @param {Event} evt The event object
     */
    onButtonClick(evt){
        var action = new Dom(evt.target).data('action');

        this.hide();

        this.triggerEvent(EVT_BUTTONCLICK, {'alert': this, 'action': action}, false);

        evt.stopPropagation();
    }

}