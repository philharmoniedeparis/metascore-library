import Dom from '../core/Dom';
import Button from '../core/ui/Button';
import Icon from '../core/ui/Icon';
import Locale from '../core/Locale';
import TextInput from '../core/ui/input/TextInput';
import CheckboxInput from '../core/ui/input/CheckboxInput';
import SelectInput from '../core/ui/input/SelectInput';
import NumberInput from '../core/ui/input/NumberInput';
import { escapeHTML } from '../core/utils/String';

import logo_icon from '../../img/core/logo.svg?svg-sprite';
import save_icon from '../../img/editor/mainmenu/save.svg?svg-sprite';
import publish_icon from '../../img/editor/mainmenu/publish.svg?svg-sprite';
import revert_icon from '../../img/editor/mainmenu/revert.svg?svg-sprite';
import undo_icon from '../../img/editor/mainmenu/undo.svg?svg-sprite';
import redo_icon from '../../img/editor/mainmenu/redo.svg?svg-sprite';
import preview_toggle_icon from '../../img/editor/mainmenu/preview-toggle.svg?svg-sprite';

import {className} from '../../css/editor/MainMenu.scss';

/**
 * The editor's main menu
 */
export default class MainMenu extends Dom {

    static defaults = {
        'zoom_levels': [25, 50, 75, 100, 125, 150, 200, 400],
        'default_zoom_level': 100,
    };

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Array} [zoom_levels=[25, 50, 75, 100, 125, 150, 200, 400]] The available zoom level options
     * @property {Number} [default_zoom_level=100] The default zoom level
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `main-menu ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

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
                'title': Locale.t('editor.MainMenu.save.title', 'Save [Ctrl+S]')
            })
            .data('action', 'save')
            .appendTo(this);

        this.items.publish = new Button({
                'icon': publish_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.publish.title', 'Edit details / publish')
            })
            .data('action', 'publish')
            .appendTo(this);

        this.items.revert = new Button({
                'icon': revert_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.revert.title', 'Revert [Ctrl+R]')
            })
            .data('action', 'revert')
            .appendTo(this);

        this.items.undo = new Button({
                'icon': undo_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.undo.title', 'Undo [Ctrl+Z]')
            })
            .data('action', 'undo')
            .appendTo(this);

        this.items.redo = new Button({
                'icon': redo_icon
            })
            .attr({
                'title': Locale.t('editor.MainMenu.redo.title', 'Redo [Ctrl+Y]')
            })
            .data('action', 'redo')
            .appendTo(this);

        this.items.title = new TextInput({
                'name': 'title',
                'placeholder': Locale.t('editor.MainMenu.title.placeholder', 'Title'),
                'required': true
            })
            .data('name', 'title')
            .addDelegate('input', 'focus', this.onTitleInputFocus.bind(this), true)
            .addDelegate('input', 'blur', this.onTitleInputBlur.bind(this), true)
            .addDelegate('input', 'keypress', this.onTitleInputKeypress.bind(this))
            .appendTo(this);

        this.items.width = new NumberInput({
                'name': 'width',
                'min': 1,
                'max': 9999,
                'spinButtons': false
            })
            .data('name', 'width')
            .attr({
                'title': Locale.t('editor.MainMenu.width.title', 'Width')
            })
            .appendTo(this);

        this.items.height = new NumberInput({
                'name': 'height',
                'min': 1,
                'max': 9999,
                'spinButtons': false
            })
            .data('name', 'height')
            .attr({
                'title': Locale.t('editor.MainMenu.height.title', 'Height')
            })
            .appendTo(this);

        this.items.zoom = new SelectInput({
                'name': 'zoom',
                'value': this.configs.default_zoom_level,
                'options': this.configs.zoom_levels.reduce((accumulator , value) => {
                    accumulator[value] = `${value}%`;
                    return accumulator;
                }, {}),
                'required': true
            })
            .data('name', 'zoom')
            .attr({
                'title': Locale.t('editor.MainMenu.zoom.title', 'Zoom')
            })
            .appendTo(this);

        this.items['preview-toggle'] = new CheckboxInput({
                'icon': preview_toggle_icon,
                'name': 'preview-toggle'
            })
            .attr({
                'title': Locale.t('editor.MainMenu.preview-toggle.title', 'Toggle preview mode [Ctrl+Shift+E]')
            })
            .data('name', 'preview-toggle')
            .appendTo(this);

        new Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.items.revisions = new SelectInput({
                'name': 'revisions',
                'noEmptyOption': true
            })
            .data('name', 'revisions')
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

    /**
     * Update the revisions select options.
     *
     * @param {Array} revisions The list of revisions
     * @param {Number} current The current revision
     * @return {this}
     */
    updateRevisionsOptions(revisions, current) {
        const input = this.getItem('revisions');
        const date_formatter = new Intl.DateTimeFormat(void 0, {
            'year': 'numeric', 'month': 'numeric', 'day': 'numeric',
            'hour': 'numeric', 'minute': 'numeric', 'second': 'numeric',
            'hour12': false,
        });

        input.clear();

        revisions.forEach((revision) => {
            const text = Locale.t('editor.mainmenu.revisions.option.text', 'Revision @id from @date', {
                '@id': revision.vid,
                '@date': date_formatter.format(new Date(revision.created * 1000))
            });
            const option = input.addOption(revision.vid, text);
            option.attr('title', escapeHTML(revision.log_message));

            if (revision.vid === current) {
                option.attr('disabled', 'true');
            }
        });

        input.setValue(current, true);

        return this;
    }

    /**
     * Title input focus event handler
     *
     * @private
     */
    onTitleInputFocus(){
        this.addClass('title-focused');
    }

    /**
     * Title input blur event handler
     *
     * @private
     */
    onTitleInputBlur(){
        this.removeClass('title-focused');
    }

    /**
     * Title input keypress event handler
     *
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onTitleInputKeypress(evt){
        if(evt.key === 'Enter'){
            evt.target.blur();
        }
    }

}
