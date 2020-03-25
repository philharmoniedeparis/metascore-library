import Dom from '../core/Dom';
import Button from '../core/ui/Button';
import Icon from '../core/ui/Icon';
import Locale from '../core/Locale';
import TextInput from '../core/ui/input/TextInput';
import CheckboxInput from '../core/ui/input/CheckboxInput';
import SelectInput from '../core/ui/input/SelectInput';

import logo_icon from '../../img/core/logo.svg?svg-sprite';
import save_icon from '../../img/editor/mainmenu/save.svg?svg-sprite';
import revert_icon from '../../img/editor/mainmenu/revert.svg?svg-sprite';
import undo_icon from '../../img/editor/mainmenu/undo.svg?svg-sprite';
import redo_icon from '../../img/editor/mainmenu/redo.svg?svg-sprite';
import preview_toggle_icon from '../../img/editor/mainmenu/preview-toggle.svg?svg-sprite';

import {className} from '../../css/editor/MainMenu.scss';

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

        this.items = {};

        this.setupUI();
    }

    /**
     * Setup the menu's UI
     *
     * @private
     */
    setupUI() {
        new Icon({
                'symbol': logo_icon
            })
            .addClass('logo')
            .appendTo(this);

        this.items.save = new Button({
                'icon': save_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.save.title', 'Save')
            })
            .data('action', 'save')
            .appendTo(this);

        this.items.revert = new Button({
                'icon': revert_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.revert.title', 'Revert')
            })
            .data('action', 'revert')
            .appendTo(this);

        this.items.undo = new Button({
                'icon': undo_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.undo.title', 'Undo')
            })
            .data('action', 'undo')
            .appendTo(this);

        this.items.redo = new Button({
                'icon': redo_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.redo.title', 'Redo')
            })
            .data('action', 'redo')
            .appendTo(this);

        this.items['preview-toggle'] = new CheckboxInput({
                'icon': preview_toggle_icon,
                'name': 'preview-toggle'
            })
            .attr({
                'title': Locale.t('editor.MainMenu.preview-toggle.title', 'Toggle preview mode')
            })
            .addClass('preview-toggle')
            .appendTo(this);

        this.items.title = new TextInput({
                'name': 'title',
                'placeholder': Locale.t('editor.MainMenu.title.placeholder', 'Title'),
                'required': true
            })
            .addClass('title')
            .appendTo(this);

        this.items.revisions = new SelectInput({
                'name': 'revisions'
            })
            .addClass('revisions')
            .appendTo(this);

        this.items.restore = new Button({
                'label': Locale.t('editor.MainMenu.restore.label', 'Restore')
            })
            .data('action', 'restore')
            .appendTo(this);

    }

    /**
     * Get the item associated to an action
     *
     * @param {String} action The item's associated action
     * @return {Dom} The item
     */
    getItem(action){
        return this.items[action];
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
