import Dom from '../../Dom';
import Button from '../Button';

/**
 * A title toolbar for overlay's
 */
export default class Toolbar extends Dom{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.title=null] The text to display as a title
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'toolbar clearfix'});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The title container
         * @type {Dom}
         */
        this.title = new Dom('<div/>', {'class': 'title'})
            .appendTo(this);

        /**
         * The buttons container
         * @type {Dom}
         */
        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        if(this.configs.title){
            this.title.text(this.configs.title);
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'title': null
        };
    }

    /**
     * Get the title's Dom
     *
     * @method getTitle
     * @return {Dom} The Dom object
     */
    getTitle() {
        return this.title;
    }

    /**
     * Add a button
     *
     * @method addButton
     * @param {String} action The action associated with the button
     * @return {Button} The created button
     */
    addButton(action){
        const button = new Button().data('action', action)
            .appendTo(this.buttons);

        return button;
    }

    /**
     * Get a button by associated action
     *
     * @method getButton
     * @param {String} action The action associated with the button
     * @return {Dom} The button
     */
    getButton(action){
        return this.buttons.children(`[data-action="${action}"]`);
    }

}
