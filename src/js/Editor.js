import Dom from './core/Dom';
import {naturalCompare} from './core/utils/String';
import {naturalSortInsensitive} from './core/utils/Array';
import {isArray, isNumber, isObject} from './core/utils/Var';
import Locale from './core/Locale';
import MainMenu from './editor/MainMenu';
import Resizable from './core/ui/Resizable';
import BlockPanel from './editor/panel/Block';
import PagePanel from './editor/panel/Page';
import ElementPanel from './editor/panel/Element';
import History from './editor/History';
import Alert from './core/ui/overlay/Alert';
import LoadMask from './core/ui/overlay/LoadMask';
import Clipboard from './core/Clipboard';
import Ajax from './core/Ajax';
import ContextMenu from './core/ui/ContextMenu';
import GuideDetails from './editor/overlay/GuideDetails';
import GuideSelector from './editor/overlay/GuideSelector';
import Share from './editor/overlay/Share';
import TimeField from './editor/field/Time';

import '../css/metaScore.editor.less';

/**
 * Fired when the editor is fully setup
 *
 * @event ready
 * @param {Object} editor The editor instance
 */
const EVT_READY = 'ready';

export default class Editor extends Dom {

    /**
     * Provides the main Editor class
     *
     * @class Editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.container='body'] The HTMLElement, Dom instance, or CSS selector to which the editor should be appended
     * @param {String} [configs.player_url=''] The base URL of players
     * @param {String} [configs.api_url=''] The base URL of the RESTful API
     * @param {String} [configs.help_url=''] The base URL of the RESTful API
     * @param {String} [configs.player_api_help_url=''] The URL of the player API help page
     * @param {String} [configs.account_url=''] The URL of the user account page
     * @param {String} [configs.logout_url=''] The URL of the user logout page
     * @param {Object} [configs.user_groups={}] The groups the user belongs to
     * @param {Boolean} [configs.reload_player_on_save=false] Whether to reload the player each time the guide is saved or not
     * @param {String} [configs.locale] The locale file to load
     * @param {Object} [configs.ajax={}] Custom options to send with each AJAX request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'metaScore-editor', 'tabindex': 0});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        if(this.configs.container){
            this.appendTo(this.configs.container);
        }

        if('locale' in this.configs){
            Locale.load(this.configs.locale, this.onLocaleLoad.bind(this));
        }
        else{
            this.init();
        }
    }

    static getDefaults(){
        return {
            'container': 'body',
            'player_url': '',
            'api_url': '',
            'help_url': '',
            'player_api_help_url': '',
            'account_url': '',
            'logout_url': '',
            'user_groups': {},
            'reload_player_on_save': false,
            'lang': 'en',
            'ajax': {}
        };
    }

    static getVersion(){
        return "[[VERSION]]";
    }

    static getRevision(){
        return "[[REVISION]]";
    }

    onLocaleLoad(){
        this.init();
    }

    /**
     * XHR error callback
     *
     * @method onXHRError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    onXHRError(loadmask, evt){
        loadmask.hide();

        new Alert({
            'parent': this,
            'text': Locale.t('editor.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': evt.target.getStatusText(), '@code': evt.target.getStatus()}),
            'buttons': {
                'ok': Locale.t('editor.onXHRError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    /**
     * Guide saving success callback
     *
     * @method onGuideSaveSuccess
     * @private
     * @param {Event} evt The event object
     */
    onGuideSaveSuccess(loadmask, evt){
        const player = this.getPlayer();
        const data = JSON.parse(evt.target.getResponse());

        loadmask.hide();

        if(!player || (data.id !== player.getId()) || this.configs.reload_player_on_save){
            this.loadPlayer(data.id, data.vid);
        }
        else{
            player.updateData(data, true)
                  .setRevision(data.vid);

            delete this.dirty_data;

            this.setDirty(false)
                .updateMainmenu();
        }
    }

    /**
     * Guide deletion confirm callback
     *
     * @method onGuideDeleteConfirm
     * @private
     */
    onGuideDeleteConfirm() {
        const id = this.getPlayer().getId();

        const loadmask = new LoadMask({
            'parent': this,
            'autoShow': true
        });

        const options = Object.assign({}, {
            'dataType': 'json',
            'method': 'DELETE',
            'onSuccess': this.onGuideDeleteSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask)
        }, this.configs.ajax);

