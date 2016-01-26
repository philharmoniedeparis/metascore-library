/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Toolbar = (function(){

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
    function Toolbar(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

        this.title = new metaScore.Dom('<div/>', {'class': 'title', 'text': this.configs.title})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        metaScore.Array.each(this.configs.buttons, function(index, action){
            this.addButton(action);
        }, this);

        if(this.configs.selector){
            this.selector = new metaScore.editor.field.Select()
                .addClass('selector')
                .appendTo(this);
        }

        if(!metaScore.Var.isEmpty(this.configs.menuItems)){
            this.menu = new metaScore.editor.DropDownMenu();

            metaScore.Object.each(this.configs.menuItems, function(action, label){
                this.menu.addItem(action, label);
            }, this);

            this.addButton('menu')
                .append(this.menu);
        }
    }

    Toolbar.defaults = {
        'title': '',
        'buttons': ['previous', 'next'],
        'selector': true,
        'menuItems': {}
    };

    metaScore.Dom.extend(Toolbar);

    /**
     * Get the title's Dom object
     * 
     * @method getTitle
     * @return {Dom} The Dom object
     */
    Toolbar.prototype.getTitle = function(){
        return this.title;
    };

    /**
     * Get the selector field
     * 
     * @method getSelector
     * @return {editor.field.Select} The selector field
     */
    Toolbar.prototype.getSelector = function(){
        return this.selector;
    };

    /**
     * Get the dropdown menu
     * 
     * @method getMenu
     * @return {editor.DropDownMenu} The dropdown menu
     */
    Toolbar.prototype.getMenu = function(){
        return this.menu;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The button's associated action
     * @return {editor.Button} The created button
     */
    Toolbar.prototype.addButton = function(action){
        var button = new metaScore.editor.Button().data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * Get a button by associated action
     * 
     * @method getButton
     * @param {String} action The button's associated action
     * @return {Dom} The button's Dom object
     */
    Toolbar.prototype.getButton = function(action){
        return this.buttons.children('[data-action="'+ action +'"]');
    };

    /**
     * Toggle the enabled state of a menu item
     * 
     * @method toggleMenuItem
     * @param {String} action The item's associated action
     * @param {Boolean} state The enabled state to set
     * @chainable
     */
    Toolbar.prototype.toggleMenuItem = function(action, state){
        var menu = this.getMenu();

        if(menu){
            menu.toggleItem(action, state);
        }

        return this;
    };

    return Toolbar;

})();