import Dom from '../core/Dom';
import Button from '../core/ui/Button';
import Locale from '../core/Locale';
import NumberInput from '../core/ui/input/NumberInput';
import CheckboxInput from '../core/ui/input/CheckboxInput';

import {className} from '../../css/editor/MainMenu.less';

/**
 * The editor's main menu
 */
export default class MainMenu extends Dom {

    /**
     * Instantiate
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': `main-menu ${className}`});

        this.setupUI();
    }

    /**
     * Setup the menu's UI
     *
     * @private
     */
    setupUI() {
        this._items = {};

        this._items.save = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.save', 'Save')
            })
            .data('action', 'save')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this._items['r-index'] = new NumberInput({
                'min': 0,
                'max': 999,
                'spinIncremental': false
            })
            .attr({
                'title': Locale.t('editor.MainMenu.r-index', 'Reading index')
            })
            .data('action', 'r-index')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this._items['edit-toggle'] = new CheckboxInput()
            .attr({
                'title': Locale.t('editor.MainMenu.edit-toggle', 'Toggle edit mode')
            })
            .data('action', 'edit-toggle')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this._items.revert = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.revert', 'Revert')
            })
            .data('action', 'revert')
            .appendTo(this);

        this._items.undo = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.undo', 'Undo')
            })
            .data('action', 'undo')
            .appendTo(this);

        this._items.redo = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.redo', 'Redo')
            })
            .data('action', 'redo')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

    }

    /**
     * Get the item associated to an action
     *
     * @param {String} action The item's associated action
     * @return {Dom} The item
     */
    getItem(action){
        return this._items[action];
    }

    /**
     * Toogle an item's enabled state
     *
     * @param {String} action The item's associated action
     * @param {Boolean} state The state to set the item to
     * @return {this}
     */
    toggleItem(action, state){
        const item = this.getItem(action);

        if(item){
            if(state === false){
                item.disable();
            }
            else{
                item.enable();
            }
        }

        return this;
    }

}