        new Ajax(`${this.configs.api_url}guide/${id}.json`, options);
    }

    /**
     * Guide deletion success callback
     *
     * @method onGuideDeleteSuccess
     * @private
     */
    onGuideDeleteSuccess(loadmask){
        this.unloadPlayer();

        loadmask.hide();
    }

    /**
     * Guide revert confirm callback
     *
     * @method onGuideRevertConfirm
     * @private
     */
    onGuideRevertConfirm() {
        const player = this.getPlayer();

        this.loadPlayer(player.getId(), player.getRevision());
    }

    /**
     * GuideSelector submit callback
     *
     * @method onGuideSelectorSubmit
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideSelector/submit:event"}}GuideSelector.submit{{/crossLink}}
     */
    onGuideSelectorSubmit(evt){
        this.loadPlayer(evt.detail.guide.id, evt.detail.vid);
    }

    /**
     * Keydown event callback
     *
     * @method onKeydown
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onKeydown(evt){
        if(Dom.is(evt.target, 'input')){
            return;
        }

        switch(evt.key){
            case "Alt":
                if(!evt.repeat){
                    this.setEditing(!this.persistentEditing, false);
                    evt.preventDefault();
                }
                break;

            case " ":
                if(!evt.repeat){
                    const player = this.getPlayer();
                    if(player){
                        player.togglePlay();
                    }
                }
                break;

            case "h":
                if(evt.ctrlKey && !evt.repeat){
                    const player = this.getPlayer();
                    if(player){
                        player.addClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;

            case "z":
                if(evt.ctrlKey){
                    this.history.undo();
                    evt.preventDefault();
                }
                break;

            case "y":
                if(evt.ctrlKey){
                    this.history.redo();
                    evt.preventDefault();
                }
                break;
        }
    }

    /**
     * Keyup event callback
     *
     * @method onKeyup
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onKeyup(evt){
        if(Dom.is(evt.target, 'input')){
            return;
        }

        switch(evt.key){
            case "Alt":
                this.setEditing(this.persistentEditing, false);
                evt.preventDefault();
                break;

            case "h":
                if(evt.ctrlKey){
                    const player = this.getPlayer();
                    if(player){
                        player.removeClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;
        }
    }

    /**
     * Mousedown event callback
     *
     * @method onMousedown
     * @private
     */
    onMousedown(){
        if(this.player_contextmenu){
            this.player_contextmenu.hide();
        }
    }

    /**
     * Mainmenu click event callback
     *
     * @method onMainmenuClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onMainmenuClick(evt){
        switch(Dom.data(evt.target, 'action')){
            case 'new':{
                const callback = () => {
                    this.detailsOverlay.getField('type').readonly(false);
                    this.detailsOverlay.info.text(Locale.t('editor.detailsOverlay.new.info', ''));
                    this.detailsOverlay.buttons.submit.setLabel(Locale.t('editor.detailsOverlay.new.submitText', 'Save'));
                    this.detailsOverlay
                        .clearValues(true)
                        .setValues({'action': 'new'}, true)
                        .show();
                };

                if(this.isDirty()){
                    new Alert({
                            'parent': this,
                            'text': Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide?<br/><strong>Any unsaved data will be lost.</strong>'),
                            'buttons': {
                                'confirm': Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                                'cancel': Locale.t('editor.onMainmenuClick.open.no', 'No')
                            },
                            'autoShow': true
                        })
                        .addListener('buttonclick', (click_evt) => {
                            if(click_evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;
            }

            case 'open':{
                const callback = this.openGuideSelector.bind(this);

                if(this.isDirty()){
                    new Alert({
                            'parent': this,
                            'text': Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide?<br/><strong>Any unsaved data will be lost.</strong>'),
                            'buttons': {
                                'confirm': Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                                'cancel': Locale.t('editor.onMainmenuClick.open.no', 'No')
                            },
                            'autoShow': true
                        })
                        .addListener('buttonclick', (click_evt) => {
                            if(click_evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;
            }

            case 'edit':
                this.detailsOverlay.getField('type').readonly(true);
                this.detailsOverlay.info.text(Locale.t('editor.detailsOverlay.edit.info', 'The guide needs to be saved in order for applied changes to become permanent'));
                this.detailsOverlay.buttons.submit.setLabel(Locale.t('editor.detailsOverlay.edit.submitText', 'Apply'));
                this.detailsOverlay
                    .clearValues(true)
                    .setValues(Object.assign({'action': 'edit'}, this.getPlayer().getData()), true)
                    .show();
                break;

            case 'save':
                this.saveGuide('update');
                break;

            case 'clone':
                this.saveGuide('clone');
                break;

            case 'publish':{
                const callback = () => {
                    this.saveGuide('update', true);
                };

                new Alert({
                        'parent': this,
                        'text': Locale.t('editor.onMainmenuClick.publish.msg', 'This action will make this version the public version.<br/>Are you sure you want to continue?'),
                        'buttons': {
                            'confirm': Locale.t('editor.onMainmenuClick.publish.yes', 'Yes'),
                            'cancel': Locale.t('editor.onMainmenuClick.publish.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', (click_evt) => {
                        if(click_evt.detail.action === 'confirm'){
                            callback();
                        }
                    });
                break;
            }

            case 'share':
                new Share({
                    'url': this.configs.player_url + this.getPlayer().getId(),
                    'api_help_url': this.configs.player_api_help_url,
                    'autoShow': true
                });
                break;

            case 'download':
                break;

            case 'delete':
                new Alert({
                        'parent': this,
                        'text': Locale.t('editor.onMainmenuClick.delete.msg', 'Are you sure you want to delete this guide?<br/><b style="color: #F00;">This action cannot be undone.</b>'),
                        'buttons': {
                            'confirm': Locale.t('editor.onMainmenuClick.delete.yes', 'Yes'),
                            'cancel': Locale.t('editor.onMainmenuClick.delete.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addClass('delete-guide')
                    .addListener('buttonclick', (click_evt) => {
                        if(click_evt.detail.action === 'confirm'){
                            this.onGuideDeleteConfirm();
                        }
                    });
                break;

            case 'revert':
                new Alert({
                        'parent': this,
                        'text': Locale.t('editor.onMainmenuClick.revert.msg', 'Are you sure you want to revert back to the last saved version?<br/><strong>Any unsaved data will be lost.</strong>'),
                        'buttons': {
                            'confirm': Locale.t('editor.onMainmenuClick.revert.yes', 'Yes'),
                            'cancel': Locale.t('editor.onMainmenuClick.revert.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', (click_evt) => {
                        if(click_evt.detail.action === 'confirm'){
                            this.onGuideRevertConfirm();
                        }
                    });
                break;

            case 'undo':
                this.history.undo();
                break;

            case 'redo':
                this.history.redo();
                break;

            case 'edit-toggle':
                this.setEditing(!this.editing);
                break;

            case 'settings':
                break;

            case 'help':
                window.open(this.configs.help_url, '_blank');
                break;

            case 'account':
                window.location.href = this.configs.account_url;
                break;

            case 'logout':
                window.location.href = this.configs.logout_url;
                break;
        }
    }

    /**
     * Mainmenu time field valuechange event callback
     *
     * @method onMainmenuTimeFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuechange:event"}}Time.valuechange{{/crossLink}}
     */
    onMainmenuTimeFieldChange(evt){
        const field = evt.target._metaScore;
        const time = field.getValue();

        this.getPlayer().getMedia().setTime(time);
    }

    /**
     * Mainmenu reading index field valuechange event callback
     *
     * @method onMainmenuRindexFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Number/valuechange:event"}}Number.valuechange{{/crossLink}}
     */
    onMainmenuRindexFieldChange(evt){
        const field = evt.target._metaScore;
        const value = field.getValue();

        this.getPlayer().setReadingIndex(value, true);
    }

    /**
     * Time field valuein event callback
     *
     * @method onTimeFieldIn
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuein:event"}}Time.valuein{{/crossLink}}
     */
    onTimeFieldIn(evt){
        const field = evt.detail.field;
        const time = this.getPlayer().getMedia().getTime();

        field.setValue(time);
    }

    /**
     * Time field valueout event callback
     *
     * @method onTimeFieldOut
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valueout:event"}}Time.valueout{{/crossLink}}
     */
    onTimeFieldOut(evt){
        const time = evt.detail.value;

        this.getPlayer().getMedia().setTime(time);
    }

    /**
     * Sidebar resizestart event callback
     *
     * @method onSidebarResizeStart
     * @private
     */
    onSidebarResizeStart(){
        this.addClass('sidebar-resizing');
    }

    /**
     * Sidebar resize event callback
     *
     * @method onSidebarResize
     * @private
     */
    onSidebarResize(){
        const width = parseInt(this.sidebar_wrapper.css('width'), 10);

        this.workspace.css('right', `${width}px`);
    }

    /**
     * Sidebar resizeend event callback
     *
     * @method onSidebarResizeEnd
     * @private
     */
    onSidebarResizeEnd(){
        this.removeClass('sidebar-resizing');
    }

    /**
     * Sidebar resize handle dblclick event callback
     *
     * @method onSidebarResizeDblclick
     * @private
     */
    onSidebarResizeDblclick(){
        this.toggleClass('sidebar-hidden');

        this.toggleSidebarResizer();
    }

    /**
     * Block panel componentset event callback
     *
     * @method onBlockSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    onBlockSet(evt){
        const block = evt.detail.component;

        if(block.instanceOf('Block')){
            this.panels.page.getToolbar().toggleMenuItem('new', true);
        }

        this.updatePageSelector();
    }

    /**
     * Block panel componentunset event callback
     *
     * @method onBlockUnset
     * @private
     */
    onBlockUnset(evt){
        const block = evt.detail.component;

        if(block.instanceOf('Block')){
            block.getPages().forEach((page) => {
                this.panels.page.unsetComponent(page);
            });

            const toggle = this.panels.block.getComponents().length > 0;
            this.panels.page.getToolbar().toggleMenuItem('new', toggle);
        }

        this.updatePageSelector();
        this.updateElementSelector();
    }

    /**
     * Block panel valuechange event callback
     *
     * @method onBlockPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    onBlockPanelValueChange(evt){
        const sets = evt.detail;

        const update = (key) => {
            const doUpdateBlockTogglers = sets.some((set) => {
                return (
                    ('x' in set[key]) ||
                    ('y' in set[key]) ||
                    ('width' in set[key]) ||
                    ('height' in set[key])
                );
            });

            if(doUpdateBlockTogglers){
                this.getPlayer().updateBlockTogglers();
            }
        };

        this.history.add({
            'undo': () => {
                sets.forEach((set) => {
                    set.component.setPropertyValues(set.old_values);
                });

                update('old_values');
            },
            'redo': () => {
                sets.forEach((set) => {
                    set.component.setPropertyValues(set.new_values);
                });

                update('new_values');
            }
        });

        update('new_values');
    }

    /**
     * Block panel toolbar click event callback
     *
     * @method onBlockPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onBlockPanelToolbarClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'synched':
            case 'non-synched':
                this.addPlayerComponents('block', {'type': 'Block', 'synched': action === 'synched'}, this.getPlayer());
                break;

            case 'block-toggler':
                this.addPlayerComponents('block', {'type': 'BlockToggler'}, this.getPlayer());
                break;

            case 'delete': {
                const blocks = this.panels.block.getComponents().filter((block) => block.instanceOf('Block') || block.instanceOf('BlockToggler'));
                this.deletePlayerComponents('block', blocks);
                break;
            }
        }

        evt.stopPropagation();
    }

    /**
     * Block panel toolbar selector valuechange event callback
     *
     * @method onBlockPanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    onBlockPanelSelectorChange(evt){
        if(evt.detail.added.length > 0){
            const added = this.getPlayer().getComponents(`#${evt.detail.added.join(',#')}`);
            added.forEach((component) => {
                this.panels.block.setComponent(component, true);
            });
        }

        if(evt.detail.removed.length > 0){
            const removed = this.getPlayer().getComponents(`#${evt.detail.removed.join(',#')}`);
            removed.forEach((component) => {
                this.panels.block.unsetComponent(component);
            });
        }
    }

    /**
     * Page panel componentset event callback
     *
     * @method onPageSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    onPageSet(evt){
        this.panels.element
            .getToolbar()
                .toggleMenuItem('Cursor', true)
                .toggleMenuItem('Image', true)
                .toggleMenuItem('Text', true);

        const block = evt.detail.component.getBlock();
        const start_time_field = this.panels.page.getField('start-time');
        const end_time_field = this.panels.page.getField('end-time');

        if(block.getPropertyValue('synched')){
            const index = block.getActivePageIndex();
            const previous_page = block.getPage(index-1);
            const next_page = block.getPage(index+1);

            if(previous_page){
                start_time_field.readonly(false).enable().setMin(previous_page.getPropertyValue('start-time'));
            }
            else{
                start_time_field.readonly(true).enable();
            }

            if(next_page){
                end_time_field.readonly(false).enable().setMax(next_page.getPropertyValue('end-time'));
            }
            else{
                end_time_field.readonly(true).enable();
            }
        }
        else{
            start_time_field.disable();
            end_time_field.disable();
        }

        this.updateElementSelector();

        evt.stopPropagation();
    }

    /**
     * Page panel componentunset event callback
     *
     * @method onPageUnset
     * @private
     */
    onPageUnset(evt){
        const page = evt.detail.component;

        page.getElements().forEach((element) => {
            this.panels.element.unsetComponent(element);
        });

        const toggle = this.panels.page.getComponents().length > 0;
        this.panels.element.getToolbar()
            .toggleMenuItem('Cursor', toggle)
            .toggleMenuItem('Image', toggle)
            .toggleMenuItem('Text', toggle);

        this.updateElementSelector();
    }

    /**
     * Page panel valuechange event callback
     *
     * @method onPagePanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    onPagePanelValueChange(evt){
        const sets = evt.detail;

        const update = (key) => {
            sets.forEach((set) => {
                if(('start-time' in set[key]) || ('end-time' in set[key])){
                    const page = set.component;
                    const block = page.getBlock();

                    if(block.getPropertyValue('synched')){
                        const index = block.getPageIndex(page);
                        const previous_page = block.getPage(index - 1);
                        const next_page = block.getPage(index + 1);

                        if(('start-time' in set[key]) && previous_page){
                            previous_page.setPropertyValue('end-time', set[key]['start-time']);
                        }

                        if(('end-time' in set[key]) && next_page){
                            next_page.setPropertyValue('start-time', set[key]['end-time']);
                        }
                    }
                }
            });
        };

        this.history.add({
            'undo': () => {
                sets.forEach((set) => {
                    set.component.setPropertyValues(set.old_values);
                });

                update('old_values');
            },
            'redo': () => {
                sets.forEach((set) => {
                    set.component.setPropertyValues(set.new_values);
                });

                update('new_values');
            }
        });

        update('new_values');
    }

    /**
     * Page panel toolbar click event callback
     *
     * @method onPagePanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onPagePanelToolbarClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'new': {
                const block = this.panels.block.getComponent();
                this.addPlayerComponents('page', {}, block);
                break;
            }

            case 'delete': {
                const pages = this.panels.page.getComponents();
                this.deletePlayerComponents('page', pages);
                break;
            }
        }

        evt.stopPropagation();
    }

    /**
     * Page panel toolbar selector valuechange event callback
     *
     * @method onPagePanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    onPagePanelSelectorChange(evt){
        if(evt.detail.added.length > 0){
            const added = this.getPlayer().getComponents(`#${evt.detail.added.join(',#')}`);
            added.forEach((component) => {
                this.panels.page.setComponent(component, true);
                component.getBlock().setActivePage(component, true);
            });
        }

        if(evt.detail.removed.length > 0){
            const removed = this.getPlayer().getComponents(`#${evt.detail.removed.join(',#')}`);
            removed.forEach((component) => {
                this.panels.page.unsetComponent(component);
            });
        }
    }

    /**
     * Element panel componentset event callback
     *
     * @method onElementSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    onElementSet(evt){
        const element = evt.detail.component;
        const player = this.getPlayer();

        player.setReadingIndex(element.getPropertyValue('r-index') || 0);

        evt.stopPropagation();
    }

    /**
     * Element panel valuechange event callback
     *
     * @method onElementPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    onElementPanelValueChange(evt){
        const sets = evt.detail;

        const update = (key) => {
            const doUpdateElementSelector = sets.some((set) => {
                return ('r-index' in set[key]);
            });
            if(doUpdateElementSelector){
                this.updateElementSelector();
            }
        };

        this.history.add({
            'undo': () => {
                sets.forEach((set) => {
                    set.component.setPropertyValues(set.old_values);
                });

                update('old_values');
            },
            'redo': () => {
                sets.forEach((set) => {
                    set.component.setPropertyValues(set.new_values);
                });

                update('new_values');
            }
        });

        update('new_values');
    }

    /**
     * Element panel toolbar click event callback
     *
     * @method onElementPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onElementPanelToolbarClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'Cursor':
            case 'Image':
            case 'Text': {
                const page = this.panels.page.getComponent();
                this.addPlayerComponents('element', {'type': action}, page);
                break;
            }

            case 'delete': {
                const elements = this.panels.element.getComponents();
                this.deletePlayerComponents('element', elements);
                break;
            }
        }
    }

    /**
     * Element panel toolbar selector valuechange event callback
     *
     * @method onElementPanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    onElementPanelSelectorChange(evt){
        if(evt.detail.added.length > 0){
            const added = this.getPlayer().getComponents(`#${evt.detail.added.join(',#')}`);
            added.forEach((component) => {
                this.panels.element.setComponent(component, true);
            });
        }

        if(evt.detail.removed.length > 0){
            const removed = this.getPlayer().getComponents(`#${evt.detail.removed.join(',#')}`);
            removed.forEach((component) => {
                this.panels.element.unsetComponent(component);
            });
        }
    }

    /**
     * Player idset event callback
     *
     * @method onPlayerIdSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/idset:event"}}Player.idset{{/crossLink}}
     */
    onPlayerIdSet(evt){
        const player = evt.detail.player;

        window.history.replaceState(null, null, `#guide=${player.getId()}:${player.getRevision()}`);
    }

    /**
     * Player revisionset event callback
     *
     * @method onPlayerRevisionSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/revisionset:event"}}Player.revisionset{{/crossLink}}
     */
    onPlayerRevisionSet(evt){
        const player = evt.detail.player;

        window.history.replaceState(null, null, `#guide=${player.getId()}:${player.getRevision()}`);
    }

    /**
     * Player loadedmetadata event callback
     *
     * @method onPlayerLoadedMetadata
     * @private
     */
    onPlayerLoadedMetadata(){
        this.mainmenu.timefield.setMax(this.getPlayer().getMedia().getDuration());
    }

    /**
     * Media timeupdate event callback
     *
     * @method onPlayerTimeUpdate
     * @private
     */
    onPlayerTimeUpdate(){
        const time = this.getPlayer().getMedia().getTime();

        this.mainmenu.timefield.setValue(time, true);
    }

    /**
     * Player rindex event callback
     *
     * @method onPlayerReadingIndex
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/rindex:event"}}Player.rindex{{/crossLink}}
     */
    onPlayerReadingIndex(evt){
        const rindex = evt.detail.value;

        this.mainmenu.rindexfield.setValue(rindex, true);
    }

    /**
     * Player mousedown event callback
     *
     * @method onPlayerMousedown
     * @private
      */
    onPlayerMousedown(){
        this.contextmenu.hide();
    }

    /**
     * Player mediaadd event callback
     *
     * @method onPlayerMediaAdd
     * @private
     */
    onPlayerMediaAdd(){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    }

    /**
     * Player controlleradd event callback
     *
     * @method onPlayerControllerAdd
     * @private
     */
    onPlayerControllerAdd(){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    }

    /**
     * Player blocktaggleradd event callback
     *
     * @method onPlayerBlockTogglerAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/blocktaggleradd:event"}}Player.blockadd{{/crossLink}}
     */
    onPlayerBlockTogglerAdd(evt){
        this.updateBlockSelector();

        const blocks = this.getPlayer().getComponents('.block, .media.video, .controller');
        evt.detail.blocktoggler.update(blocks);
    }

    /**
     * Player blockadd event callback
     *
     * @method onPlayerBlockAdd
     * @private
     */
    onPlayerBlockAdd(){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    }

    onComponentBeforeRemove(evt){
        const component = evt.target._metaScore;

        if(component.instanceOf('Block') || component.instanceOf('BlockToggler') || component.instanceOf('Media') || component.instanceOf('Controller')){
            this.panels.block.unsetComponent(component, true);
        }
        else if(component.instanceOf('Page')){
            this.panels.page.unsetComponent(component, true);
        }
        else if(component.instanceOf('Element')){
            this.panels.page.unsetComponent(component, true);
        }
    }

    /**
     * Player childremove event callback
     *
     * @method onPlayerChildRemove
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Dom/childremove:event"}}Dom.childremove{{/crossLink}}
     */
    onPlayerChildRemove(evt){
        const child = evt.detail.child;
        const component = child._metaScore;

        if(component){
            if(component.instanceOf('Block') || component.instanceOf('BlockToggler') || component.instanceOf('Media') || component.instanceOf('Controller')){
                this.updateBlockSelector();

                if(!component.instanceOf('BlockToggler')){
                    this.getPlayer().updateBlockTogglers();
                }
            }
            else if(component.instanceOf('Page')){
                this.updatePageSelector();
            }
            else if(component.instanceOf('Element')){
                this.updateElementSelector();
            }
        }
    }

    /**
     * Player frame load event callback
     *
     * @method onPlayerFrameLoadSuccess
     * @private
     */
    onPlayerFrameLoadSuccess(loadmask){
        const player = this.player_frame.get(0).contentWindow.player;

        if(player){
            player
                .addListener('load', this.onPlayerLoadSuccess.bind(this, loadmask))
                .addListener('error', this.onPlayerLoadError.bind(this, loadmask))
                .addListener('idset', this.onPlayerIdSet.bind(this))
                .addListener('revisionset', this.onPlayerRevisionSet.bind(this))
                .addListener('loadedmetadata', this.onPlayerLoadedMetadata.bind(this))
                .load();
        }
    }

    /**
     * Player frame error event callback
     *
     * @method onPlayerFrameLoadError
     * @private
     */
    onPlayerFrameLoadError(loadmask){
        loadmask.hide();

        new Alert({
            'parent': this,
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    /**
     * Player load event callback
     *
     * @method onPlayerLoadSuccess
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/load:event"}}Player.load{{/crossLink}}
     */
    onPlayerLoadSuccess(loadmask, evt){
        this.player = evt.detail.player
            .addDelegate('.metaScore-component', 'beforedrag', this.onComponentBeforeDrag.bind(this))
            .addDelegate('.metaScore-component, .metaScore-component *', 'click', this.onComponentClick.bind(this))
            .addDelegate('.metaScore-component.block', 'pageadd', this.onBlockPageAdd.bind(this))
            .addDelegate('.metaScore-component.block', 'pageactivate', this.onBlockPageActivate.bind(this))
            .addDelegate('.metaScore-component.page', 'elementadd', this.onPageElementAdd.bind(this))
            .addDelegate('.metaScore-component', 'beforeremove', this.onComponentBeforeRemove.bind(this))
            .addListener('mousedown', this.onPlayerMousedown.bind(this))
            .addListener('mediaadd', this.onPlayerMediaAdd.bind(this))
            .addListener('controlleradd', this.onPlayerControllerAdd.bind(this))
            .addListener('blocktoggleradd', this.onPlayerBlockTogglerAdd.bind(this))
            .addListener('blockadd', this.onPlayerBlockAdd.bind(this))
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keyup', this.onKeyup.bind(this))
            .addListener('timeupdate', this.onPlayerTimeUpdate.bind(this))
            .addListener('rindex', this.onPlayerReadingIndex.bind(this))
            .addListener('childremove', this.onPlayerChildRemove.bind(this))
            .addListener('click', this.onPlayerClick.bind(this))
            .addClass('in-editor');

            this.player.contextmenu
                .disable();

            const player_body = this.player_frame.get(0).contentWindow.document.body;
            this.player_contextmenu
                .setTarget(player_body)
                .enable();

            new Dom(player_body)
                .addListener('keydown', this.onKeydown.bind(this))
                .addListener('keyup', this.onKeyup.bind(this));

            this
                .setEditing(true)
                .updateMainmenu()
                .updateBlockSelector()
                .updatePageSelector()
                .updateElementSelector();

            const data = this.player.getData();
            this.mainmenu
                .toggleButton('save', data.permissions.update)
                .toggleButton('clone', data.permissions.clone)
                .toggleButton('publish', data.permissions.update)
                .toggleButton('delete', data.permissions.delete);

            this.mainmenu.rindexfield.setValue(0, true);

            loadmask.hide();
    }

    /**
     * Player error event callback
     *
     * @method onPlayerLoadError
     * @private
     */
    onPlayerLoadError(loadmask){
        loadmask.hide();

        new Alert({
            'parent': this,
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    /**
     * Player click event callback
     *
     * @method onPlayerClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onPlayerClick(evt){
        if(this.editing !== true){
            return;
        }

        this.panels.element.unsetComponents();
        this.panels.page.unsetComponents();
        this.panels.block.unsetComponents();

        evt.stopPropagation();
    }

    /**
     * Component beforedrag event callback
     *
     * @method onComponentBeforeDrag
     * @private
     * @param {Event} evt The event object
     */
    onComponentBeforeDrag(evt){
        if(this.editing !== true){
            evt.preventDefault();
        }
    }

    /**
     * Component click event callback
     *
     * @method onComponentClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onComponentClick(evt){
        let component = null;

        if(this.editing !== true){
            return;
        }

        if(!Dom.is(evt.target, '.metaScore-component')){
            component = Dom.closest(evt.target, '.metaScore-component')._metaScore;
        }
        else{
            component = evt.target._metaScore;
        }

        if(component.instanceOf('Element')){
            if(evt.shiftKey && this.panels.element.getComponents().includes(component)){
                this.panels.element.unsetComponent(component);
            }
            else{
                const page = component.getPage();
                const block = page.getBlock();

                this.panels.block.setComponent(block, evt.shiftKey);
                this.panels.page.setComponent(page, evt.shiftKey);
                this.panels.element.setComponent(component, evt.shiftKey);
            }
        }
        else if(component.instanceOf('Page')){
            const block = component.getBlock();

            if(evt.shiftKey && this.panels.page.getComponents().includes(component)){
                this.panels.block.unsetComponent(block);

                const elements = component.getElements();
                elements.forEach((element) => {
                    this.panels.element.unsetComponent(element);
                });
            }
            else{
                this.panels.block.setComponent(block, evt.shiftKey);
                this.panels.page.setComponent(component, evt.shiftKey);

                if(!evt.shiftKey){
                    this.panels.element.unsetComponents();
                }
            }
        }
        else{
            if(evt.shiftKey && this.panels.block.getComponents().includes(component)){
                this.panels.block.unsetComponent(component);

                if(component.instanceOf('Block')){
                    const pages = component.getPages();
                    pages.forEach((page) => {
                        this.panels.page.unsetComponent(page);
                    });
                }
            }
            else{
                this.panels.block.setComponent(component, evt.shiftKey);

                if(!evt.shiftKey){
                    this.panels.page.unsetComponents();
                    this.panels.element.unsetComponents();
                }

                if(component.instanceOf('Block')){
                    this.panels.page.setComponent(component.getActivePage(), evt.shiftKey);
                }
            }
        }

        evt.stopImmediatePropagation();
    }

    /**
     * Block pageadd event callback
     *
     * @method onBlockPageAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageadd:event"}}Block.pageadd{{/crossLink}}
     */
    onBlockPageAdd(evt){
        const block = evt.detail.block;

        if(block === this.panels.block.getComponent()){
            this.updatePageSelector();
        }

        evt.stopPropagation();
    }

    /**
     * Block pageactivate event callback
     *
     * @method onBlockPageActivate
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageactivate:event"}}Block.pageactivate{{/crossLink}}
     */
    onBlockPageActivate(evt){
        const page = evt.detail.current;

        if(page.getBlock() === this.panels.block.getComponent()){
            this.panels.page.setComponent(page);
        }
    }

    /**
     * Page elementadd event callback
     *
     * @method onPageElementAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Page/elementadd:event"}}Page.elementadd{{/crossLink}}
     */
    onPageElementAdd(evt){
        const element = evt.detail.element;
        const page = evt.detail.page;

        if(evt.detail.new && element.instanceOf('Cursor')){
            const media = this.getPlayer().getMedia();
            const block = page.getBlock();

            if(!isNumber(element.getPropertyValue('start-time'))){
                element.setPropertyValue('start-time', block.getPropertyValue('synched') ? page.getPropertyValue('start-time') : media.getTime());

            }

            if(!isNumber(element.getPropertyValue('end-time'))){
                element.setPropertyValue('end-time', block.getPropertyValue('synched') ? page.getPropertyValue('end-time') : media.getDuration());
            }
        }

        if(page === this.panels.page.getComponent()){
            this.updateElementSelector();
        }

        evt.stopPropagation();
    }

    /**
     * History add event callback
     *
     * @method onHistoryAdd
     * @private
     */
    onHistoryAdd(){
        this.setDirty(true)
            .updateMainmenu();
    }

    /**
     * History undo event callback
     *
     * @method onHistoryUndo
     * @private
     */
    onHistoryUndo(){
        this.updateMainmenu();
    }

    /**
     * History redo event callback
     *
     * @method onHistoryRedo
     * @private
     */
    onHistoryRedo(){
        this.updateMainmenu();
    }

    /**
     * GuideDetails show event callback
     *
     * @method onDetailsOverlayShow
     * @private
     */
    onDetailsOverlayShow(){
        const player = this.getPlayer();

        if(player){
            player.getMedia().pause();
        }
    }

    /**
     * GuideDetails submit event callback
     *
     * @method onDetailsOverlaySubmit
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideDetails/submit:event"}}GuideDetails.submit{{/crossLink}}
     */
    onDetailsOverlaySubmit(evt){
        const overlay = evt.detail.overlay;
        const data = evt.detail.values;
        const action = overlay.getField('action').getValue();
        const player = this.getPlayer();

        if(action === 'new'){
            this.createGuide(data, overlay);
        }
        else{
            const callback = (new_duration) => {
                if(new_duration){
                    player.getComponents('.block').forEach((block) => {
                        if(block.getPropertyValue('synched')){
                            const page = block.getPage(block.getPageCount()-1);
                            if(page){
                                page.setPropertyValue('end-time', new_duration);
                            }
                        }
                    });
                }

                this.dirty_data = data;
                player.updateData(data);
                overlay.hide();

                this.mainmenu.timefield.setMax(new_duration);

                this.setDirty(true)
                    .updateMainmenu();
            };

            if('media' in data){
                const loadmask = new LoadMask({
                    'parent': this,
                    'autoShow': true
                });

                this.getMediaFileDuration(data.media, (error, new_duration) => {
                    if(error){
                        console.error(error);
                        return;
                    }

                    const old_duration = player.getMedia().getDuration();

                    if(new_duration !== old_duration){
                        const formatted_old_duration = TimeField.getTextualValue(old_duration);
                        const formatted_new_duration = TimeField.getTextualValue(new_duration);
                        const blocks = [];

                        if(new_duration < old_duration){
                            player.getComponents('.block').forEach((block) => {
                                if(block.getPropertyValue('synched')){
                                    block.getPages().some((page) => {
                                        if(page.getPropertyValue('start-time') > new_duration){
                                            blocks.push(block.getPropertyValue('name'));
                                            return true;
                                        }

                                        return false;
                                    });
                                }
                            });
                        }

                        if(blocks.length > 0){
                            loadmask.hide();

                            new Alert({
                                'parent': this,
                                'text': Locale.t('editor.onDetailsOverlaySubmit.update.needs_review.msg', 'The duration of selected media (!new_duration) is less than the current one (!old_duration).<br/><strong>Pages with a start time after !new_duration will therefore be out of reach. This applies to blocks: !blocks</strong><br/>Please delete those pages or modify their start time and try again.', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration, '!blocks': blocks.join(', ')}),
                                'buttons': {
                                    'ok': Locale.t('editor.onDetailsOverlaySubmit.update.needs_review.ok', 'OK'),
                                },
                                'autoShow': true
                            });
                        }
                        else{
                            let msg = '';
                            if(new_duration < old_duration){
                                msg = Locale.t('editor.onDetailsOverlaySubmit.update.shorter.msg', 'The duration of selected media (!new_duration) is less than the current one (!old_duration).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is greater than that of the selected media.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration});
                            }
                            else{
                                msg = Locale.t('editor.onDetailsOverlaySubmit.update.longer.msg', 'The duration of selected media (!new_duration) is greater than the current one (!old_duration).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is equal to that of the current media.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration});
                            }

                            new Alert({
                                'parent': this,
                                'text': msg,
                                'buttons': {
                                    'confirm': Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.yes', 'Yes'),
                                    'cancel': Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.no', 'No')
                                },
                                'autoShow': true
                            })
                            .addListener('buttonclick', (click_evt) => {
                                loadmask.hide();

                                if(click_evt.detail.action === 'confirm'){
                                    callback(new_duration);
                                }
                            });
                        }
                    }
                    else{
                        callback();
                        loadmask.hide();
                    }
                });
            }
            else{
                callback();
            }
        }
    }

    /**
     * Window hashchange event callback
     *
     * @method onWindowHashChange
     * @private
     * @param {HashChangeEvent} evt The event object
     */
    onWindowHashChange(evt){
        const callback = this.loadPlayerFromHash.bind(this);
        const oldURL = evt.oldURL;

        if(this.isDirty()){
            new Alert({
                    'parent': this,
                    'text': Locale.t('editor.onWindowHashChange.alert.msg', 'Are you sure you want to open another guide?<br/><strong>Any unsaved data will be lost.</strong>'),
                    'buttons': {
                        'confirm': Locale.t('editor.onWindowHashChange.alert.yes', 'Yes'),
                        'cancel': Locale.t('editor.onWindowHashChange.alert.no', 'No')
                    },
                    'autoShow': true
                })
                .addListener('buttonclick', (click_evt) => {
                    if(click_evt.detail.action === 'confirm'){
                        callback();
                    }
                    else{
                        window.history.replaceState(null, null, oldURL);
                    }
                });
        }
        else{
            callback();
        }

        evt.preventDefault();
    }

    /**
     * Window beforeunload event callback
     *
     * @method onWindowBeforeUnload
     * @private
     * @param {Event} evt The event object
     */
    onWindowBeforeUnload(evt){
        if(this.isDirty()){
            evt.returnValue = Locale.t('editor.onWindowBeforeUnload.msg', 'Any unsaved data will be lost.');
        }
    }

    init(){
        // add components

        this.h_ruler = new Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this);
        this.v_ruler = new Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this);

        this.workspace = new Dom('<div/>', {'class': 'workspace'}).appendTo(this);

        this.mainmenu = new MainMenu().appendTo(this)
            .toggleButton('help', this.configs.help_url ? true : false)
            .toggleButton('account', this.configs.account_url ? true : false)
            .toggleButton('logout', this.configs.logout_url ? true : false)
            .addDelegate('button[data-action]:not(.disabled)', 'click', this.onMainmenuClick.bind(this))
            .addDelegate('.time', 'valuechange', this.onMainmenuTimeFieldChange.bind(this))
            .addDelegate('.r-index', 'valuechange', this.onMainmenuRindexFieldChange.bind(this));

        this.sidebar_wrapper = new Dom('<div/>', {'class': 'sidebar-wrapper'}).appendTo(this)
            .addListener('resizestart', this.onSidebarResizeStart.bind(this))
            .addListener('resize', this.onSidebarResize.bind(this))
            .addListener('resizeend', this.onSidebarResizeEnd.bind(this));

        this.sidebar = new Dom('<div/>', {'class': 'sidebar'}).appendTo(this.sidebar_wrapper);

        this.sidebar_resizer = new Resizable({target: this.sidebar_wrapper, directions: ['left']});
        this.sidebar_resizer.getHandle('left')
            .addListener('dblclick', this.onSidebarResizeDblclick.bind(this));

        this.panels = {};

        this.panels.block = new BlockPanel().appendTo(this.sidebar)
            .addListener('componentset', this.onBlockSet.bind(this))
            .addListener('componentunset', this.onBlockUnset.bind(this))
            .addListener('valueschange', this.onBlockPanelValueChange.bind(this));

        this.panels.block.getToolbar()
            .addDelegate('.selector', 'valuechange', this.onBlockPanelSelectorChange.bind(this))
            .addDelegate('.buttons [data-action]', 'click', this.onBlockPanelToolbarClick.bind(this));

        this.panels.page = new PagePanel().appendTo(this.sidebar)
            .addListener('componentset', this.onPageSet.bind(this))
            .addListener('componentunset', this.onPageUnset.bind(this))
            .addListener('valueschange', this.onPagePanelValueChange.bind(this));

        this.panels.page.getToolbar()
            .addDelegate('.selector', 'valuechange', this.onPagePanelSelectorChange.bind(this))
            .addDelegate('.buttons [data-action]', 'click', this.onPagePanelToolbarClick.bind(this));

        this.panels.element = new ElementPanel().appendTo(this.sidebar)
            .addListener('componentset', this.onElementSet.bind(this))
            .addListener('valueschange', this.onElementPanelValueChange.bind(this));

        this.panels.element.getToolbar()
            .addDelegate('.selector', 'valuechange', this.onElementPanelSelectorChange.bind(this))
            .addDelegate('.buttons [data-action]', 'click', this.onElementPanelToolbarClick.bind(this));

        this.grid = new Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);

        this.history = new History()
            .addListener('add', this.onHistoryAdd.bind(this))
            .addListener('undo', this.onHistoryUndo.bind(this))
            .addListener('redo', this.onHistoryRedo.bind(this));

        this.clipboard = new Clipboard();

        // prevent the custom contextmenu from overriding the native one in inputs
        this.addDelegate('input', 'contextmenu', (evt) => {
            evt.stopImmediatePropagation();
            evt.stopPropagation();
        });

        this.detailsOverlay = new GuideDetails({
                'groups': this.configs.user_groups
            })
            .addListener('show', this.onDetailsOverlayShow.bind(this))
            .addListener('submit', this.onDetailsOverlaySubmit.bind(this));

        Dom.addListener(window, 'hashchange', this.onWindowHashChange.bind(this));
        Dom.addListener(window, 'beforeunload', this.onWindowBeforeUnload.bind(this));

        this
            .addListener('mousedown', this.onMousedown.bind(this))
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keyup', this.onKeyup.bind(this))
            .addDelegate('.timefield', 'valuein', this.onTimeFieldIn.bind(this))
            .addDelegate('.timefield', 'valueout', this.onTimeFieldOut.bind(this))
            .setDirty(false)
            .setEditing(false)
            .updateMainmenu()
            .setupContextMenus()
            .loadPlayerFromHash();

        this.triggerEvent(EVT_READY, {'editor': this}, false, false);

    }

    setupContextMenus(){
        this.contextmenu = new ContextMenu({'target': this, 'items': {
            'about': {
                'text': Locale.t('editor.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': this.constructor.getVersion(), '!revision': this.constructor.getRevision()})
            }
        }})
        .appendTo(this);

        this.player_contextmenu = new ContextMenu({'target': null, 'items': {
                'add-element': {
                    'text': Locale.t('editor.contextmenu.add-element', 'Add an element'),
                    'items': {
                        'add-element-cursor': {
                            'text': Locale.t('editor.contextmenu.add-element-cursor', 'Cursor'),
                            'callback': (el) => {
                                this.addPlayerComponents('element', {'type': 'Cursor'}, el.closest('.metaScore-component.page')._metaScore);
                            }
                        },
                        'add-element-image': {
                            'text': Locale.t('editor.contextmenu.add-element-image', 'Image'),
                            'callback': (el) => {
                                this.addPlayerComponents('element', {'type': 'Image'}, el.closest('.metaScore-component.page')._metaScore);
                            }
                        },
                        'add-element-text': {
                            'text': Locale.t('editor.contextmenu.add-element-text', 'Text'),
                            'callback': (el) => {
                                this.addPlayerComponents('element', {'type': 'Text'}, el.closest('.metaScore-component.page')._metaScore);
                            }
                        }
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (el.closest('.metaScore-component.page') ? true : false);
                    }
                },
                'select-elements': {
                    'text': Locale.t('editor.contextmenu.select-elements', 'Select all elements'),
                    'callback': (el) => {
                        const page = el.closest('.metaScore-component.page')._metaScore;

                        this.panels.block.setComponent(page.getBlock());
                        this.panels.page.setComponent(page);

                        page.getElements().forEach((element, index) => {
                            this.panels.element.setComponent(element, index > 0);
                        });
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (el.closest('.metaScore-component.page') ? true : false);
                    }
                },
                'select-elements-matching-index': {
                    'text': Locale.t('editor.contextmenu.select-elements-matching-index', 'Select all elements of the current reading index'),
                    'callback': (el) => {
                        const rindex = this.getPlayer().getReadingIndex();
                        const page = el.closest('.metaScore-component.page')._metaScore;

                        this.panels.block.setComponent(page.getBlock());
                        this.panels.page.setComponent(page);
                        this.panels.element.unsetComponents();

                        page.getElements().forEach((element) => {
                            if(element.getPropertyValue('r-index') === rindex){
                                this.panels.element.setComponent(element, true);
                            }
                        });
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (el.closest('.metaScore-component.page') ? true : false);
                    }
                },
                'copy-elements': {
                    'text': () => {
                        if(this.panels.element.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.copy-selected-elements', 'Copy selected elements');
                        }
                        return Locale.t('editor.contextmenu.copy-element', 'Copy element');
                    },
                    'callback': (el) => {
                        const configs = [];
                        let elements = this.panels.element.getComponents();

                        if(elements.length === 0){
                            elements = [el.closest('.metaScore-component.element')._metaScore];
                        }

                        elements.forEach((element) => {
                            const config = element.getPropertyValues();
                            config.x += 5;
                            config.y += 5;

                            configs.push(config);
                        });

                        this.clipboard.setData('element', configs);
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && ((this.panels.element.getComponents().length > 0) || (el.closest('.metaScore-component.element') ? true : false));
                    }
                },
                'paste-elements': {
                    'text': Locale.t('editor.contextmenu.paste-elements', 'Paste elements'),
                    'callback': (el) => {
                        this.addPlayerComponents('element', this.clipboard.getData(), el.closest('.metaScore-component.page')._metaScore);
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (this.clipboard.getDataType() === 'element') && (el.closest('.metaScore-component.page') ? true : false);
                    }
                },
                'delete-elements': {
                    'text': () => {
                        if(this.panels.element.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.delete-selected-elements', 'Delete selected elements');
                        }
                        return Locale.t('editor.contextmenu.delete-element', 'Delete element');
                    },
                    'callback': (el) => {
                        let elements = this.panels.element.getComponents();
                        if(elements.length === 0){
                            elements = [el.closest('.metaScore-component.element')._metaScore];
                        }
                        this.deletePlayerComponents('element', elements);
                    },
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.element.getComponents().length > 0){
                            return true;
                        }
                        const dom = el.closest('.metaScore-component.element');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'lock-element': {
                    'text': Locale.t('editor.contextmenu.lock-element', 'Lock element'),
                    'callback': (el) => {
                        el.closest('.metaScore-component.element')._metaScore.setPropertyValue('locked', true);
                    },
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = el.closest('.metaScore-component.element');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'unlock-element': {
                    'text': Locale.t('editor.contextmenu.unlock-element', 'Unlock element'),
                    'callback': (el) => {
                        el.closest('.metaScore-component.element')._metaScore.setPropertyValue('locked', false);
                    },
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = el.closest('.metaScore-component.element');
                        return dom && dom._metaScore.getPropertyValue('locked');
                    }
                },
                'element-separator': {
                    'class': 'separator',
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.element.getComponents().length > 0){
                            return true;
                        }
                        return (el.closest('.metaScore-component.page, .metaScore-component.element') ? true : false);
                    }
                },
                'add-page': {
                    'text': Locale.t('editor.contextmenu.add-page', 'Add a page'),
                    'callback': (el) => {
                        this.addPlayerComponents('page', {}, el.closest('.metaScore-component.block')._metaScore);
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (el.closest('.metaScore-component.block') ? true : false);
                    }
                },
                'delete-page': {
                    'text': () => {
                        if(this.panels.page.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.delete-selected-pages', 'Delete selected pages');
                        }
                        return Locale.t('editor.contextmenu.delete-page', 'Delete page');
                    },
                    'callback': (el) => {
                        let pages = this.panels.page.getComponents();
                        if(pages.length === 0){
                            pages = [el.closest('.metaScore-component.page')._metaScore];
                        }
                        this.deletePlayerComponents('page', pages);
                    },
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.page.getComponents().length > 0){
                            return true;
                        }
                        return el.closest('.metaScore-component.page') ? true : false;
                    }
                },
                'page-separator': {
                    'class': 'separator',
                    'toggler': (el) => {
                        return (this.editing === true) && (el.closest('.metaScore-component.block, .metaScore-component.page') ? true : false);
                    }
                },
                'add-block': {
                    'text': Locale.t('editor.contextmenu.add-block', 'Add a block'),
                    'items': {
                        'add-block-synched': {
                            'text': Locale.t('editor.contextmenu.add-block-synched', 'Synchronized'),
                            'callback': () => {
                                this.addPlayerComponents('block', {'type': 'Block', 'synched': true}, this.getPlayer());
                            }
                        },
                        'add-block-non-synched': {
                            'text': Locale.t('editor.contextmenu.add-block-non-synched', 'Non-synchronized'),
                            'callback': () => {
                                this.addPlayerComponents('block', {'type': 'Block', 'synched': false}, this.getPlayer());
                            }
                        },
                        'separator': {
                            'class': 'separator'
                        },
                        'add-block-toggler': {
                            'text': Locale.t('editor.contextmenu.add-block-toggler', 'Block Toggler'),
                            'callback': () => {
                                this.addPlayerComponents('block', {'type': 'BlockToggler'}, this.getPlayer());
                            }
                        }
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (el.is('.metaScore-player'));
                    }
                },
                'select-blocks': {
                    'text': Locale.t('editor.contextmenu.select-blocks', 'Select all blocks'),
                    'callback': () => {
                        const components = this.getPlayer().getComponents('.block, .block-toggler, .media.video, .controller');
                        components.forEach((component, index) => {
                            this.panels.block.setComponent(component, index > 0);
                        });
                    },
                    'toggler': () => {
                        return this.editing === true;
                    }
                },
                'copy-block': {
                    'text': Locale.t('editor.contextmenu.copy-block', 'Copy block'),
                    'callback': (el) => {
                        const component = el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore;
                        const config = component.getPropertyValues();
                        config.x += 5;
                        config.y += 5;

                        this.clipboard.setData('block', config);
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (el.closest('.metaScore-component.block, .metaScore-component.block-toggler') ? true : false);
                    }
                },
                'paste-block': {
                    'text': Locale.t('editor.contextmenu.paste-block', 'Paste block'),
                    'callback': () => {
                        this.addPlayerComponents('block', this.clipboard.getData(), this.getPlayer());
                    },
                    'toggler': (el) => {
                        return (this.editing === true) && (this.clipboard.getDataType() === 'block') && (el.is('.metaScore-player'));
                    }
                },
                'delete-blocks': {
                    'text': () => {
                        if(this.panels.block.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.delete-selected-blocks', 'Delete selected blocks');
                        }
                        return Locale.t('editor.contextmenu.delete-block', 'Delete block');
                    },
                    'callback': (el) => {
                        let blocks = this.panels.block.getComponents().filter((block) => block.instanceOf('Block') || block.instanceOf('BlockToggler'));
                        if(blocks.length === 0){
                            blocks = [el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore];
                        }
                        this.deletePlayerComponents('block', blocks);
                    },
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.block.getComponents().length > 0){
                            return true;
                        }
                        const dom = el.closest('.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'lock-block': {
                    'text': Locale.t('editor.contextmenu.lock-block', 'Lock block'),
                    'callback': (el) => {
                        el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setPropertyValue('locked', true);
                    },
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = el.closest('.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'unlock-block': {
                    'text': Locale.t('editor.contextmenu.unlock-block', 'Unlock block'),
                    'callback': (el) => {
                        el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setPropertyValue('locked', false);
                    },
                    'toggler': (el) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = el.closest('.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && dom._metaScore.getPropertyValue('locked');
                    }
                },
                'block-separator': {
                    'class': 'separator',
                    'toggler': () => {
                        return (this.editing === true);
                    }
                },
                'about': {
                    'text': Locale.t('editor.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': this.constructor.getVersion(), '!revision': this.constructor.getRevision()})
                }
            }})
            .appendTo(this.workspace);

        return this;
    }

    /**
     * Updates the editing state
     *
     * @method setEditing
     * @param {Boolean} editing The new state
     * @param {Boolean} sticky Whether the new state is persistent or temporary
     * @chainable
     */
    setEditing(editing, sticky){
        const player = this.getPlayer();

        this.editing = editing !== false;

        if(sticky !== false){
            this.persistentEditing = this.editing;
        }

		Object.entries(this.panels).forEach(([, panel]) => {
            if(this.editing){
                panel.enable();
            }
            else{
                panel.disable();
            }
        });

        this.toggleClass('editing', this.editing);

        if(player){
            player.toggleClass('editing', this.editing);
        }

        this.toggleSidebarResizer();

        return this;
    }

    /**
     * Toggles the activation of the sidebar resizer
     *
     * @method toggleSidebarResizer
     * @private
     * @chainable
     */
    toggleSidebarResizer() {
        if(!this.hasClass('editing') || this.hasClass('sidebar-hidden')){
            this.sidebar_resizer.disable();
        }
        else{
            this.sidebar_resizer.enable();
        }

        return this;
    }

    /**
     * Loads a player from the location hash
     *
     * @method loadPlayerFromHash
     * @private
     * @chainable
     */
    loadPlayerFromHash() {
        const hash = window.location.hash;
        const match = hash.match(/(#|&)guide=(\w+)(:(\d+))?/);

        if(match){
            this.loadPlayer(match[2], match[4]);
        }

        return this;
    }

    /**
     * Updates the states of the mainmenu buttons
     *
     * @method updateMainmenu
     * @private
     * @chainable
     */
    updateMainmenu() {
        const player = this.getPlayer();
        const hasPlayer = player ? true : false;

        this.mainmenu.toggleButton('edit', hasPlayer);
        this.mainmenu.toggleButton('save', hasPlayer);
        this.mainmenu.toggleButton('clone', hasPlayer);
        this.mainmenu.toggleButton('publish', hasPlayer);
        this.mainmenu.toggleButton('delete', hasPlayer);
        this.mainmenu.toggleButton('share', hasPlayer && player.getData('published'));
        this.mainmenu.toggleButton('download', hasPlayer);
        this.mainmenu.toggleButton('edit-toggle', hasPlayer);

        this.mainmenu.toggleButton('undo', this.history.hasUndo());
        this.mainmenu.toggleButton('redo', this.history.hasRedo());
        this.mainmenu.toggleButton('revert', this.isDirty());

        return this;
    }

    /**
     * Updates the selector of the block panel
     *
     * @method updateBlockSelector
     * @private
     * @chainable
     */
    updateBlockSelector() {
        const panel = this.panels.block;
        const selector = panel.getToolbar().getSelector();

        selector.clear();

        this.getPlayer().getComponents('.media.video, .controller, .block, .block-toggler').forEach((block) => {
            selector.addOption(block.getId(), panel.getSelectorLabel(block));
        });

        const block = panel.getComponent();
        selector.setValue(block ? block.getId() : null, true);

        return this;
    }

    /**
     * Updates the selector of the page panel
     *
     * @method updatePageSelector
     * @private
     * @chainable
     */
    updatePageSelector() {
        const selector = this.panels.page.getToolbar().getSelector();
        const blocks = this.panels.block.getComponents().filter((block) => block.instanceOf('Block'));

        // clear the selector
        selector.clear();

        if(blocks.length > 0){
            selector.enable();

            // add each page to the selector grouped by block
            blocks.forEach((block) => {
                const optgroup = blocks.length === 1 ? null : selector.addGroup(this.panels.block.getSelectorLabel(block));

                block.getPages().forEach((page, index) => {
                    selector.addOption(page.getId(), index+1, optgroup);
                });
            });

            // set the selector's value to all selected pages
            const pages = this.panels.page.getComponents();
            selector.setValue(pages.map((page) => page.getId()), true);
        }
        else{
            selector.disable();
        }

        return this;
    }

    /**
     * Updates the selector of the element panel
     *
     * @method updateElementSelector
     * @private
     * @chainable
     */
    updateElementSelector() {
        const panel = this.panels.element;
        const pages = this.panels.page.getComponents();
        const selector = panel.getToolbar().getSelector();

        // clear the selector
        selector.clear();

        if(pages.length > 0){
            selector.enable();

            pages.forEach((page) => {
                const block_optgroup = pages.length === 1 ? null : selector.addGroup(this.panels.block.getSelectorLabel(page.getBlock()));
                const optgroups = {};

                // fill the list of optgroups
                page.getElements().forEach((element) => {
                    const rindex = element.getPropertyValue('r-index') || 0;

                    if(!(rindex in optgroups)){
                        optgroups[rindex] = [];
                    }

                    optgroups[rindex].push(element);
                });

                // create the optgroups and their options
                Object.keys(optgroups).sort(naturalSortInsensitive).forEach((rindex) => {
                    const options = optgroups[rindex];

                    // sort options by element names
                    options.sort((a, b) => {
                        return naturalCompare(a.getName(), b.getName(), false);
                    });

                    // create the optgroup
                    const optgroup = selector.addGroup(Locale.t('editor.elementSelectorGroupLabel', 'Reading index !rindex', {'!rindex': rindex}), block_optgroup).attr('data-r-index', rindex);

                    // create the options
                    options.forEach((element) => {
                        selector.addOption(element.getId(), panel.getSelectorLabel(element), optgroup);
                    });
                });
            });

            const elements = panel.getComponents();
            selector.setValue(elements.map((element) => element.getId()), true);
        }
        else{
            selector.disable();
        }

        return this;
    }

    /**
     * Set whether the guide is dirty
     *
     * @method setDirty
     * @param {Boolean} dirty Whether the guide is dirty
     * @chainable
     */
    setDirty(dirty){
        this.dirty = dirty;

        return this;
    }

    /**
     * Check whether the guide is dirty
     *
     * @method isDirty
     * @return {Boolean} Whether the guide is dirty
     */
    isDirty() {
        return this.dirty;
    }

    /**
     * Get the player instance if any
     *
     * @method getPlayer
     * @return {Player} The player instance
     */
    getPlayer() {
        return this.player;
    }

    /**
     * Loads a player by guide id and vid
     *
     * @method loadPlayer
     * @param {String} id The guide's id
     * @param {Integer} vid The guide's revision id
     * @chainable
     */
    loadPlayer(id, vid){
        let url = `${this.configs.player_url + id}?autoload=0&keyboard=0`;

        if(vid){
            url += `&vid=${vid}`;
        }

        const loadmask = new LoadMask({
            'parent': this,
            'autoShow': true
        });

        this.unloadPlayer();

        this.player_frame = new Dom('<iframe/>', {'src': url, 'class': 'player-frame'}).appendTo(this.workspace)
            .addListener('load', this.onPlayerFrameLoadSuccess.bind(this, loadmask))
            .addListener('error', this.onPlayerFrameLoadError.bind(this, loadmask));

        return this;
    }

    /**
     * Unload the player
     *
     * @method unloadPlayer
     * @chainable
     */
    unloadPlayer() {
        delete this.player;
        delete this.dirty_data;

        this.player_contextmenu.disable();

        if(this.player_frame){
            this.player_frame.remove();
            delete this.player_frame;
        }

        this.panels.block.unsetComponents();
        this.history.clear();
        this.setDirty(false)
            .setEditing(false)
            .updateMainmenu();

        window.history.replaceState(null, null, '#');

        return this;
    }

    /**
     * Add components to the player
     *
     * @method addPlayerComponents
     * @private
     * @param {String} type The components' type
     * @param {Array} configs An array of configs to use when creating the components
     * @param {Mixed} parent The components' parent
     * @chainable
     */
    addPlayerComponents(type, configs, parent){
        if(!isArray(configs)){
            configs = [configs];
        }

        switch(type){
            case 'element': {
                const page = parent;
                const panel = this.panels.element;
                const components = [];

                this.panels.block.setComponent(page.getBlock());
                this.panels.page.setComponent(page);

                configs.forEach((config, index) => {
                    let name = '';
                    const el_index = page.children(`.element.${config.type}`).count() + 1;

                    switch(config.type){
                        case 'Cursor':
                            name = `cur ${el_index}`;
                            break;
                        case 'Image':
                            name = `img ${el_index}`;
                            break;

                        case 'Text':
                            name = `txt ${el_index}`;
                            break;
                    }

                    const component = page.addElement(Object.assign({'name': name}, config));
                    panel.setComponent(component, index > 0);
                    components.push(component);
                });

                this.history.add({
                    'undo': function(){
                        panel.unsetComponents();
                        components.forEach((component) => {
                            component.remove();
                        })
                    },
                    'redo': function(){
                        components.forEach((component, index) => {
                            page.addElement(component);
                            panel.setComponent(component, index > 0);
                        });
                    }
                });
                break;
            }

            case 'page': {
                const block = parent;
                const panel = this.panels.page;
                const config = configs[0]; // only one page can be added at a time !
                const index = block.getActivePageIndex();
                let current_time = null;

                if(block.getPropertyValue('synched')){
                    const media = this.getPlayer().getMedia();
                    const duration = media.getDuration();

                    current_time = media.getTime();

                    // prevent adding the page if current time == 0 or >= media duration
                    if(current_time === 0 || current_time >= duration){
                        new Alert({
                            'parent': this,
                            'text': Locale.t('editor.addPlayerComponents.page.time.msg', "In a synchronized block, a page cannot be inserted at the media's beginning (@start_time) or end (@duration).<br/><b>Please move the media to a different time before inserting a new page.</b>", {'@start_time': TimeField.getTextualValue(0), '@duration': TimeField.getTextualValue(duration)}),
                            'buttons': {
                                'ok': Locale.t('editor.addPlayerComponents.page.time.ok', 'OK'),
                            },
                            'autoShow': true
                        });

                        break;
                    }

                    const previous_page = block.getPage(index);
                    config['start-time'] = current_time;
                    config['end-time'] = previous_page.getPropertyValue('end-time');

                    previous_page.setPropertyValue('end-time', current_time);
                }

                const component = block.addPage(config, index + 1);
                block.setActivePage(index + 1);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponents();
                        if(block.getPropertyValue('synched')){
                            const previous_page = block.getPage(index);
                            previous_page.setPropertyValue('end-time', component.getPropertyValue('end-time'));
                        }
                        block.removePage(component);
                        block.setActivePage(index);
                    },
                    'redo': function(){
                        if(block.getPropertyValue('synched')){
                            const previous_page = block.getPage(index);
                            previous_page.setPropertyValue('end-time', current_time);
                        }
                        block.addPage(component, index + 1);
                        block.setActivePage(index + 1);
                    }
                });
                break;
            }

            case 'block': {
                const player = parent;
                const panel = this.panels.block;
                const components = [];

                configs.forEach((config, index) => {
                    let component = null;

                    switch(config.type){
                        case 'BlockToggler':
                            component = player.addBlockToggler(Object.assign({'name': Locale.t('editor.onBlockPanelToolbarClick.defaultBlockTogglerName', 'untitled')}, config));
                            break;

                        default: {
                            component = player.addBlock(Object.assign({'name': Locale.t('editor.onBlockPanelToolbarClick.defaultBlockName', 'untitled')}, config));

                            // add a page
                            const page_configs = {};
                            if(component.getPropertyValue('synched')){
                                page_configs['start-time'] = 0;
                                page_configs['end-time'] = player.getMedia().getDuration();
                            }
                            component.addPage(page_configs);
                        }
                    }

                    panel.setComponent(component, index > 0);
                    components.push(component);
                });

                this.history.add({
                    'undo': function(){
                        panel.unsetComponents();
                        components.forEach((component) => {
                            component.remove();
                        });
                    },
                    'redo': function(){
                        components.forEach((component, index) => {
                            parent[`add${component.getPropertyValue('type')}`](component);
                            panel.setComponent(component, index > 0);
                        });
                    }
                });
                break;
            }
        }

        this.player_frame.focus();

        return this;
    }

    /**
     * Remove components from the player
     *
     * @method deletePlayerComponents
     * @private
     * @param {Array} components The components
     * @chainable
     */
    deletePlayerComponents(type, components, confirm){
        if(confirm !== false){
            let alert_msg = '';

            switch(type){
                case 'block':
                    if(components.length > 1){
                        alert_msg = Locale.t('editor.deletePlayerComponents.blocks.msg', 'Are you sure you want to delete those @count blocks?', {'@count': components.length});
                    }
                    else{
                        alert_msg = Locale.t('editor.deletePlayerComponents.block.msg', 'Are you sure you want to delete the block "<em>@name</em>"?', {'@name': components[0].getName()});
                    }
                    break;

                case 'page':
                    if(components.length > 1){
                        alert_msg = Locale.t('editor.deletePlayerComponents.pages.msg', 'Are you sure you want to delete those @count pages?', {'@count': components.length});
                    }
                    else{
                        const block = components[0].getBlock();
                        const index = block.getPageIndex(components[0]) + 1;
                        alert_msg = Locale.t('editor.deletePlayerComponents.page.msg', 'Are you sure you want to delete page @index of "<em>@block</em>"?', {'@index': index, '@block': block.getName()});
                    }
                    break;

                case 'element':
                    if(components.length > 1){
                        alert_msg = Locale.t('editor.deletePlayerComponents.elements.msg', 'Are you sure you want to delete those @count elements?', {'@count': components.length});
                    }
                    else{
                        alert_msg = Locale.t('editor.deletePlayerComponents.element.msg', 'Are you sure you want to delete the element "<em>@name</em>"?', {'@name': components[0].getName()});
                    }
                    break;
            }

            new Alert({
                'parent': this,
                'text': alert_msg,
                'buttons': {
                    'confirm': Locale.t('editor.deletePlayerComponents.yes', 'Yes'),
                    'cancel': Locale.t('editor.deletePlayerComponents.no', 'No')
                },
                'autoShow': true
            })
            .addClass('delete-player-component')
            .addListener('buttonclick', (evt) => {
                if(evt.detail.action === 'confirm'){
                    this.deletePlayerComponents(type, components, false);
                }
            });
        }
        else{
            switch(type){
                case 'block': {
                    const panel = this.panels.block;

                    components.forEach((component) => {
                        panel.unsetComponent(component);
                        component.remove();
                    });

                    this.history.add({
                        'undo': () => {
                            const player = this.getPlayer();
                            components.forEach((component) => {
                                player[`add${component.getPropertyValue('type')}`](component);
                            });
                        },
                        'redo': () => {
                            components.forEach((component) => {
                                panel.unsetComponent(component);
                                component.remove();
                            });
                        }
                    });
                    break;
                }

                case 'page': {
                    const panel = this.panels.page;
                    const player = this.getPlayer();
                    const contexts = {};

                    components.forEach((component) => {
                        const block = component.getBlock();
                        const block_id = block.getId();
                        const index = block.getPageIndex(component);

                        contexts[block_id] = contexts[block_id] || {
                            'block': block,
                            'auto_page': null,
                            'pages': []
                        };

                        contexts[block_id].pages.push({
                            'component': component,
                            'index': index
                        });
                    });

                    const removePages = () => {
                        Object.entries(contexts).forEach(([, context]) => {
                            let page_index = 0;

                            // store original page start and end times
                            if(context.block.getPropertyValue('synched')){
                                context.times = {};
                                context.block.getPages().forEach((page) => {
                                    context.times[page.getId()] = {
                                        'start': page.getPropertyValue('start-time'),
                                        'end': page.getPropertyValue('end-time')
                                    };
                                });
                            }

                            // remove deleted pages
                            context.pages.forEach((ctx) => {
                                const index = context.block.getPageIndex(ctx.component);
                                panel.unsetComponent(ctx.component);

                                if(index > 0){
                                    // if there is a page before, update it's end time
                                    const previous_page = context.block.getPage(index - 1);
                                    previous_page.setPropertyValue('end-time', ctx.component.getPropertyValue('end-time'));
                                }
                                else if(context.block.getPageCount() > 1){
                                    // else if there is a page after, update it's start time
                                    const next_page = context.block.getPage(index + 1);
                                    next_page.setPropertyValue('start-time', ctx.component.getPropertyValue('start-time'));
                                }

                                context.block.removePage(ctx.component, true);

                                page_index = ctx.index - 1;
                            });

                            // add a new page if the block is empty
                            if(context.block.getPageCount() < 1){
                                const configs = {};

                                if(context.block.getPropertyValue('synched')){
                                    configs['start-time'] = 0;
                                    configs['end-time'] = player.getMedia().getDuration();
                                }

                                context.auto_page = context.block.addPage(configs);
                            }

                            context.block.setActivePage(Math.max(0, page_index));
                        });
                    };

                    const unremovePages = () => {
                        Object.entries(contexts).forEach(([, context]) => {
                            let page_index = 0;

                            // remove the new page if one was added
                            if(context.auto_page){
                                context.block.removePage(context.auto_page);
                            }

                            // re-add removed pages
                            context.pages.forEach((ctx) => {
                                context.block.addPage(ctx.component, ctx.index);
                                page_index = ctx.index;
                            });

                            // reset all page times
                            if(context.block.getPropertyValue('synched')){
                                context.block.getPages().forEach((page) => {
                                    const page_id = page.getId();
                                    if(page_id in context.times){
                                        page.setPropertyValue('start-time', context.times[page_id].start);
                                        page.setPropertyValue('end-time', context.times[page_id].end);
                                    }
                                });
                            }

                            context.block.setActivePage(page_index);
                        });
                    };

                    removePages();

                    this.history.add({
                        'undo': unremovePages,
                        'redo': removePages
                    });
                    break;
                }

                case 'element': {
                    const panel = this.panels.element;
                    const context = [];

                    components.forEach((component) => {
                        context.push({
                            'component': component,
                            'page': component.getPage()
                        });

                        panel.unsetComponent(component);
                        component.remove();
                    });

                    this.history.add({
                        'undo': function(){
                            context.forEach((ctx) => {
                                ctx.page.addElement(ctx.component);
                            });
                        },
                        'redo': function(){
                            context.forEach((ctx) => {
                                panel.unsetComponent(ctx.component);
                                ctx.component.remove();
                            });
                        }
                    });
                    break;
                }
            }

            this.player_frame.focus();
        }

        return this;
    }

    /**
     * Opens the guide selector
     *
     * @method openGuideSelector
     * @chainable
     */
    openGuideSelector() {
        new GuideSelector({
                'url': `${this.configs.api_url}guide.json`,
                'autoShow': true
            })
            .addListener('submit', this.onGuideSelectorSubmit.bind(this));

        return this;
    }

    /**
     * Creates a new guide
     *
     * @method createGuide
     * @private
     * @param {Object} details The guide's data
     * @param {GuideDetails} overlay The overlay instance used to create the guide
     * @chainable
     */
    createGuide(details, overlay){
        const data = this.prepareFormData(details);

        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.createGuide.LoadMask.text', 'Saving... (!percent%)'),
            'bar': true,
            'autoShow': true
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'data': data,
            'dataType': 'json',
            'onSuccess': (evt) => {
                overlay.hide();
                this.onGuideSaveSuccess(loadmask, evt);
            },
            'onError': this.onXHRError.bind(this, loadmask),
            'autoSend': false
        }, this.configs.ajax);

        const hundred = 100;
        Ajax.POST(`${this.configs.api_url}guide.json`, options)
            .addUploadListener('loadstart', () => {
                loadmask.setProgress(0);
            })
            .addUploadListener('progress', (evt) => {
                if (evt.lengthComputable) {
                    const percent = Math.floor((evt.loaded / evt.total) * hundred);
                    loadmask.setProgress(percent);
                }
            })
            .addUploadListener('loadend', () => {
                loadmask.setProgress(hundred);
            })
            .send();

        return this;
    }

    /**
     * Saves the loaded guide
     *
     * @method saveGuide
     * @param {String} action The action to perform when saving ('update' or 'clone')
     * @param {Boolean} publish Whether to published the new revision
     * @chainable
     */
    saveGuide(action, publish){
        const player = this.getPlayer();
        const id = player.getId();
        const vid = player.getRevision();
        const components = player.getComponents('.media, .controller, .block, .block-toggler');

        // prepare the formdata from the dirty data
        const data = this.prepareFormData(this.dirty_data);

        // append the publish flag if true
        if(publish === true){
            data.append('publish', true);
        }

        // append blocks data
        components.forEach((component) => {
            data.append('blocks[]', JSON.stringify(component.getPropertyValues()));
        });

        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.saveGuide.LoadMask.text', 'Saving... (!percent%)'),
            'bar': true,
            'autoShow': true,
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'data': data,
            'dataType': 'json',
            'onSuccess': this.onGuideSaveSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask),
            'autoSend': false
        }, this.configs.ajax);

        const hundred = 100;
        Ajax.POST(`${this.configs.api_url}guide/${id}/${action}.json?vid=${vid}`, options)
            .addUploadListener('loadstart', () => {
                loadmask.setProgress(0);
            })
            .addUploadListener('progress', (evt) => {
                if (evt.lengthComputable) {
                    const percent = Math.floor((evt.loaded / evt.total) * hundred);
                    loadmask.setProgress(percent);
                }
            })
            .addUploadListener('loadend', () => {
                loadmask.setProgress(hundred);
            })
            .send();

        return this;
    }

    prepareFormData(data){
        const formdata = new FormData();

        if(data){
            Object.entries(data).forEach(([key, value]) => {
                if(key === 'blocks'){
                    return;
                }

                if((key === 'thumbnail' || key === 'media') && value.source === 'upload'){
                    formdata.append(`files[${key}]`, value.object);
                }
                else if(isArray(value)){
                    value.forEach((val) => {
                        formdata.append(`${key}[]`, isObject(val) ? JSON.stringify(val) : val);
                    });
                }
                else if(isObject(value)){
                    formdata.append(key, JSON.stringify(value));
                }
                else{
                    formdata.append(key, value);
                }
            });
        }

        return formdata;
    }

    /**
     * Get a media file's duration in centiseconds
     *
     * @method getMediaFileDuration
     * @private
     * @param {String} url The file's url
     * @param {Function} callback A callback function to call with the duration
     */
    getMediaFileDuration(file, callback){
        const renderer = this.getPlayer().getMedia().constructor.getRendererForMime(file.mime);
        if(renderer){
            renderer.getDurationFromURI(file.url, (error, duration) => {
                if(error){
                    callback(error);
                    return;
                }

                callback(null, Math.round(parseFloat(duration) * 100));
            });
        }
        else{
            callback(new Error(`No compatible renderer found for ${file.mine}`));
        }
    }

}
