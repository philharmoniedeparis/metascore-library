import Dom from '../../core/Dom';

export default class DropDownMenu extends Dom{

    /**
     * A dropdown menu based on an HTML ul element
     *
     * @class DropDownMenu
     * @namespace editor
     * @extends Dom
     * @constructor
     */
    constructor() {
        // call the super constructor.
        super('<ul/>', {'class': 'dropdown-menu'});
    }

    /**
     * Add an item
     *
     * @method addItem
     * @param {String} action The action associated with the item
     * @param {String} label The text to display
     * @return {Dom} item The added item
     */
    addItem(action, label){
        const item = new Dom('<li/>', {'data-action': action, 'text': label})
            .appendTo(this);

        return item;
    }

    /**
     * Toggle an item's enabled state
     *
     * @method toggleItem
     * @param {String} action The action associated with the item
     * @param {Boolean} [state] The state to set the item to, the current state is toggled if not provided
     * @chainable
     */
    toggleItem(action, state){
        this.child(`[data-action="${action}"]`).toggleClass('disabled', state === false);

        return this;
    }

}
