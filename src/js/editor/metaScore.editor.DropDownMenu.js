/**
 * @module Editor
 */

metaScore.namespace('editor').DropDownMenu = (function () {

    /**
     * A dropdown menu based on an HTML ul element
     *
     * @class DropDownMenu
     * @namespace editor
     * @extends Dom
     * @constructor
     */
    function DropDownMenu() {
        // call the super constructor.
        metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
    }

    metaScore.Dom.extend(DropDownMenu);

    /**
     * Add an item
     *
     * @method addItem
     * @param {String} action The action associated with the item
     * @param {String} label The text to display
     * @return {Dom} item The added item
     */
    DropDownMenu.prototype.addItem = function(action, label){
        var item = new metaScore.Dom('<li/>', {'data-action': action, 'text': label})
            .appendTo(this);

        return item;
    };

    /**
     * Toggle an item's enabled state
     *
     * @method toggleItem
     * @param {String} action The action associated with the item
     * @param {Boolean} [state] The state to set the item to, the current state is toggled if not provided
     * @chainable
     */
    DropDownMenu.prototype.toggleItem = function(action, state){
        this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

        return this;
    };

    return DropDownMenu;

})();