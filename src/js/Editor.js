/* eslint-disable */

import Dom from './core/Dom';
import {getMediaFileDuration} from './core/utils/Media';
import {MasterClock} from './core/media/Clock';
import {isArray} from './core/utils/Var';
import Locale from './core/Locale';
import StyleSheet from './core/StyleSheet';
import MainMenu from './editor/MainMenu';
import ConfigsEditor from './editor/ConfigsEditor';
import UndoRedo from './editor/UndoRedo';
import Overlay from './core/ui/Overlay';
import Confirm from './core/ui/overlay/Confirm';
import LoadMask from './core/ui/overlay/LoadMask';
import Clipboard from './core/Clipboard';
import Ajax from './core/Ajax';
import ContextMenu from './core/ui/ContextMenu';
import TimeInput from './core/ui/input/TimeInput';
import Controller from './editor/Controller';
import Pane from './editor/Pane';
import Ruler from './editor/Ruler';
import Grid from './editor/Grid';
import AssetBrowser from './editor/AssetBrowser';

import {className} from '../css/Editor.scss';
import player_css from '!!raw-loader!postcss-loader!sass-loader!../css/editor/Player.scss';

/**
 * Provides the main Editor class
 *
 * @emits {ready} Fired when the editor is fully setup
 * @param {Object} editor The editor instance
 */
