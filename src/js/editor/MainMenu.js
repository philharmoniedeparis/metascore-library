import Dom from '../core/Dom';
import Button from '../core/ui/Button';
import Locale from '../core/Locale';
import NumberField from './field/Number';
import CheckboxField from './field/Checkbox';

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
     * @method setupUI
     * @private
     */
    setupUI() {
        this._items = {};

        this._items.new = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.new', 'New')
            })
            .data('action', 'new')
            .appendTo(this);

        this._items.open = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.open', 'Open')
            })
            .data('action', 'open')
            .appendTo(this);

        this._items.edit = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.edit', 'Edit')
            })
            .data('action', 'edit')
            .appendTo(this);

        const btn_group = new Dom('<div/>', {'class': 'button-group save'})
            .appendTo(this);

        const sub_menu = new Dom('<div/>', {'class': 'sub-menu'})
            .appendTo(btn_group);

        this._items.save = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.save', 'Save as draft')
            })
            .data('action', 'save')
            .appendTo(btn_group);

        this._items.clone = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.clone', 'Save as copy')
            })
            .data('action', 'clone')
            .appendTo(sub_menu);

        this._items.publish = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.publish', 'Save & Publish')
            })
            .data('action', 'publish')
            .appendTo(sub_menu);

        this._items.delete = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.delete', 'Delete')
            })
            .data('action', 'delete')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this._items.share = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.share', 'Share')
            })
            .data('action', 'share')
            .appendTo(this);

        this._items.download = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.download', 'Download')
            })
            .data('action', 'download')
            .disable()
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this._items['r-index'] = new NumberField({
                'min': 0,
                'max': 999
            })
            .attr({
                'title': Locale.t('editor.MainMenu.r-index', 'Reading index')
            })
            .data('action', 'r-index')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this._items['edit-toggle'] = new CheckboxField({'label': ''})
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

        this._items.help = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.help', 'Help')
            })
            .data('action', 'help')
            .appendTo(this);

        this._items.account = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.account', 'My Account')
            })
            .data('action', 'account')
            .appendTo(this);

        this._items.logout = new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.logout', 'Logout')
            })
            .data('action', 'logout')
            .appendTo(this);

    }

    /**
     * Get the item associated to an action
     *
     * @method getItem
     * @param {String} action The item's associated action
     * @return {Dom} The item
     */
    getItem(action){
        return this._items[action];
    }

    /**
     * Toogle an item's enabled state
     *
     * @method toggleItem
     * @param {String} action The item's associated action
     * @param {Boolean} state The state to set the item to
     * @chainable
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
