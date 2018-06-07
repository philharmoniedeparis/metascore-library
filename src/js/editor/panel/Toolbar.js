import Dom from '../../core/Dom';
import Button from '../../core/ui/Button';
import {isEmpty} from '../../core/utils/Var';
import SelectField from '../field/Select';
import DropDownMenu from '../DropDownMenu';

export default class Toolbar extends Dom{

    /**
     * A title toolbar for panel's
     *
     * @class Toolbar
     * @namespace editor.panel
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.title=''] The text to display as a title
     * @param {Array} [configs.buttons=['previous', 'next']] The buttons to display
     * @param {Boolean} [configs.selector=true] Whether to display a selector
     * @param {Object} [configs.menuItems={}}] A list of dropdown menu items to display
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'toolbar clearfix'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.title = new Dom('<div/>', {'class': 'title', 'text': this.configs.title})
            .appendTo(this);

        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        this.configs.buttons.forEach((action) => {
            this.addButton(action);
        });

        if(this.configs.selector){
            this.selector = new SelectField()
                .addClass('selector')
                .appendTo(this);
        }

        if(!isEmpty(this.configs.menuItems)){
            this.menu = new DropDownMenu();

			Object.entries(this.configs.menuItems).forEach(([action, label]) => {
                this.menu.addItem(action, label);
            });

            new Dom('<div/>', {'class': 'menu'})
                .appendTo(this.buttons)
                .append(this.menu);
        }
    }

    static getDefaults(){
        return {
            'title': '',
            'buttons': ['previous', 'next'],
            'selector': true,
            'menuItems': {}
        };
    }

    /**
     * Get the title's Dom object
     *
     * @method getTitle
     * @return {Dom} The Dom object
     */
    getTitle() {
        return this.title;
    }

    /**
     * Get the selector field
     *
     * @method getSelector
     * @return {editor.field.Select} The selector field
     */
    getSelector() {
        return this.selector;
    }

    /**
     * Get the dropdown menu
     *
     * @method getMenu
     * @return {editor.DropDownMenu} The dropdown menu
     */
    getMenu() {
        return this.menu;
    }

    /**
     * Add a button
     *
     * @method addButton
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
     * @method getButton
     * @param {String} action The button's associated action
     * @return {Dom} The button's Dom object
     */
    getButton(action){
        return this.buttons.children(`[data-action="${action}"]`);
    }

    /**
     * Toggle the enabled state of a menu item
     *
     * @method toggleMenuItem
     * @param {String} action The item's associated action
     * @param {Boolean} state The enabled state to set
     * @chainable
     */
    toggleMenuItem(action, state){
        const menu = this.getMenu();

        if(menu){
            menu.toggleItem(action, state);
        }

        return this;
    }

}
