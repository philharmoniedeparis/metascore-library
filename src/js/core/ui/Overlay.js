import Dom from '../Dom';
import Button from './Button';

import close_icon from '../../../img/core/ui/overlay/close.svg?svg-sprite';
import {className} from '../../../css/core/ui/Overlay.scss';

/**
 * A generic overlay class
 *
 * @emits {show} Fired when the overlay is shown
 * @param {Object} overlay The overlay instance
 *
 * @emits {hide} Fired when the overlay is hidden
 * @param {Object} overlay The overlay instance
 *
 * @emits {buttonclick} Fired when a button is clicked
 * @param {Object} overlay The overlay instance
 * @param {String} action The buttons's action
 */
export default class Overlay extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [parent='body'] The parent element in which the overlay will be appended
     * @property {Boolean} [modal=true] Whether to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
     * @property {Boolean} [autoShow=true] Whether to show the overlay automatically
     * @property {Boolean} [autHide=true] Whether to hide the overlay when one of its buttons is clicked
     * @property {Boolean} [toolbar=false] Whether to add a toolbar with title and close button
     * @property {String} [title=''] The overlay's title
     * @property {String} [text=''] The overlay's text
     * @property {Array} [buttons=''] The overlay's buttons
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `overlay ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.setupUI();

        if(this.configs.autoShow){
            this.show();
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'parent': 'body',
            'modal': true,
            'autoShow': true,
            'autoHide': true,
            'toolbar': false,
            'title': '',
            'text': '',
            'buttons': {}
        };
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        this.toggleClass('modal', this.configs.modal);

        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        if(this.configs.toolbar){
            /**
             * The toolbar
             * @type {Dom}
             */
            this.toolbar = new Dom('<div/>', {'class': 'toolbar'})
                .addDelegate('button', 'click', this.onToolbarButtonClick.bind(this))
                .appendTo(inner);

            /**
             * The title container
             * @type {Dom}
             */
            this.title = new Dom('<div/>', {'class': 'title', 'text': this.configs.title})
                .appendTo(this.toolbar);

            /**
             * The buttons container
             * @type {Dom}
             */
            const toolbar_buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.toolbar);

            new Button({'icon': close_icon})
                .data('action', 'close')
                .appendTo(toolbar_buttons);
        }

        /**
         * The contents container
         * @type {Dom}
         */
        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(inner);

        /**
         * The text container
         * @type {Dom}
         */
        this.text = new Dom('<div/>', {'class': 'text'})
            .appendTo(this.contents);

        if(this.configs.text){
            this.setText(this.configs.text);
        }

        /**
         * The buttons container
         * @type {Dom}
         */
        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(inner);

        if(this.configs.buttons){
            Object.entries(this.configs.buttons).forEach(([action, label]) => {
                this.addButton(action, label);
            });
        }

        this.addListener('keyup', this.onKeyup.bind(this));
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
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this.buttons);

        return button;
    }

    /**
     * Show the overlay
     *
     * @return {this}
     */
    show() {
        this.appendTo(this.configs.parent);

        this.triggerEvent('show', {'overlay': this}, true, false);

        return this;
    }

    /**
     * Hide the overlay
     *
     * @return {this}
     */
    hide() {
        this.remove();

        this.triggerEvent('hide', {'overlay': this}, true, false);

        return this;
    }

    /**
     * Get the overlay's toolbar
     *
     * @return {editor.Toolbar} The toolbar
     */
    getToolbar() {
        return this.toolbar;
    }

    /**
     * Get the overlay's contents
     *
     * @return {Dom} The contents
     */
    getContents() {
        return this.contents;
    }

    /**
     * The button click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        if(this.configs.autoHide){
            this.hide();
        }

        this.triggerEvent('buttonclick', {'overlay': this, 'action': action}, false);

        evt.stopPropagation();
    }

    /**
     * Toolbar button click handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onToolbarButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        switch(action){
            case 'close':
                this.hide();
                break;
        }
    }

    /**
     * The keyup event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeyup(evt){
        if(evt.key === "Escape") {
            this.hide();

            evt.stopPropagation();
        }
    }

}
