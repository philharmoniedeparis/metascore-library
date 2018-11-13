import Dom from '../../Dom';
import Button from '../Button';
import Overlay from '../Overlay';

import {className} from '../../../../css/core/ui/overlay/Alert.less';

/**
 * An alert overlay to show a simple message with buttons
 *
 * @emits {buttonclick} Fired when a button is clicked
 * @param {Object} alert The alert instance
 * @param {String} action The buttons's action
 */
export default class Alert extends Overlay{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [text=''] The message's text
     * @property {Array} [buttons={}] The list of buttons as action/label pairs
     */
    constructor(configs){
        super(configs);

        this.addClass(`alert ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'text': '',
            'buttons': {}
        });
    }

    /**
     * Setup the overlay's UI
     * @private
     */
    setupUI(){
        // call parent method
        super.setupUI();

        /**
         * The text container
         * @type {Dom}
         */
        this.text = new Dom('<div/>', {'class': 'text'})
            .appendTo(this.getContents());

        if(this.configs.text){
            this.setText(this.configs.text);
        }

        /**
         * The buttons container
         * @type {Dom}
         */
        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .addDelegate('button', 'click', this.onButtonClick.bind(this))
            .appendTo(this.getContents());

        if(this.configs.buttons){
			Object.entries(this.configs.buttons).forEach(([action, label]) => {
                this.addButton(action, label);
            });
        }

    }

    /**
     * Set the message's text
     * @param {String} str The message's text
     * @return {this}
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
        const button = new Button()
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
        const action = new Dom(evt.target).data('action');

        this.hide();

        this.triggerEvent('buttonclick', {'alert': this, 'action': action}, false);

        evt.stopPropagation();
    }

}
