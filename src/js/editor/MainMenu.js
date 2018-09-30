import Dom from '../core/Dom';
import Button from '../core/ui/Button';
import Locale from '../core/Locale';
import TimeField from './field/Time';
import NumberField from './field/Number';

import '../../css/editor/MainMenu.less';

export default class MainMenu extends Dom {

    /**
     * The editor's main menu
     *
     * @class MainMenu
     * @namespace editor
     * @extends Dom
     * @constructor
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'main-menu clearfix'});

        this.setupUI();
    }

    /**
     * Setup the menu's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.new', 'New')
            })
            .data('action', 'new')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.open', 'Open')
            })
            .data('action', 'open')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.edit', 'Edit')
            })
            .data('action', 'edit')
            .appendTo(this);

        const btn_group = new Dom('<div/>', {'class': 'button-group save'})
            .appendTo(this);

        const sub_menu = new Dom('<div/>', {'class': 'sub-menu'})
            .appendTo(btn_group);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.save', 'Save as draft')
            })
            .data('action', 'save')
            .appendTo(btn_group);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.clone', 'Save as copy')
            })
            .data('action', 'clone')
            .appendTo(sub_menu);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.publish', 'Save & Publish')
            })
            .data('action', 'publish')
            .appendTo(sub_menu);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.delete', 'Delete')
            })
            .data('action', 'delete')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.share', 'Share')
            })
            .data('action', 'share')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.download', 'Download')
            })
            .data('action', 'download')
            .disable()
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.timefield = new TimeField()
            .attr({
                'title': Locale.t('editor.MainMenu.time', 'Time')
            })
            .addClass('time')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.rindexfield = new NumberField({
                'min': 0,
                'max': 999
            })
            .attr({
                'title': Locale.t('editor.MainMenu.r-index', 'Reading index')
            })
            .addClass('r-index')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.edit-toggle', 'Toggle edit mode')
            })
            .data('action', 'edit-toggle')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.revert', 'Revert')
            })
            .data('action', 'revert')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.undo', 'Undo')
            })
            .data('action', 'undo')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.redo', 'Redo')
            })
            .data('action', 'redo')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .css('flex', '20')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.settings', 'Settings')
            })
            .data('action', 'settings')
            .disable()
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.help', 'Help')
            })
            .data('action', 'help')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.account', 'My Account')
            })
            .data('action', 'account')
            .appendTo(this);

        new Button()
            .attr({
                'title': Locale.t('editor.MainMenu.logout', 'Logout')
            })
            .data('action', 'logout')
            .appendTo(this);

    }

    /**
     * Toogle a button's enabled state
     *
     * @method toggleButton
     * @param {String} action The button's associated action
     * @param {Boolean} state The state to set the button to, the current state is toggled if not provided
     * @chainable
     */
    toggleButton(action, state){
        this.find(`[data-action="${action}"]`).toggleClass('disabled', state === false);

        return this;
    }

}
