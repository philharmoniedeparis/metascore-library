import {Dom} from '../Dom';
import {_Function} from '../utils/Function';
import {Toolbar} from './overlay/Toolbar';

/**
 * Fired when the overlay is shown
 *
 * @event show
 * @param {Object} overlay The overlay instance
 */
var EVT_SHOW = 'show';

/**
 * Fired when the overlay is hidden
 *
 * @event hide
 * @param {Object} overlay The overlay instance
 */
var EVT_HIDE = 'hide';

export default class Overlay extends Dom {

    /**
     * A generic overlay class
     *
     * @class Overlay
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='body'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.modal=true] Whether to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
     * @param {Boolean} [configs.autoShow=true] Whether to show the overlay automatically
     * @param {Boolean} [configs.toolbar=false] Whether to add a toolbar with title and close button
     * @param {String} [configs.title=''] The overlay's title
     */
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super('<div/>', {'class': 'overlay clearfix'});

        this.setupUI();

        if(this.configs.autoShow){
            this.show();
        }
    }

    static getDefaults(){
        return {
            'parent': 'body',
            'modal': true,
            'autoShow': false,
            'toolbar': false,
            'title': ''
        };
    }

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {

        this.toggleClass('modal', this.configs.modal);
        
        this.inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        if(this.configs.toolbar){
            this.toolbar = new Toolbar({'title': this.configs.title})
                .appendTo(this.inner);

            this.toolbar.addButton('close')
                .addListener('click', _Function.proxy(this.onCloseClick, this));
        }

        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(this.inner);

    };

    /**
     * Show the overlay
     *
     * @method show
     * @chainable
     */
    show() {
        this.appendTo(this.configs.parent);

        this.triggerEvent(EVT_SHOW, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Hide the overlay
     *
     * @method hide
     * @chainable
     */
    hide() {
        this.remove();

        this.triggerEvent(EVT_HIDE, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Get the overlay's toolbar
     *
     * @method getToolbar
     * @return {editor.Toolbar} The toolbar
     */
    getToolbar() {
        return this.toolbar;
    };

    /**
     * Get the overlay's contents
     *
     * @method getContents
     * @return {Dom} The contents
     */
    getContents() {
        return this.contents;
    };

    /**
     * The close button's click handler
     *
     * @method onCloseClick
     * @private
     * @param {Event} evt The event object
     */
    onCloseClick(evt){
        this.hide();
    };
    
}