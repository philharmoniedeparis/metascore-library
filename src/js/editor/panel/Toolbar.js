import Dom from '../../core/Dom';
import Button from '../../core/ui/Button';
import {isEmpty} from '../../core/utils/Var';
import SelectField from '../field/Select';
import DropDownMenu from './DropDownMenu';

/**
 * A title toolbar for panel's
 */
export default class Toolbar extends Dom{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [title=''] The text to display as a title
     * @property {Array} [buttons=['previous', 'next']] The buttons to display
     * @property {Object} [menuItems={}}] A list of dropdown menu items to display
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
        this.title = new Dom('<div/>', {'class': 'title', 'text': this.configs.title})
            .appendTo(this);

        /**
         * The selector
         * @type {SelectField}
         */
        this.selector = new SelectField({'multiple': this.configs.multiSelection})
            .addClass('selector')
            .appendTo(this);

        /**
         * The buttons container
         * @type {Dom}
         */
        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        this.configs.buttons.forEach((action) => {
            this.addButton(action);
        });

        if(!isEmpty(this.configs.menuItems)){
            /**
             * An eventual dropdown menu
             * @type {DropDownMenu}
             */
            this.menu = new DropDownMenu();

			Object.entries(this.configs.menuItems).forEach(([action, label]) => {
                this.menu.addItem(action, label);
            });

            new Dom('<div/>', {'class': 'menu'})
                .append(this.menu)
                .appendTo(this.buttons);
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'title': '',
            'buttons': ['previous', 'next'],
            'multiSelection': false,
            'menuItems': {}
        };
    }

    /**
     * Get the title's Dom object
     *
     * @return {Dom} The Dom object
     */
    getTitle() {
        return this.title;
    }

    /**
     * Get the selector field
     *
     * @return {editor.field.Select} The selector field
     */
    getSelector() {
        return this.selector;
    }

    /**
     * Get the dropdown menu
     *
     * @return {editor.DropDownMenu} The dropdown menu
     */
    getMenu() {
        return this.menu;
    }

    /**
     * Add a button
     *
     * @param {String} action The button's associated action
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
     * @param {String} action The button's associated action
     * @return {Dom} The button's Dom object
     */
    getButton(action){
        return this.buttons.children(`[data-action="${action}"]`);
    }

    /**
     * Toggle the enabled state of a menu item
     *
     * @param {String} action The item's associated action
     * @param {Boolean} state The enabled state to set
     * @return {this}
     */
    toggleMenuItem(action, state){
        const menu = this.getMenu();

        if(menu){
            menu.toggleItem(action, state);
        }

        return this;
    }

}