export default class Editor extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [container='body'] The HTMLElement, Dom instance, or CSS selector to which the editor should be appended
     * @property {Object} player Options for the player
     * @property {String} player.url The player URL
     * @property {String} player.update_url The player update URL
     * @property {Object} asset_browser Options to pass to the asset browser
     * @property {String} [lang='en'] The language to use for i18n
     * @property {Object} [xhr={}] Options to send with each XHR request. See {@link Ajax.send} for available options
     * @property {Object} [history] Options for the history
     * @property {Number} [history.grouping_timeout=100] The period of time in ms in which undo/redo operations are grouped into a single operation
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `metaScore-editor ${className}`, 'tabindex': 0});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The dirty data keys
         * @type {Object}
         */
        this.dirty = {};

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

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'container': 'body',
            'player': {
                'url': null,
                'update_url': null,
            },
            'asset_browser': {},
            'lang': 'en',
            'xhr': {},
            'history': {
                'grouping_timeout': 100
            }
        };
    }

    /**
    * Get the version number
    *
    * @return {String} The version number
    */
    static getVersion(){
        return "[[VERSION]]";
    }

    /**
    * Get the revirsion number
    *
    * @return {String} The revirsion number
    */
    static getRevision(){
        return "[[REVISION]]";
    }

    /**
    * Initialize
    */
    init(){
        // Top pane ////////////////////////
        const top_pane = new Pane({
                'axis': 'horizontal',
            })
            .addClass('top-pane')
            .appendTo(this);

        /**
         * The top menu
         * @type {MainMenu}
         */
        this.mainmenu = new MainMenu()
            .addDelegate('button[data-action]', 'click', this.onMainmenuClick.bind(this))
            .addDelegate('.input.title', 'valuechange', this.onMainmenuTitleChange.bind(this))
            .addDelegate('.input[data-action="preview-toggle"]', 'valuechange', this.onMainmenuPreviewToggleChange.bind(this))
            .addDelegate('.input.revisions', 'valuechange', this.onMainmenuRevisionsChange.bind(this))
            .appendTo(top_pane.getContents());

        // Tools pane ////////////////////////
        const tools_pane = new Pane({
                'axis': 'vertical',
                'resizable': {
                    'directions': ['right']
                }
            })
            .addClass('tools-pane')
            .appendTo(this);

        this.asset_browser = new AssetBrowser(Object.assign({'xhr': this.configs.xhr}, this.configs.asset_browser))
            .addListener('tabchange', this.onAssetBrowserTabChange.bind(this))
            .addListener('assetadd', this.onAssetBrowserAssetAdd.bind(this))
            .addListener('assetremove', this.onAssetBrowserAssetRemove.bind(this))
            .addListener('componentlinkclick', this.onAssetBrowserComponentLinkClick.bind(this))
            .appendTo(tools_pane.getContents());

        // Center pane ////////////////////////
        const center_pane = new Pane({
                'axis': 'vertical'
            })
            .addClass('center-pane')
            .appendTo(this);

        /**
         * The workspace
         * @type {Dom}
         */
        this.workspace = new Dom('<div/>', {'class': 'workspace'})
            .appendTo(center_pane.getContents());

        /**
         * The horizontal ruler
         * @type {Ruler}
         */
        this.x_ruler = new Ruler({
                'axis': 'x',
                'trackTarget': this.workspace
            })
            .appendTo(this.workspace)
            .init();

        /**
         * The vertical ruler
         * @type {Ruler}
         */
        this.y_ruler = new Ruler({
                'axis': 'y',
                'trackTarget': this.workspace
            })
            .appendTo(this.workspace)
            .init();

        /**
         * The grid
         * @type {Dom}
         */
        this.grid = new Grid()
            .appendTo(this.workspace)
            .init();

        // Config pane ////////////////////////
        const config_pane = new Pane({
                'axis': 'vertical',
                'resizable': {
                    'directions': ['left']
                }
            })
            .addClass('configs-pane')
            .appendTo(this);

        /**
         * The component form
         * @type {ConfigsEditor}
         */
        this.configs_editor = new ConfigsEditor()
            .addDelegate('.content-form', 'contentsunlock', this.onContentFormContentsUnlock.bind(this))
            .addDelegate('.content-form', 'contentslock', this.onContentFormContentsLock.bind(this))
            .addDelegate('.cursor-form', 'keyframeseditingstart', this.onCursorFormKeyframesEditingStart.bind(this))
            .addDelegate('.cursor-form', 'keyframeseditingstop', this.onCursorFormKeyframesEditingStop.bind(this))
            .appendTo(config_pane.getContents());

        // Bottom pane ////////////////////////
        const bottom_pane = new Pane({
                'axis': 'horizontal',
                'resizable': {
                    'directions': ['top']
                }
            })
            .addClass('bottom-pane')
            .appendTo(this);

        /**
         * The controller
         * @type {Controller}
         */
        this.controller = new Controller()
            .addListener('playheadclick', this.onControllerPlayheadClick.bind(this))
            .addListener('scenarioactivate', this.onControllerScenarioActivate.bind(this))
            .addListener('scenarioadd', this.onControllerScenarioAdd.bind(this))
            .addDelegate('button', 'click', this.onControllerControlsButtonClick.bind(this))
            .addDelegate('.time.input', 'valuechange', this.onControllerTimeFieldChange.bind(this))
            .addDelegate('.timeline .track, .timeline .handle', 'click', this.onTimelineTrackClick.bind(this))
            .addDelegate('.timeline', 'trackdrop', this.onTimelineTrackDrop.bind(this))
            .appendTo(bottom_pane.getContents());

        /**
         * The undo/redo handler
         * @type {UndoRedo}
         */
        this.history = new UndoRedo()
            .addListener('add', this.onHistoryAdd.bind(this))
            .addListener('undo', this.onHistoryUndo.bind(this))
            .addListener('redo', this.onHistoryRedo.bind(this));

        /**
         * The clipboard handler
         * @type {Clipboard}
         */
        this.clipboard = new Clipboard();

        // prevent the custom contextmenu from overriding the native one in inputs
        this.addDelegate('input', 'contextmenu', (evt) => {
            evt.stopImmediatePropagation();
        });

        Dom.addListener(window, 'beforeunload', this.onWindowBeforeUnload.bind(this));

        this
            .addListener('mousedown', this.onMousedown.bind(this))
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keyup', this.onKeyup.bind(this))
            .addDelegate('.time.input', 'valuein', this.onTimeInputValueIn.bind(this))
            .addDelegate('.time.input', 'valueout', this.onTimeInputValueOut.bind(this))
            .setClean()
            .setEditing(false)
            .updateMainmenu()
            .setupContextMenus()
            .loadPlayer();

        this.triggerEvent('ready', {'editor': this}, false, false);

    }

    /**
     * Setup the context menus
     *
     * @return {this}
     */
    setupContextMenus(){

        /**
         * The editor's context menu
         * @type {ContextMenu}
         */
        this.contextmenu = new ContextMenu({'target': this, 'items': {
            'about': {
                'text': Locale.t('editor.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': this.constructor.getVersion(), '!revision': this.constructor.getRevision()})
            }
        }})
        .appendTo(this);

        /**
         * The player's context menu
         * @type {ContextMenu}
         */
        this.player_contextmenu = new ContextMenu({'target': null, 'items': {
                'add-element': {
                    'text': Locale.t('editor.contextmenu.add-element', 'Add an element'),
                    'items': {
                        'add-element-cursor': {
                            'text': Locale.t('editor.contextmenu.add-element-cursor', 'Cursor'),
                            'callback': (context) => {
                                this.addPlayerComponents('element', {'type': 'Cursor'}, context.el.closest('.metaScore-component.page')._metaScore);
                            }
                        },
                        'add-element-content': {
                            'text': Locale.t('editor.contextmenu.add-element-content', 'Content'),
                            'callback': (context) => {
                                this.addPlayerComponents('element', {'type': 'Content'}, context.el.closest('.metaScore-component.page')._metaScore);
                            }
                        },
                        'add-element-animation': {
                            'text': Locale.t('editor.contextmenu.add-element-animation', 'Animation'),
                            'callback': (context) => {
                                this.addPlayerComponents('element', {'type': 'Animation'}, context.el.closest('.metaScore-component.page')._metaScore);
                            }
                        }
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.page') ? true : false);
                    }
                },
                'select-elements': {
                    'text': Locale.t('editor.contextmenu.select-elements', 'Select all elements'),
                    'callback': (context) => {
                        this.configs_editor.unsetComponents();
                        context.data.page.getChildren().forEach((element, index) => {
                            this.configs_editor.setComponent(element, index > 0);
                        });
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const dom = context.el.closest('.metaScore-component.page');
                            if(dom){
                                context.data.page = dom._metaScore;
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'copy-elements': {
                    'text': (context) => {
                        if(context.data.selected){
                            return Locale.t('editor.contextmenu.copy-selected-elements', 'Copy selected elements');
                        }
                        return Locale.t('editor.contextmenu.copy-element', 'Copy element');
                    },
                    'callback': (context) => {
                        const configs = [];
                        context.data.elements.forEach((element) => {
                            const config = element.getPropertyValues(true);
                            // Slightly move the copy by 5 pixels right and 5 pixels down.
                            config.x += 5;
                            config.y += 5;

                            configs.push(config);
                        });
                        this.clipboard.setData('element', configs);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const elements = this.configs_editor.getComponents('Element');
                            if(elements.length > 0){
                                context.data.selected = true;
                                context.data.elements = elements;
                                return true;
                            }
                            const dom = context.el.closest('.metaScore-component.element');
                            if(dom){
                                context.data.elements = [dom._metaScore];
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'paste-elements': {
                    'text': Locale.t('editor.contextmenu.paste-elements', 'Paste elements'),
                    'callback': (context) => {
                        this.addPlayerComponents('element', context.data.element, context.data.page);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            if(this.clipboard.getDataType() === 'element'){
                                const dom = context.el.closest('.metaScore-component.page');
                                if(dom){
                                    context.data.element = this.clipboard.getData();
                                    context.data.page = dom._metaScore;
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                },
                'delete-elements': {
                    'text': (context) => {
                        if(context.data.selected){
                            return Locale.t('editor.contextmenu.delete-selected-elements', 'Delete selected elements');
                        }
                        return Locale.t('editor.contextmenu.delete-element', 'Delete element');
                    },
                    'callback': (context) => {
                        this.deletePlayerComponents('element', context.data.elements);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const elements = this.configs_editor.getComponents('Element');
                            if(elements.length > 0){
                                context.data.selected = true;
                                context.data.elements = elements;
                                return true;
                            }
                            const dom = context.el.closest('.metaScore-component.element');
                            if(dom && !dom._metaScore.getPropertyValue('locked')){
                                context.data.elements = [dom._metaScore];
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'lock-element': {
                    'text': Locale.t('editor.contextmenu.lock-element', 'Lock element'),
                    'callback': (context) => {
                        context.data.element.setPropertyValue('locked', true);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const dom = context.el.closest('.metaScore-component.element');
                            if(dom && !dom._metaScore.getPropertyValue('locked')){
                                context.data.element = dom._metaScore;
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'unlock-element': {
                    'text': Locale.t('editor.contextmenu.unlock-element', 'Unlock element'),
                    'callback': (context) => {
                        context.data.element.setPropertyValue('locked', false);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const dom = context.el.closest('.metaScore-component.element');
                            if(dom && !dom._metaScore.getPropertyValue('locked')){
                                context.data.element = dom._metaScore;
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'element-separator': {
                    'class': 'separator',
                    'toggler': (context) => {
                        if(this.editing){
                            const elements = this.configs_editor.getComponents('Element');
                            if(elements.length > 0){
                                return true;
                            }
                            return (context.el.closest('.metaScore-component.page, .metaScore-component.element') ? true : false);
                        }
                        return false;
                    }
                },
                'add-page-before': {
                    'text': Locale.t('editor.contextmenu.add-page-before', 'Add a page before'),
                    'callback': (context) => {
                        this.addPlayerComponents('page', {'position': 'before'}, context.el.closest('.metaScore-component.block')._metaScore);
                    },
                    'toggler': (context) => {
                        return this.editing && (context.el.closest('.metaScore-component.block') ? true : false);
                    }
                },
                'add-page-after': {
                    'text': Locale.t('editor.contextmenu.add-page-after', 'Add a page after'),
                    'callback': (context) => {
                        this.addPlayerComponents('page', {'position': 'after'}, context.el.closest('.metaScore-component.block')._metaScore);
                    },
                    'toggler': (context) => {
                        return this.editing && (context.el.closest('.metaScore-component.block') ? true : false);
                    }
                },
                'delete-page': {
                    'text': (context) => {
                        if(context.data.selected){
                            return Locale.t('editor.contextmenu.delete-selected-pages', 'Delete selected pages');
                        }
                        return Locale.t('editor.contextmenu.delete-page', 'Delete page');
                    },
                    'callback': (context) => {
                        this.deletePlayerComponents('page', context.data.pages);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const pages = this.configs_editor.getComponents('Page');
                            if(pages.length > 0){
                                context.data.selected = true;
                                context.data.pages = pages;
                                return true;
                            }
                            const dom = context.el.closest('.metaScore-component.page');
                            if(dom){
                                context.data.pages = [dom._metaScore];
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'page-separator': {
                    'class': 'separator',
                    'toggler': (context) => {
                        return this.editing && (context.el.closest('.metaScore-component.block, .metaScore-component.page') ? true : false);
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
                    'toggler': (context) => {
                        return this.editing && (context.el.is('.metaScore-player'));
                    }
                },
                'select-blocks': {
                    'text': Locale.t('editor.contextmenu.select-blocks', 'Select all blocks'),
                    'callback': () => {
                        const components = this.getPlayer().getComponents('.block, .block-toggler, .media.video, .controller');
                        components.forEach((component, index) => {
                            this.configs_editor.setComponent(component, index > 0);
                        });
                    },
                    'toggler': () => {
                        return this.editing === true;
                    }
                },
                'copy-block': {
                    'text': Locale.t('editor.contextmenu.copy-block', 'Copy block'),
                    'callback': (context) => {
                        const component = context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore;
                        const config = component.getPropertyValues(true);

                        // Slightly move the copy by 5 pixels right and 5 pixels down.
                        config.x += 5;
                        config.y += 5;

                        this.clipboard.setData('block', config);
                    },
                    'toggler': (context) => {
                        return this.editing && (context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler') ? true : false);
                    }
                },
                'paste-block': {
                    'text': Locale.t('editor.contextmenu.paste-block', 'Paste block'),
                    'callback': () => {
                        this.addPlayerComponents('block', this.clipboard.getData(), this.getPlayer());
                    },
                    'toggler': (context) => {
                        return this.editing && (this.clipboard.getDataType() === 'block') && (context.el.is('.metaScore-player'));
                    }
                },
                'delete-blocks': {
                    'text': (context) => {
                        if(context.data.selected){
                            return Locale.t('editor.contextmenu.delete-selected-blocks', 'Delete selected blocks');
                        }
                        return Locale.t('editor.contextmenu.delete-block', 'Delete block');
                    },
                    'callback': (context) => {
                        this.deletePlayerComponents('block', context.data.blocks);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const blocks = this.configs_editor.getComponents('Block');
                            if(blocks.length > 0){
                                context.data.selected = true;
                                context.data.blocks = blocks;
                                return true;
                            }
                            const dom = context.el.closest('.metaScore-component.block');
                            if(dom){
                                context.data.blocks = [dom._metaScore];
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'lock-block': {
                    'text': Locale.t('editor.contextmenu.lock-block', 'Lock block'),
                    'callback': (context) => {
                        context.data.block.setPropertyValue('locked', true);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const dom = context.el.closest('.metaScore-component.block');
                            if(dom && !dom._metaScore.getPropertyValue('locked')){
                                context.data.block = dom._metaScore;
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'unlock-block': {
                    'text': Locale.t('editor.contextmenu.unlock-block', 'Unlock block'),
                    'callback': (context) => {
                        context.data.block.setPropertyValue('locked', false);
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            const dom = context.el.closest('.metaScore-component.block');
                            if(dom && !dom._metaScore.getPropertyValue('locked')){
                                context.data.block = dom._metaScore;
                                return true;
                            }
                        }
                        return false;
                    }
                },
                'block-separator': {
                    'class': 'separator',
                    'toggler': () => {
                        return this.editing === true;
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
    * Local load callback
    *
    * @private
    */
    onLocaleLoad(){
        this.init();
    }

    /**
     * XHR error callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     * @param {Event} evt The event object
     */
    onXHRError(loadmask, evt){
        loadmask.hide();

        new Overlay({
            'parent': this,
            'text': Locale.t('editor.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': evt.target.getStatusText(), '@code': evt.target.getStatus()}),
            'buttons': {
                'ok': Locale.t('editor.onXHRError.ok', 'OK'),
            }
        });
    }

    /**
     * Save success callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onSaveSuccess(loadmask){
        loadmask.hide();

        this.setClean();
        this.updateMainmenu();
    }

    /**
     * Restore success callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onRestoreSuccess(loadmask){
        loadmask.hide();

        this.loadPlayer();
    }

    /**
     * Keydown event callback
     *
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
                    this.setEditing(!this.editing);
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
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onKeyup(evt){
        if(Dom.is(evt.target, 'input')){
            return;
        }

        switch(evt.key){
            case "Alt":
                this.setEditing(!this.editing);
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
     * @private
     */
    onMousedown(){
        if(this.player_contextmenu){
            this.player_contextmenu.hide();
        }
    }

    onAssetBrowserTabChange(evt){
        this.toggleClass('assetbrowser-expanded', evt.detail.tab === 'shared-assets');
    }

    onAssetBrowserAssetAdd(){
        this.setDirty('assets');

        this.configs_editor.updateImageFields(this.asset_browser.getGuideAssets().getAssets());
    }

    onAssetBrowserAssetRemove(){
        this.setDirty('assets');

        this.configs_editor.updateImageFields(this.asset_browser.getGuideAssets().getAssets());
    }

    onAssetBrowserComponentLinkClick(evt){
        const component = evt.detail.component;
        const type = component.type;
        const configs = component.configs;

        switch(type){
            case 'element':
                this.configs_editor.getComponents('Page').forEach((page) => {
                    this.addPlayerComponents(type, configs, page);
                });
                break;
            case 'page':
                this.configs_editor.getComponents('Block').forEach((block) => {
                    this.addPlayerComponents(type, configs, block);
                });
                break;
            case 'block':
                this.addPlayerComponents(type, configs, this.getPlayer());
                break;
        }
    }

    /**
     * Mainmenu click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onMainmenuClick(evt){
        switch(Dom.data(evt.target, 'action')){
            case 'save':
                this.save();
                break;

            case 'revert':
                new Confirm({
                    'text': Locale.t('editor.onMainmenuClick.revert.text', 'Are you sure you want to revert back to the last saved version?<br/><strong>Any unsaved data will be lost.</strong>'),
                    'confirmLabel': Locale.t('editor.onMainmenuClick.revert.confirmLabel', 'Revert'),
                    'onConfirm': () => {
                        this.loadPlayer();
                    },
                    'parent': this
                });
                break;

            case 'undo':
                this.history.undo();
                break;

            case 'redo':
                this.history.redo();
                break;

            case 'restore':
                {
                    const player = this.getPlayer();
                    const text = Locale.t('editor.onMainmenuClick.restore.text', 'Are you sure you want to revert to revision @id from @date?', {
                        '@id': player.getRevision(),
                        '@date': new Date(player.getData('changed') * 1000).toLocaleDateString(),
                    });

                    new Confirm({
                        'text': text,
                        'confirmLabel': Locale.t('editor.onMainmenuClick.restore.confirmLabel', 'Restore'),
                        'onConfirm': () => {
                            this.save();
                        },
                        'parent': this
                    });
                }
                break;
        }
    }

    /**
     * Mainmenu title input valuechange event callback
     *
     * @private
     */
    onMainmenuTitleChange(){
        this.setDirty('title');
    }

    /**
     * Mainmenu preview toggle valuechange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onMainmenuPreviewToggleChange(evt){
        const value = evt.detail.value;

        this.setEditing(!value);
    }

    /**
     * Mainmenu revisions input valuechange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onMainmenuRevisionsChange(evt){
        const vid = evt.detail.value;

        if(this.isDirty()){
            new Confirm({
                'text': Locale.t('editor.onMainmenuRevisionsChange.confirm.msg', "You are about to load an old revision. Any unsaved data will be lost."),
                'onConfirm': () => {
                    this.loadPlayer(vid);
                },
                'parent': this
            });
        }
        else{
            this.loadPlayer(vid);
        }
    }

    /**
     * Controller timeset event callback
     *
     * @private
     */
    onControllerPlayheadClick(evt){
        MasterClock.setTime(evt.detail.time);
    }

    /**
     * Controller scenarioactivate event callback
     *
     * @private
     */
    onControllerScenarioActivate(evt){
        this.getPlayer().setActiveScenario(evt.detail.scenario);
    }

    /**
     * Controller scenarioadd event callback
     *
     * @private
     */
    onControllerScenarioAdd(evt){
        const scenario = evt.detail.scenario;

        this.getPlayer()
            .addScenario(scenario)
            .setActiveScenario(scenario);

        this.configs_editor.updateScenarioFields(this.player.getScenarios());

        this.setDirty('scenarios');
    }

    /**
     * Controller controls button click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object.
     */
    onControllerControlsButtonClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'play':
                this.getPlayer().togglePlay();
                break;

            case 'rewind':
                this.getPlayer().getMedia().reset();
                break;
        }
    }

    /**
     * Controller time field valuechange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onControllerTimeFieldChange(evt){
        MasterClock.setTime(evt.detail.value);
    }

    /**
     * Timeline track click event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onTimelineTrackClick(evt){
        const component_id = Dom.data(evt.target, 'component');
        const track = this.controller.getTimeline().getTrack(component_id);
        const component = track.getComponent();

        this.selectPlayerComponent(component, evt.shiftKey);
    }

    /**
     * Timeline trackdrop event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onTimelineTrackDrop(evt){
        const component = evt.detail.component;
        const position = evt.detail.position;

        component.insertAt(component.parents(), position);
    }

    /**
     * Time input valuein event callback
     *
     * @private
     * @param {CustomEvent} evt
     */
    onTimeInputValueIn(evt){
        const input = evt.detail.input;
        const time = this.getPlayer().getMedia().getTime();

        input.setValue(time);
    }

    /**
     * Time input valueout event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTimeInputValueOut(evt){
        MasterClock.setTime(evt.detail.value);
    }

    /**
     * ContentForm contentsunlock event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onContentFormContentsUnlock(evt){
        const component = evt.detail.component;

        this.getPlayer().addClass('isolating');
        component.addClass('isolate');
    }

    /**
     * ContentForm contentslock event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onContentFormContentsLock(evt){
        const component = evt.detail.component;

        this.getPlayer().removeClass('isolating');
        component.removeClass('isolate');
    }

    /**
     * CursorForm keyframeseditingstart event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onCursorFormKeyframesEditingStart(evt){
        const component = evt.detail.component;

        this.getPlayer().addClass('isolating');
        component.addClass('isolate');
    }

    /**
     * CursorForm keyframeseditingstop event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onCursorFormKeyframesEditingStop(evt){
        const component = evt.detail.component;

        this.getPlayer().removeClass('isolating');
        component.removeClass('isolate');
    }

    /**
     * Player sourceset event callback
     *
     * @private
     */
    onPlayerSourceSet(){
        const loadmask = new LoadMask({
            'parent': this
        });

        this.removeClass('metadata-loaded');

        MasterClock.setRenderer(null);

        this.getPlayer()
            .addOneTimeListener('mediaerror', (evt) => {
                loadmask.hide();

                new Overlay({
                    'parent': this,
                    'text': evt.detail.message,
                    'buttons': {
                        'ok': Locale.t('editor.onMediaError.ok', 'OK'),
                    }
                });
            })
            .addOneTimeListener('loadedmetadata', (evt) => {
                loadmask.hide();
            });
    }

    /**
     * Player loadedmetadata event callback
     *
     * @private
     */
    onPlayerLoadedMetadata(evt){
        const media = this.getPlayer().getMedia();

        this.addClass('metadata-loaded');

        MasterClock.setRenderer(evt.detail.renderer);

        media.reset();
    }

    /**
     * Player scenariochange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayerScenarioChange(evt){
        const scenario = evt.detail.scenario;

        // Deselect all components
        this.configs_editor.unsetComponents();

        // Update scenario selector
        this.controller.getScenarioSelector().setActiveScenario(scenario, true);

        // Update timeline
        const timeline = this.controller.getTimeline();
        this.getPlayer().getRootComponents().forEach((component) => {
            const track = timeline.getTrack(component.getId());

            if(component.getPropertyValue('scenario') === scenario){
                track.show();
            }
            else{
                track.hide();
            }
        });
    }

    /**
     * Player mousedown event callback
     *
     * @private
      */
    onPlayerMousedown(){
        this.contextmenu.hide();
    }

    /**
     * Player componentadd event callback
     *
     * @private
     */
    onPlayerComponentAdd(evt){
        const component = evt.detail.component;

        this.controller.getTimeline().addTrack(component);

        if(component.instanceOf('Block') || component.instanceOf('Media') || component.instanceOf('Controller')){
            this.getPlayer().updateBlockTogglers();
        }

        this.selectPlayerComponent(component);
    }

    /**
     * Player componentremove event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayerComponentRemove(evt){
        const component = evt.detail.component;

        this.configs_editor.unsetComponent(component, true);

        this.controller.getTimeline().removeTrack(component);

        if(component.instanceOf('Block') || component.instanceOf('Media') || component.instanceOf('Controller')){
            this.getPlayer().updateBlockTogglers();
        }
    }

    /**
     * Player frame load event callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onPlayerFrameLoadSuccess(loadmask){
        const iframe = this.player_frame.get(0);
        const player = iframe.contentWindow.player;

        Dom.bubbleIframeMouseEvent(iframe, 'mousemove');

        if(player){
            /**
             * The player instance
             * @type {Player}
             */
            this.player = player;

            // Create a new Dom instance to workaround the different JS contexts of the player and editor.
            new Dom(this.player.get(0))
                .addListener('load', this.onPlayerLoadSuccess.bind(this, loadmask))
                .addListener('error', this.onPlayerLoadError.bind(this, loadmask))
                .addListener('sourceset', this.onPlayerSourceSet.bind(this))
                .addListener('loadedmetadata', this.onPlayerLoadedMetadata.bind(this));

            this.player.load();

            this.addClass('has-player');
        }
    }

    /**
     * Player frame error event callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onPlayerFrameLoadError(loadmask){
        loadmask.hide();

        new Overlay({
            'parent': this,
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            }
        });
    }

    /**
     * Player load event callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onPlayerLoadSuccess(loadmask){
        this.player
            .addListener('play', this.onPlayerPlay.bind(this))
            .addListener('pause', this.onPlayerPause.bind(this));

        // Update the title field
        this.mainmenu.getItem('title').setValue(this.player.getData('title'), true);

        // Update the revision selector
        const revisions_select = this.mainmenu.getItem('revisions');
        const current_vid = this.player.getData('vid');
        this.player.getData('revisions').forEach((revision) => {
            const text = Locale.t('editor.mainmenu.revisions.option.text', 'Revision @id from @date by @author', {
                '@id': revision.vid,
                '@date': new Date(revision.created * 1000).toLocaleDateString(),
                '@author': revision.author
            });
            revisions_select.addOption(revision.vid, text);
        });
        revisions_select
            .setValue(current_vid, true)
            .getOption(current_vid).attr('disabled', 'true');

        // Update the asset browser
        this.asset_browser.getGuideAssets()
            .addAssets(this.player.getData('assets'), true)
            .addAssets(this.player.getData('shared_assets'), true);

        this.configs_editor
            .updateScenarioFields(this.player.getScenarios())
            .updateImageFields(this.asset_browser.getGuideAssets().getAssets());

        // Update the timeline
        const timeline = this.controller.getTimeline();
        this.player.getRootComponents().forEach((component) => {
            timeline.addTrack(component);
        });

        // Update the scenario list
        this.controller.getScenarioSelector()
            .clear()
            .addScenarios(this.player.getScenarios(), true);

        this.updateMainmenu();

        if(this.player.getData('default_revision')){
            this.player
                .addDelegate('.metaScore-component', 'propchange', this.onComponentPropChange.bind(this))
                .addDelegate('.metaScore-component', 'beforedrag', this.onComponentBeforeDrag.bind(this))
                .addDelegate('.metaScore-component', 'dragstart', this.onComponentDragStart.bind(this), true)
                .addDelegate('.metaScore-component', 'dragend', this.onComponentDragEnd.bind(this), true)
                .addDelegate('.metaScore-component', 'beforeresize', this.onComponentBeforeResize.bind(this))
                .addDelegate('.metaScore-component', 'resizestart', this.onComponentResizeStart.bind(this), true)
                .addDelegate('.metaScore-component', 'resizeend', this.onComponentResizeEnd.bind(this), true)
                .addDelegate('.metaScore-component, .metaScore-component *', 'click', this.onComponentClick.bind(this))
                .addListener('componentadd', this.onPlayerComponentAdd.bind(this))
                .addListener('componentremove', this.onPlayerComponentRemove.bind(this))
                .addListener('scenariochange', this.onPlayerScenarioChange.bind(this))
                .addListener('mousedown', this.onPlayerMousedown.bind(this))
                .addListener('keydown', this.onKeydown.bind(this))
                .addListener('keyup', this.onKeyup.bind(this))
                .addListener('click', this.onPlayerClick.bind(this))
                .addListener('dragover', this.onPlayerDragOver.bind(this))
                .addListener('drop', this.onPlayerDrop.bind(this));

            // Add the editor's specific stylesheet
            const player_document = this.player_frame.get(0).contentWindow.document;
            new StyleSheet(player_css)
                .appendTo(player_document.head);

            // Replace the player context menu with the editor's one
            this.player.contextmenu.disable();
            this.player_contextmenu
                .setTarget(player_document.body)
                .enable();

            this.setEditing(true);
        }
        else{
            this.setEditing(false);
        }

        loadmask.hide();
    }

    /**
     * Player error event callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onPlayerLoadError(loadmask){
        loadmask.hide();

        new Overlay({
            'parent': this,
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            }
        });
    }

    onPlayerDragOver(evt){
        /**
         * @todo: highlight drop zone
         * @todo: handle page before, page after
         **/

        if(this.getPlayer().hasClass('contents-unlocked')){
            return;
        }

        if(evt.dataTransfer.types.includes('metascore/component') || evt.dataTransfer.types.includes('metascore/asset')){
            evt.preventDefault();
        }
    }

    onPlayerDrop(evt){
        if(this.getPlayer().hasClass('contents-unlocked')){
            return;
        }

        try{
            if(evt.dataTransfer.types.includes('metascore/component')){
                this.onPlayerDropComponent(evt);
            }
            else if(evt.dataTransfer.types.includes('metascore/asset')){
                this.onPlayerDropAsset(evt);
            }
        }
        catch(e){
            console.error(e);
        }

        evt.preventDefault();
    }

    onPlayerDropComponent(evt){
        const data = JSON.parse(evt.dataTransfer.getData('metascore/component'));

        switch(data.type){
            case 'element': {
                    const parent = evt.target.closest('.metaScore-component.page')._metaScore;
                    const parent_rect = parent.get(0).getBoundingClientRect();
                    const configs = Object.assign({
                        'x': evt.clientX - parent_rect.left,
                        'y': evt.clientY - parent_rect.top
                    }, data.configs);
                    this.addPlayerComponents(data.type, configs, parent);
                }
                break;

            case 'page': {
                    const parent = evt.target.closest('.metaScore-component.block')._metaScore;
                    this.addPlayerComponents(data.type, data.configs, parent);
                }
                break;

            case 'block': {
                    const configs = Object.assign({
                        'x': evt.clientX,
                        'y': evt.clientY
                    }, data.configs);
                    this.addPlayerComponents(data.type, configs, this.getPlayer());
                }
                break;
        }

    }

    onPlayerDropAsset(evt){
        const asset = JSON.parse(evt.dataTransfer.getData('metascore/asset'));

        if('shared' in asset && asset.shared){
            switch(asset.type){
                case 'image': {
                        const parent = evt.target.closest('.metaScore-component.page')._metaScore;
                        const parent_rect = parent.get(0).getBoundingClientRect();

                        const configs = {
                            'type': 'Content',
                            'background-image': asset.file.url,
                            'x': evt.clientX - parent_rect.left,
                            'y': evt.clientY - parent_rect.top,
                        };

                        this.addPlayerComponents('element', configs, parent);
                    }
                    break;

                case 'lottie_animation': {
                        const parent = evt.target.closest('.metaScore-component.page')._metaScore;
                        const parent_rect = parent.get(0).getBoundingClientRect();

                        const configs = {
                            'type': 'Animation',
                            'src': asset.file.url,
                            'x': evt.clientX - parent_rect.left,
                            'y': evt.clientY - parent_rect.top,
                        };

                        this.addPlayerComponents('element', configs, parent);
                    }
                    break;
            }
        }
    }

    /**
     * Player click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onPlayerClick(evt){
        if(this.editing !== true){
            return;
        }

		this.configs_editor.unsetComponents();

        evt.stopPropagation();
    }

    /**
     * Player playing event callback
     *
     * @private
     */
    onPlayerPlay(){
        this.addClass('playing');
    }

    /**
     * Player pause event callback
     *
     * @private
     */
    onPlayerPause(){
        this.removeClass('playing');
    }

    /**
     * Component propchange event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentPropChange(evt){
        const component = evt.detail.component;
        const property = evt.detail.property;

        if(component.instanceOf('Media') || component.instanceOf('Controller') || component.instanceOf('Block') || component.instanceOf('BlockToggler')){
            if(['x', 'y', 'width', 'height', 'blocks'].includes(property)){
                this.getPlayer().updateBlockTogglers();
            }
        }

        // If we are not in an undo or redo operation, group property changes via a timeout
        if(!this.history.isExecuting()){
            if(this._oncomponentpropchange_timeout){
                clearTimeout(this._oncomponentpropchange_timeout);
            }

            if(!this._oncomponentpropchange_stack){
                this._oncomponentpropchange_stack = [];
            }

            // Check if the component and property are already in the stack
            const existing = this._oncomponentpropchange_stack.find((detail) => {
                return detail.component === component && detail.property === property;
            });
            if(existing){
                // The component and property are already in the stack, update the value
                existing.value = evt.detail.value;
            }
            else{
                // Add the component and property to the stack
                this._oncomponentpropchange_stack.push(evt.detail);
            }

            this._oncomponentpropchange_timeout = setTimeout(this.onComponentPropChangeTimeout.bind(this), this.configs.history.grouping_timeout);
        }
    }

    /**
     * Component propchange event timeout callback
     *
     * @private
     */
    onComponentPropChangeTimeout(){
        const stack = this._oncomponentpropchange_stack;

        delete this._oncomponentpropchange_stack;
        delete this._oncomponentpropchange_timeout;

        this.history.add({
            'undo': () => {
                stack.forEach((detail) => {
                    detail.component.setPropertyValue(detail.property, detail.old);
                });
            },
            'redo': () => {
                stack.forEach((detail) => {
                    detail.component.setPropertyValue(detail.property, detail.value);
                });
            }
        });
    }

    /**
     * Component beforedrag event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentBeforeDrag(evt){
        if(this.editing !== true){
            evt.preventDefault();
        }
    }

    /**
     * Component dragstart event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentDragStart(evt){
        const draggable = evt.detail.behavior;
        const siblings = new Dom(evt.target).siblings('.metaScore-component:not(.audio):not(.selected)');

        siblings.forEach((sibling) => {
            if(new Dom(sibling).hidden()){
                // Do not add guides for hidden siblings
                return;
            }

            const rect = sibling.getBoundingClientRect();
            draggable
                .addSnapGuide('x', rect.left)
                .addSnapGuide('x', rect.right)
                .addSnapGuide('x', rect.left + rect.width / 2)
                .addSnapGuide('y', rect.top)
                .addSnapGuide('y', rect.bottom)
                .addSnapGuide('y', rect.top + rect.height / 2);
        });
    }

    /**
     * Component dragend event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentDragEnd(evt){
        const draggable = evt.detail.behavior;
        draggable.clearSnapGudies();
    }

    /**
     * Component beforeresize event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentBeforeResize(evt){
        if(this.editing !== true){
            evt.preventDefault();
        }
    }

    /**
     * Component resizestart event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentResizeStart(evt){
        const resizable = evt.detail.behavior;
        const siblings = new Dom(evt.target).siblings('.metaScore-component:not(.audio):not(.selected)');

        siblings.forEach((sibling) => {
            if(new Dom(sibling).hidden()){
                // Do not add guides for hidden siblings
                return;
            }

            const rect = sibling.getBoundingClientRect();
            resizable
                .addSnapGuide('x', rect.left)
                .addSnapGuide('x', rect.right)
                .addSnapGuide('x', rect.left + rect.width / 2)
                .addSnapGuide('y', rect.top)
                .addSnapGuide('y', rect.bottom)
                .addSnapGuide('y', rect.top + rect.height / 2);
        });
    }

    /**
     * Component resizeend event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentResizeEnd(evt){
        const resizable = evt.detail.behavior;
        resizable.clearSnapGudies();
    }

    /**
     * Component click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onComponentClick(evt){
        if(this.editing !== true){
            return;
        }

        let component = null;
        if(!Dom.is(evt.target, '.metaScore-component')){
            component = Dom.closest(evt.target, '.metaScore-component')._metaScore;
        }
        else{
            component = evt.target._metaScore;
        }

        this.selectPlayerComponent(component, evt.shiftKey);

        evt.stopImmediatePropagation();
    }

    /**
     * History add event callback
     *
     * @private
     */
    onHistoryAdd(){
        this.setDirty('components');
        this.updateMainmenu();
    }

    /**
     * History undo event callback
     *
     * @private
     */
    onHistoryUndo(){
        this.updateMainmenu();
    }

    /**
     * History redo event callback
     *
     * @private
     */
    onHistoryRedo(){
        this.updateMainmenu();
    }

    /**
     * Window beforeunload event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onWindowBeforeUnload(evt){
        if(this.isDirty()){
            evt.returnValue = Locale.t('editor.onWindowBeforeUnload.msg', 'Any unsaved data will be lost.');
        }
    }

    /**
     * Updates the editing state
     *
     * @param {Boolean} editing The new state
     * @return {this}
     */
    setEditing(editing){
        const player = this.getPlayer();

        /**
         * Whether in editing mode
         * @type {Boolean}
         */
        this.editing = editing !== false;

        this.toggleClass('editing', this.editing);

        this.mainmenu.getItem('preview-toggle').setValue(!this.editing, true);

        if(player){
            player.toggleClass('editing', this.editing);
        }

        return this;
    }

    /**
     * Updates the states of the mainmenu buttons
     *
     * @private
     * @return {this}
     */
    updateMainmenu() {
        const player = this.getPlayer();
        const default_revision = player && player.getData('default_revision');

        this.mainmenu
            .toggleItem('save', default_revision)
            .toggleItem('title', default_revision)
            .toggleItem('preview-toggle', default_revision)
            .toggleItem('undo', this.history.hasUndo())
            .toggleItem('redo', this.history.hasRedo())
            .toggleItem('revert', this.isDirty())
            .toggleItem('restore', !default_revision);

        return this;
    }

    /**
     * Set data as dirty/modified
     *
     * @param {String} key The key corresponding to the dirty data
     * @return {this}
     */
    setDirty(key){
        this.dirty[key] = true;

        return this;
    }

    /**
     * Set data as clean/not modified
     *
     * @param {String} key The key corresponding to the data; if undefined, all data will be set as clean
     * @return {this}
     */
    setClean(key){
        if(typeof key !== 'undefined'){
            delete this.dirty[key];
        }
        else{
            this.dirty = {};
        }

        return this;
    }

    /**
     * Check whether there are unsaved data
     *
     * @param {String} key The key corresponding to the data; if undefined, checks whether any data is dirty
     * @return {Boolean} Whether unsaved data exists
     */
    isDirty(key) {
        if(typeof key !== 'undefined'){
            return key in this.dirty && this.dirty[key];
        }
        else{
            return Object.keys(this.dirty).length > 0;
        }
    }

    /**
     * Get the player instance if any
     *
     * @return {Player} The player instance
     */
    getPlayer() {
        return this.player;
    }

    /**
     * Loads the player
     *
     * @param {Number} [vid] The revision id to load; if undefined, the current revision will be loaded
     * @return {this}
     */
    loadPlayer(vid){
        const loadmask = new LoadMask({
            'parent': this
        });

        this.unloadPlayer();

        const url = new URL(this.configs.player.url);
        if(typeof vid !== 'undefined'){
            const params = url.searchParams;
            params.set('vid', vid);
        }

        /**
         * The player's iframe
         * @type {Dom}
         */
        this.player_frame = new Dom('<iframe/>', {'src': url.toString(), 'class': 'player-frame'}).appendTo(this.workspace)
            .addListener('load', this.onPlayerFrameLoadSuccess.bind(this, loadmask))
            .addListener('error', this.onPlayerFrameLoadError.bind(this, loadmask));

        return this;
    }

    /**
     * Unload the player
     *
     * @return {this}
     */
    unloadPlayer() {
        delete this.player;

        this.configs_editor.unsetComponents();

        this
            .removeClass('has-player')
            .removeClass('metadata-loaded');

        this.player_contextmenu.disable();

        this.mainmenu.getItem('revisions').clear();

        this.asset_browser.getGuideAssets().clearAssets();

        this.history.clear();

        this.setClean()
            .setEditing(false)
            .updateMainmenu();

        if(this.player_frame){
            this.player_frame.remove();
            delete this.player_frame;
        }

        return this;
    }

    /**
     * Add components to the player
     *
     * @private
     * @param {String} type The components' type
     * @param {Mixed} config A config or an array of configs to use when creating the component(s)
     * @param {Mixed} parent The components' parent
     * @return {this}
     */
    addPlayerComponents(type, config, parent){
        const scenario = this.getPlayer().getActiveScenario();

        switch(type){
            case 'element': {
                const configs = isArray(config) ? config : [config];
                const page = parent;
                const components = [];

                configs.forEach((element_config) => {
                    const type = element_config.type;
                    const el_index = page.children(`.element.${type}`).count() + 1;
                    const defaults = {};

                    switch(type){
                        case 'Cursor': {
                                defaults.name = `cur ${el_index}`;

                                defaults['start-time'] = page.getPropertyValue('start-time');
                                if(defaults['start-time'] === null){
                                    defaults['start-time'] = MasterClock.getTime();
                                }

                                defaults['end-time'] = page.getPropertyValue('end-time');
                                if(defaults['end-time'] === null){
                                    defaults['end-time'] = MasterClock.getRenderer().getDuration();
                                }
                            }
                            break;

                        case 'Content':
                            defaults.name = `content ${el_index}`;
                            break;

                        case 'Animation':
                            defaults.name = `anim ${el_index}`;
                            break;
                    }

                    const component = page.addElement(Object.assign(defaults, element_config));
                    components.push(component);
                });

                this.history.add({
                    'undo': () => {
                        components.forEach((component) => {
                            component.remove();
                        })
                    },
                    'redo': () => {
                        components.forEach((component) => {
                            page.addElement(component);
                        });
                    }
                });
                break;
            }

            case 'page': {
                const block = parent;
                const before = 'position' in config  && config.position === 'before';
                const index = block.getActivePageIndex();
                let current_time = null;

                delete config.position;

                if(block.getPropertyValue('synched')){
                    const media = this.getPlayer().getMedia();
                    const duration = media.getDuration();

                    current_time = media.getTime();

                    // prevent adding the page if current time == 0 or >= media duration
                    if(current_time === 0 || current_time >= duration){
                        new Overlay({
                            'parent': this,
                            'text': Locale.t('editor.addPlayerComponents.page.time.msg', "In a synchronized block, a page cannot be inserted at the media's beginning (@start_time) or end (@duration).<br/><b>Please move the media to a different time before inserting a new page.</b>", {'@start_time': TimeInput.getTextualValue(0), '@duration': TimeInput.getTextualValue(duration)}),
                            'buttons': {
                                'ok': Locale.t('editor.addPlayerComponents.page.time.ok', 'OK'),
                            }
                        });

                        break;
                    }

                    const adjacent_page = block.getChild(index);
                    config['start-time'] = before ? adjacent_page.getPropertyValue('start-time') : current_time;
                    config['end-time'] = before ? current_time : adjacent_page.getPropertyValue('end-time');
                    adjacent_page.setPropertyValue(before ? 'start-time' : 'end-time', current_time);
                }

                const component = block.addPage(config, before ? index : index + 1);

                block.setActivePage(index);

                this.history.add({
                    'undo': () => {
                        if(block.getPropertyValue('synched')){
                            const adjacent_page = block.getChild(before ? index + 1 : index);
                            const prop = before ? 'start-time' : 'end-time';
                            adjacent_page.setPropertyValue(prop, component.getPropertyValue(prop));
                        }
                        component.remove();
                        block.setActivePage(index);
                    },
                    'redo': ()=> {
                        if(block.getPropertyValue('synched')){
                            const adjacent_page = block.getChild(index);
                            const prop = before ? 'start-time' : 'end-time';
                            adjacent_page.setPropertyValue(prop, current_time);
                        }
                        block.addPage(component, before ? index : index + 1);
                    }
                });
                break;
            }

            case 'block': {
                const configs = isArray(config) ? config : [config];
                const player = parent || this.player;
                const components = [];

                configs.forEach((block_config) => {
                    let component = null;

                    switch(block_config.type){
                        case 'BlockToggler':
                            component = player.addBlockToggler(Object.assign({
                                'scenario': scenario,
                                'name': Locale.t('editor.defaultBlockTogglerName', 'untitled')
                            }, block_config));
                            break;

                        default: {
                            component = player.addBlock(Object.assign({
                                'scenario': scenario,
                                'name': Locale.t('editor.defaultBlockName', 'untitled')
                            }, block_config));
                        }
                    }

                    components.push(component);
                });

                this.history.add({
                    'undo': () => {
                        components.forEach((component) => {
                            component.remove();
                        });
                    },
                    'redo': () => {
                        components.forEach((component) => {
                            parent[`add${component.getPropertyValue('type')}`](component);
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
     * @private
     * @param {String} type The components' type
     * @param {Array} components The components
     * @param {Boolean} confirm Whether to display a confirmation dialog
     * @return {this}
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
                        const block = components[0].getParent();
                        const index = block.getChildIndex(components[0]) + 1;
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

            new Confirm({
                'text': alert_msg,
                'onConfirm': () => {
                    this.deletePlayerComponents(type, components, false);
                },
                'parent': this
            })
            .addClass('delete-player-component');
        }
        else{
            switch(type){
                case 'block': {
                    components.forEach((component) => {
                        this.configs_editor.unsetComponent(component);
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
                                this.configs_editor.unsetComponent(component);
                                component.remove();
                            });
                        }
                    });
                    break;
                }

                case 'page': {
                    const player = this.getPlayer();
                    const contexts = {};

                    components.forEach((component) => {
                        const block = component.getParent();
                        const block_id = block.getId();
                        const index = block.getChildIndex(component);

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
                        Object.values(contexts).forEach((context) => {
                            let page_index = 0;

                            // store original page start and end times
                            if(context.block.getPropertyValue('synched')){
                                context.times = {};
                                context.block.getChildren().forEach((page) => {
                                    context.times[page.getId()] = {
                                        'start': page.getPropertyValue('start-time'),
                                        'end': page.getPropertyValue('end-time')
                                    };
                                });
                            }

                            // remove deleted pages
                            context.pages.forEach((ctx) => {
                                const index = context.block.getChildIndex(ctx.component);
                                this.configs_editor.unsetComponent(ctx.component);

                                if(index > 0){
                                    // if there is a page before, update it's end time
                                    const previous_page = context.block.getChild(index - 1);
                                    previous_page.setPropertyValue('end-time', ctx.component.getPropertyValue('end-time'));
                                }
                                else if(context.block.getChildrenCount() > 1){
                                    // else if there is a page after, update it's start time
                                    const next_page = context.block.getChild(index + 1);
                                    next_page.setPropertyValue('start-time', ctx.component.getPropertyValue('start-time'));
                                }

                                ctx.component.remove();

                                page_index = ctx.index - 1;
                            });

                            // add a new page if the block is empty
                            if(context.block.getChildrenCount() < 1){
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
                        Object.values(contexts).forEach((context) => {
                            let page_index = 0;

                            // remove the new page if one was added
                            if(context.auto_page){
                                context.auto_page.remove();
                            }

                            // re-add removed pages
                            context.pages.forEach((ctx) => {
                                context.block.addPage(ctx.component, ctx.index);
                                page_index = ctx.index;
                            });

                            // reset all page times
                            if(context.block.getPropertyValue('synched')){
                                context.block.getChildren().forEach((page) => {
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
                    const context = [];

                    components.forEach((component) => {
                        context.push({
                            'component': component,
                            'page': component.getParent()
                        });

                        this.configs_editor.unsetComponent(component);
                        component.remove();
                    });

                    this.history.add({
                        'undo': () => {
                            context.forEach((ctx) => {
                                ctx.page.addElement(ctx.component);
                            });
                        },
                        'redo': () => {
                            context.forEach((ctx) => {
                                this.configs_editor.unsetComponent(ctx.component);
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
     * Select a component in the player
     *
     * @private
     * @param {Component} component The component
     * @param {Boolean} keep_existing Whether to keep already selected components selected
     * @return {this}
     */
    selectPlayerComponent(component, keep_existing){
        if(keep_existing && this.configs_editor.getComponents().includes(component)){
            this.configs_editor.unsetComponent(component);
        }
        else{
            this.configs_editor.setComponent(component, keep_existing);
        }

        return this;
    }

    /**
     * Saves the loaded guide
     *
     * @return {this}
     */
    save(){
        if(this.mainmenu.getItem('title').reportValidity()){
            const player = this.getPlayer();
            const data = new FormData();
            const url = new URL(this.configs.player.update_url);

            const loadmask = new LoadMask({
                'parent': this,
                'text': Locale.t('editor.save.LoadMask.text', 'Saving...'),
                'bar': true
            });

            const options = Object.assign({}, this.configs.xhr, {
                'data': data,
                'responseType': 'json',
                'onError': this.onXHRError.bind(this, loadmask),
                'autoSend': false
            });

            if(!player.getData('default_revision')){
                // This is a restore operation
                const params = url.searchParams;
                params.set('vid', this.getPlayer().getRevision());

                options.onSuccess = this.onRestoreSuccess.bind(this, loadmask);
            }
            else{
                options.onSuccess = this.onSaveSuccess.bind(this, loadmask);

                // Add title
                if(this.isDirty('title')){
                    data.append('title', this.mainmenu.getItem('title').getValue());
                }

                // Add scenarios
                if(this.isDirty('scenarios')){
                    player.getScenarios().forEach((scenario) => {
                        data.append('scenarios[]', scenario);
                    });
                }

                // Add components
                if(this.isDirty('components')){
                    const components = player.getRootComponents();
                    components.forEach((component) => {
                        data.append('components[]', JSON.stringify(component.getPropertyValues()));
                    });
                }

                // Add assets
                if(this.isDirty('assets')){
                    Object.values(this.asset_browser.getGuideAssets().getAssets()).forEach((asset) => {
                        data.append('assets[]', JSON.stringify(asset));
                    });
                }
            }

            const hundred = 100;
            Ajax.PATCH(url.toString(), options)
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
        }

        return this;
    }
}
