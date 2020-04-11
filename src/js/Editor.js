import Dom from './core/Dom';
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
import AssetBrowser from './editor/AssetBrowser';

import {className} from '../css/Editor.scss';
import player_css from '!!raw-loader!postcss-loader!sass-loader!../css/editor/Player.scss';

/**
 * Provides the main Editor class
 *
 * @emits {ready} Fired when the editor is fully setup
 * @param {Object} editor The editor instance
 */
export class Editor extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [container='body'] The HTMLElement, Dom instance, or CSS selector to which the editor should be appended
     * @property {Object} player Options for the player
     * @property {String} player.url The player URL
     * @property {String} player.update_url The player update URL
     * @property {String} publish_url The URL of the publish button
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
            'publish_url': null,
            'autosave': {
                'url': null,
                'interval': null
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
        // Set the banner for ContextMenus
        ContextMenu.setBannerText(Locale.t('Editor.contextmenu.banner', 'metaScore Editor v.!version r.!revision', {'!version': this.constructor.getVersion(), '!revision': this.constructor.getRevision()}));

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
            .addDelegate('button', 'click', this.onMainmenuClick.bind(this))
            .addDelegate('.input', 'valuechange', this.onMainmenuInputChange.bind(this))
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

        this.asset_browser = new AssetBrowser(this, Object.assign({'xhr': this.configs.xhr}, this.configs.asset_browser))
            .addListener('tabchange', this.onAssetBrowserTabChange.bind(this))
            .addListener('assetadd', this.onAssetBrowserAssetAdd.bind(this))
            .addListener('beforeassetremove', this.onAssetBrowserBeforeAssetRemove.bind(this))
            .addListener('assetremove', this.onAssetBrowserAssetRemove.bind(this))
            .addListener('componentlinkclick', this.onAssetBrowserComponentLinkClick.bind(this))
            .addListener('spectrogramformopen', this.onAssetBrowserSpectrogramFormOpen.bind(this))
            .appendTo(tools_pane.getContents());

        // Center pane ////////////////////////
        const center_pane = new Pane({
                'axis': 'vertical'
            })
            .addClass('center-pane')
            .appendTo(this);

        new Dom('<div/>', {'class': 'top-ruler-gutter'})
            .appendTo(center_pane.getContents());

        new Dom('<div/>', {'class': 'left-ruler-gutter'})
            .appendTo(center_pane.getContents());

        const top_ruler = new Dom('<div/>', {'class': 'top-ruler'})
            .appendTo(center_pane.getContents());

        const left_ruler = new Dom('<div/>', {'class': 'left-ruler'})
            .appendTo(center_pane.getContents());

        /**
         * The workspace
         * @type {Dom}
         */
        this.workspace = new Dom('<div/>', {'class': 'workspace'})
            .appendTo(center_pane.getContents());

        new Ruler({
                'axis': 'x',
                'trackTarget': this.workspace
            })
            .appendTo(top_ruler)
            .init();

        new Ruler({
                'axis': 'y',
                'trackTarget': this.workspace
            })
            .appendTo(left_ruler)
            .init();

        /**
         * The player wrapper container.
         * @type {Dom}
         */
        this.player_wrapper = new Dom('<div/>', {'class': 'player-wrapper'})
            .appendTo(this.workspace);

        /**
         * The grid
         * @type {Dom}
         */
        this.grid = new Dom('<div/>', {'class': 'grid'})
            .appendTo(this.player_wrapper);

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
        this.configs_editor = new ConfigsEditor(this)
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
        this.controller = new Controller(this)
            .addDelegate('.timeline .track, .timeline .handle', 'click', this.onTimelineTrackClick.bind(this))
            .addDelegate('.timeline', 'trackdrop', this.onTimelineTrackDrop.bind(this))
            .appendTo(bottom_pane.getContents());

        /**
         * The auto-save indicator
         * @type {Dom}
         */
        this.autosave_indicator = new Dom('<div/>', {'class': 'autosave-indicator'})
            .text(Locale.t('Editor.autosaveIndicator.text', 'Saving auto-recovery data...'))
            .hide()
            .appendTo(this);

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
        Dom.addListener(window, 'unload', this.onWindowUnload.bind(this));

        this
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keyup', this.onKeyup.bind(this))
            .addDelegate('.time.input', 'valuein', this.onTimeInputValueIn.bind(this))
            .addDelegate('.time.input', 'valueout', this.onTimeInputValueOut.bind(this))
            .setEditing(false)
            .setClean()
            .setupContextMenus();

        this.triggerEvent('ready', {'editor': this}, false, false);

        // Check if auto-save data exists.
        if(this.configs.autosave && this.configs.autosave.url){
            const loadmask = this.createLoadMask();
            const options = Object.assign({}, this.configs.xhr, {
                'responseType': 'json',
                'onSuccess': () => {
                    loadmask.hide();

                    new Confirm({
                        'text': Locale.t('editor.autosave.recover.text', 'Auto-save data were found for this guide. Would you like to recover them?'),
                        'confirmLabel': Locale.t('editor.autosave.recover.confirmLabel', 'Recover'),
                        'onConfirm': () => {
                            this.loadPlayer({'autosave': ''});
                        },
                        'onCancel': () => {
                            // Delete auto-save data.
                            Ajax.DELETE(this.configs.autosave.url, this.configs.xhr);

                            // Load the player with the latest revision.
                            this.loadPlayer();
                        },
                        'parent': this
                    });
                },
                'onError': () => {
                    loadmask.hide();
                    this.loadPlayer();
                }
            });

            Ajax.HEAD(this.configs.autosave.url, options);
        }
        else{
            this.loadPlayer();
        }
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
        this.contextmenu = new ContextMenu({'target': this}).appendTo(this);

        /**
         * The player's context menu
         * @type {ContextMenu}
         */
        this.player_contextmenu = new ContextMenu({'target': null, 'items': {
                'element': {
                    'text': Locale.t('editor.contextmenu.element', 'Element'),
                    'items': {
                        'select': {
                            'text': Locale.t('editor.contextmenu.select-elements', 'Select all elements'),
                            'callback': (context, data) => {
                                this.configs_editor.unsetComponents();
                                data.parent.getChildren().forEach((element, index) => {
                                    this.configs_editor.setComponent(element, index > 0);
                                });
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const dom = context.el.closest('.metaScore-component.page');
                                    if(dom){
                                        data.parent = dom._metaScore;
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'copy': {
                            'text': (context, data) => {
                                if(data.selected){
                                    return Locale.t('editor.contextmenu.copy-selected-elements', 'Copy selected elements');
                                }
                                return Locale.t('editor.contextmenu.copy-element', 'Copy element');
                            },
                            'callback': (context, data) => {
                                const configs = [];
                                data.components.forEach((element) => {
                                    const config = element.getPropertyValues(true);
                                    // Slightly move the copy by 5 pixels right and 5 pixels down.
                                    config.x += 5;
                                    config.y += 5;

                                    configs.push(config);
                                });
                                this.clipboard.setData('element', configs);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const elements = this.configs_editor.getComponents('Element');
                                    if(elements.length > 0){
                                        data.selected = true;
                                        data.components = elements;
                                        return true;
                                    }
                                    const dom = context.el.closest('.metaScore-component.element');
                                    if(dom){
                                        data.components = [dom._metaScore];
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'paste': {
                            'text': Locale.t('editor.contextmenu.paste-elements', 'Paste elements'),
                            'callback': (context, data) => {
                                this.addPlayerComponents('element', data.component, data.parent);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    if(this.clipboard.getDataType() === 'element'){
                                        const dom = context.el.closest('.metaScore-component.page');
                                        if(dom){
                                            data.component = this.clipboard.getData();
                                            data.parent = dom._metaScore;
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            }
                        },
                        'delete': {
                            'text': (context, data) => {
                                if(data.selected){
                                    return Locale.t('editor.contextmenu.delete-selected-elements', 'Delete selected elements');
                                }
                                return Locale.t('editor.contextmenu.delete-element', 'Delete element');
                            },
                            'callback': (context, data) => {
                                this.deletePlayerComponents('element', data.components);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const elements = this.configs_editor.getComponents('Element');
                                    if(elements.length > 0){
                                        data.selected = true;
                                        data.components = elements;
                                        return true;
                                    }
                                    const dom = context.el.closest('.metaScore-component.element');
                                    if(dom && !dom._metaScore.getPropertyValue('editor.locked')){
                                        data.components = [dom._metaScore];
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'lock': {
                            'text': Locale.t('editor.contextmenu.lock-element', 'Lock element'),
                            'callback': (context, data) => {
                                data.component.setPropertyValue('editor.locked', true);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const dom = context.el.closest('.metaScore-component.element');
                                    if(dom && !dom._metaScore.getPropertyValue('editor.locked')){
                                        data.component = dom._metaScore;
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'unlock': {
                            'text': Locale.t('editor.contextmenu.unlock-element', 'Unlock element'),
                            'callback': (context, data) => {
                                data.component.setPropertyValue('editor.locked', false);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const dom = context.el.closest('.metaScore-component.element');
                                    if(dom && !dom._metaScore.getPropertyValue('editor.locked')){
                                        data.component = dom._metaScore;
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'arrange': {
                            'text': Locale.t('editor.contextmenu.arrange', 'Arrange'),
                            'items': {
                                'bring-to-front': {
                                    'text': Locale.t('editor.contextmenu.arrange.bring-to-front', 'Bring to front'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        const position = component.parents().children().count();
                                        this.setPlayerComponentOrder(component, position);
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.element');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                },
                                'send-to-back': {
                                    'text': Locale.t('editor.contextmenu.arrange.send-to-back', 'Send to back'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        this.setPlayerComponentOrder(component, 0);
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.element');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                },
                                'bring-forward': {
                                    'text': Locale.t('editor.contextmenu.arrange.bring-forward', 'Bring forward'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        const siblings = component.parents().children();

                                        let position = siblings.index(`#${component.getId()}`);
                                        position = Math.min(siblings.count(), position + 2);

                                        this.setPlayerComponentOrder(component, position);
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.element');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                },
                                'send-backward': {
                                    'text': Locale.t('editor.contextmenu.arrange.send-backward', 'Send backward'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        const siblings = component.parents().children();

                                        let position = siblings.index(`#${component.getId()}`);
                                        position = Math.max(0, position - 1);

                                        this.setPlayerComponentOrder(component, position);
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.element');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                }
                            },
                            'toggler': (context) => {
                                if(this.editing){
                                    const dom = context.el.closest('.metaScore-component.element');
                                    if(dom){
                                        return true;
                                    }
                                }
                                return false;
                            }
                        }
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            return context.el.closest('.metaScore-component.page') ? true : false
                        }
                        return false;
                    }
                },
                'page': {
                    'text': Locale.t('editor.contextmenu.page', 'Page'),
                    'items': {
                        'add-before': {
                            'text': Locale.t('editor.contextmenu.add-page-before', 'Add a page before'),
                            'callback': (context) => {
                                this.addPlayerComponents('page', {'position': 'before'}, context.el.closest('.metaScore-component.block')._metaScore);
                            },
                            'toggler': (context) => {
                                return this.editing && (context.el.closest('.metaScore-component.block') ? true : false);
                            }
                        },
                        'add-after': {
                            'text': Locale.t('editor.contextmenu.add-page-after', 'Add a page after'),
                            'callback': (context) => {
                                this.addPlayerComponents('page', {'position': 'after'}, context.el.closest('.metaScore-component.block')._metaScore);
                            },
                            'toggler': (context) => {
                                return this.editing && (context.el.closest('.metaScore-component.block') ? true : false);
                            }
                        },
                        'delete': {
                            'text': (context, data) => {
                                if(data.selected){
                                    return Locale.t('editor.contextmenu.delete-selected-pages', 'Delete selected pages');
                                }
                                return Locale.t('editor.contextmenu.delete-page', 'Delete page');
                            },
                            'callback': (context, data) => {
                                this.deletePlayerComponents('page', data.components);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const pages = this.configs_editor.getComponents('Page');
                                    if(pages.length > 0){
                                        data.selected = true;
                                        data.components = pages;
                                        return true;
                                    }
                                    const dom = context.el.closest('.metaScore-component.page');
                                    if(dom){
                                        data.components = [dom._metaScore];
                                        return true;
                                    }
                                }
                                return false;
                            }
                        }
                    },
                    'toggler': (context) => {
                        if(this.editing){
                            return context.el.closest('.metaScore-component.block') ? true : false
                        }
                        return false;
                    }
                },
                'block': {
                    'text': Locale.t('editor.contextmenu.block', 'Block'),
                    'items': {
                        'add': {
                            'text': Locale.t('editor.contextmenu.add-block', 'Add a block'),
                            'items': {
                                'add-block-synched': {
                                    'text': Locale.t('editor.contextmenu.add-block-synched', 'Synchronized'),
                                    'callback': () => {
                                        this.addPlayerComponents('block', {'type': 'Block', 'synched': true});
                                    }
                                },
                                'add-block-non-synched': {
                                    'text': Locale.t('editor.contextmenu.add-block-non-synched', 'Non-synchronized'),
                                    'callback': () => {
                                        this.addPlayerComponents('block', {'type': 'Block', 'synched': false});
                                    }
                                },
                                'separator': {
                                    'class': 'separator'
                                },
                                'add-video-renderer': {
                                    'text': Locale.t('editor.contextmenu.add-video-renderer', 'Video renderer'),
                                    'callback': () => {
                                        this.addPlayerComponents('block', {'type': 'VideoRenderer'});
                                    }
                                },
                                'add-controller': {
                                    'text': Locale.t('editor.contextmenu.add-controller', 'Controller'),
                                    'callback': () => {
                                        this.addPlayerComponents('block', {'type': 'Controller'});
                                    }
                                },
                                'add-block-toggler': {
                                    'text': Locale.t('editor.contextmenu.add-block-toggler', 'Block Toggler'),
                                    'callback': () => {
                                        this.addPlayerComponents('block', {'type': 'BlockToggler'});
                                    }
                                }
                            },
                            'toggler': (context) => {
                                return this.editing && (context.el.is('.metaScore-player'));
                            }
                        },
                        'select': {
                            'text': Locale.t('editor.contextmenu.select-blocks', 'Select all blocks'),
                            'callback': () => {
                                const scenario = this.getPlayer().getActiveScenario();
                                if(scenario){
                                    scenario.getChildren().forEach((component, index) => {
                                        this.configs_editor.setComponent(component, index > 0);
                                    });
                                }
                            },
                            'toggler': () => {
                                return this.editing === true;
                            }
                        },
                        'copy': {
                            'text': (context, data) => {
                                if(data.selected){
                                    return Locale.t('editor.contextmenu.copy-selected-blocks', 'Copy selected blocks');
                                }
                                return Locale.t('editor.contextmenu.copy-block', 'Copy block');
                            },
                            'callback': (context, data) => {
                                const configs = [];
                                data.components.forEach((block) => {
                                    const config = block.getPropertyValues(true);
                                    // Slightly move the copy by 5 pixels right and 5 pixels down.
                                    config.x += 5;
                                    config.y += 5;

                                    configs.push(config);
                                });
                                this.clipboard.setData('block', configs);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const blocks = this.configs_editor.getComponents(['Block', 'VideoRenderer', 'Controller', 'BlockToggler']);
                                    if(blocks.length > 0){
                                        data.selected = true;
                                        data.components = blocks;
                                        return true;
                                    }
                                    const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                    if(dom){
                                        data.components = [dom._metaScore];
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'paste': {
                            'text': Locale.t('editor.contextmenu.paste-block', 'Paste block'),
                            'callback': () => {
                                this.addPlayerComponents('block', this.clipboard.getData());
                            },
                            'toggler': (context) => {
                                return this.editing && (this.clipboard.getDataType() === 'block') && (context.el.is('.metaScore-player'));
                            }
                        },
                        'delete': {
                            'text': (context, data) => {
                                if(data.selected){
                                    return Locale.t('editor.contextmenu.delete-selected-blocks', 'Delete selected blocks');
                                }
                                return Locale.t('editor.contextmenu.delete-block', 'Delete block');
                            },
                            'callback': (context, data) => {
                                this.deletePlayerComponents('block', data.components);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const blocks = this.configs_editor.getComponents(['Block', 'VideoRenderer', 'Controller', 'BlockToggler']);
                                    if(blocks.length > 0){
                                        data.selected = true;
                                        data.components = blocks;
                                        return true;
                                    }
                                    const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                    if(dom){
                                        data.components = [dom._metaScore];
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'lock': {
                            'text': Locale.t('editor.contextmenu.lock-block', 'Lock block'),
                            'callback': (context, data) => {
                                data.component.setPropertyValue('editor.locked', true);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                    if(dom && !dom._metaScore.getPropertyValue('editor.locked')){
                                        data.component = dom._metaScore;
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'unlock': {
                            'text': Locale.t('editor.contextmenu.unlock-block', 'Unlock block'),
                            'callback': (context, data) => {
                                data.component.setPropertyValue('editor.locked', false);
                            },
                            'toggler': (context, data) => {
                                if(this.editing){
                                    const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                    if(dom && !dom._metaScore.getPropertyValue('editor.locked')){
                                        data.component = dom._metaScore;
                                        return true;
                                    }
                                }
                                return false;
                            }
                        },
                        'arrange': {
                            'text': Locale.t('editor.contextmenu.arrange', 'Arrange'),
                            'items': {
                                'bring-to-front': {
                                    'text': Locale.t('editor.contextmenu.arrange.bring-to-front', 'Bring to front'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        const parent = component.parents();
                                        component.appendTo(parent);
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                },
                                'send-to-back': {
                                    'text': Locale.t('editor.contextmenu.arrange.send-to-back', 'Send to back'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        const parent = component.parents();
                                        component.insertAt(parent, 0);
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                },
                                'bring-forward': {
                                    'text': Locale.t('editor.contextmenu.arrange.bring-forward', 'Bring forward'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        const parent = component.parents();
                                        const siblings = parent.children();
                                        const position = siblings.index(`#${component.getId()}`);
                                        component.insertAt(parent, Math.min(siblings.count(), position + 2));
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                },
                                'send-backward': {
                                    'text': Locale.t('editor.contextmenu.arrange.send-backward', 'Send backward'),
                                    'callback': (context, data) => {
                                        const component = data.component;
                                        const parent = component.parents();
                                        const siblings = parent.children();
                                        const position = siblings.index(`#${component.getId()}`);
                                        component.insertAt(parent, Math.max(0, position - 1));
                                    },
                                    'toggler': (context, data) => {
                                        if(this.editing){
                                            const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                            if(dom){
                                                data.component = dom._metaScore;
                                                return true;
                                            }
                                        }
                                        return false;
                                    }
                                }
                            },
                            'toggler': (context) => {
                                if(this.editing){
                                    const dom = context.el.closest('.metaScore-component.block, .metaScore-component.video-renderer, .metaScore-component.controller, .metaScore-component.block-toggler');
                                    if(dom){
                                        return true;
                                    }
                                }
                                return false;
                            }
                        }
                    }
                }
            }})
            .addListener('beforeshow', this.onPlayerContextMenuBeforeShow.bind(this))
            .appendTo(this);

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
            'text': Locale.t('editor.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': evt.target.getStatusText(), '@code': evt.target.getStatus()}),
            'buttons': {
                'ok': Locale.t('editor.onXHRError.ok', 'OK'),
            },
            'parent': this
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

        this.setClean().updateMainmenu(true);
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
     * Player ContextMenu beforeshow event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayerContextMenuBeforeShow(evt){
        // Adjust menu position.
        const pos = evt.detail.pos;
        const editor_rect = this.get(0).getBoundingClientRect();
        const player_rect = this.player_frame.get(0).getBoundingClientRect();
        pos.x += player_rect.left - editor_rect.left;
        pos.y += player_rect.top - editor_rect.top;
    }

    /**
     * AssetBrowser tabchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onAssetBrowserTabChange(evt){
        this.toggleClass('assetbrowser-expanded', evt.detail.tab === 'shared-assets');
    }

    /**
     * AssetBrowser assetadd event callback
     *
     * @private
     */
    onAssetBrowserAssetAdd(){
        this.updateConfigEditorImageFields();
    }

    /**
     * AssetBrowser beforeassetremove event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onAssetBrowserBeforeAssetRemove(evt){
        const asset = evt.detail.asset;
        const file = 'shared' in asset && asset.shared ? asset.file : asset;

        if(/^image\/.*/.test(file.mimetype)){
            const components = this.findComponentsWithAsset(file.url);
            if(components.length > 0){
                const names = components.map((component) => {
                    return component.getName();
                });

                new Overlay({
                    'text': Locale.t('editor.onAssetBrowserBeforeAssetRemove.used.msg', '<em>!asset</em> cannot be deleted as it is being used in the following components: <em>!components</em>.', {'!asset': asset.name, '!components': names.join('</em>, <em>')}),
                    'buttons': {
                        'ok': Locale.t('editor.onAssetBrowserBeforeAssetRemove.used.ok', 'OK'),
                    },
                    'parent': this
                });

                evt.preventDefault();
            }
        }
    }

    findComponentsWithAsset(url, component){
        let results = [];

        if(typeof component === "undefined"){
            this.getPlayer().getScenarios().forEach((scenario) => {
                results = results.concat(this.findComponentsWithAsset(url, scenario));
            });
        }
        else{
            if(component.hasProperty('background-image') && component.getPropertyValue('background-image') === url){
                results.push(component);
            }

            component.getChildren().forEach((child) => {
                results = results.concat(this.findComponentsWithAsset(url, child));
            });
        }

        return results;
    }

    /**
     * AssetBrowser assetremove event callback
     *
     * @private
     */
    onAssetBrowserAssetRemove(){
        this.setDirty('assets');
        this.updateConfigEditorImageFields();
    }

    /**
     * AssetBrowser componentlinkclick event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onAssetBrowserComponentLinkClick(evt){
        const type = evt.detail.type;
        const configs = evt.detail.configs;

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

    onAssetBrowserSpectrogramFormOpen(evt){
        const form = evt.detail.form;
        const configs_form = this.configs_editor.getForm();

        if(configs_form){
            const component = configs_form.getMasterComponent();
            const defaults = {
                'width': component.getPropertyValue('width'),
                'height': component.getPropertyValue('height'),
                'start_time': component.getPropertyValue('start-time'),
                'end_time': component.getPropertyValue('end-time'),
            };

            Object.entries(defaults).forEach(([key, value]) => {
                if(value !== null){
                    form.getField(key).getInput().setValue(value, true);
                }
            });
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

            case 'publish':
                this.createLoadMask();
                window.location.href = this.configs.publish_url;
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
                        '@id': player.getGuideRevision(),
                        '@date': new Date(player.getGuideData('changed') * 1000).toLocaleDateString(),
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
     * Mainmenu input valuechange event callback
     *
     * @private
     */
    onMainmenuInputChange(evt){
        const name = evt.detail.input.data('name');
        const value = evt.detail.value;
        const previous_value = evt.detail.previous;

        switch(name){
            case 'title':
            case 'width':
            case 'height':
                if (name === 'width' || name === 'height') {
                    this.getPlayer().setDimentions(
                        this.mainmenu.getItem('width').getValue(),
                        this.mainmenu.getItem('height').getValue()
                    );
                }

                this.getHistory().add({
                    'undo': () => {
                        this.mainmenu.getItem(name).setValue(previous_value, true);
                    },
                    'redo': () => {
                        this.mainmenu.getItem(name).setValue(value, true);
                    }
                });
                this.setDirty(name);
                break;

            case 'zoom':
                this.updateWorkspace();
                break;

            case 'preview-toggle':
                this.setEditing(!value);
                break;

            case 'revisions':
                if(this.isDirty()){
                    new Confirm({
                        'text': Locale.t('editor.onMainmenuRevisionsChange.confirm.msg', "You are about to load an old revision. Any unsaved data will be lost."),
                        'onConfirm': () => {
                            this.loadPlayer({'vid': value});
                        },
                        'parent': this
                    });
                }
                else{
                    this.loadPlayer({'vid': value});
                }
                break;
        }
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

        if(!evt.shiftKey && component.hasProperty('start-time')){
            const start_time = component.getPropertyValue('start-time');
            if(start_time !== null){
                MasterClock.setTime(start_time);
            }
        }
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

        this.setPlayerComponentOrder(component, position);
    }

    /**
     * Time input valuein event callback
     *
     * @private
     * @param {CustomEvent} evt
     */
    onTimeInputValueIn(evt){
        const input = evt.detail.input;
        const time = MasterClock.getTime();

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
     * Player dimentionsset event callback
     *
     * @private
     */
    onPlayerDimentionsSet(){
        this.updateWorkspace();
    }

    /**
     * Player sourceset event callback
     *
     * @private
     */
    onPlayerSourceSet(){
        const loadmask = this.createLoadMask();

        this.removeClass('metadata-loaded');

        MasterClock.setRenderer(null);

        this.getPlayer()
            .addOneTimeListener('mediaerror', (evt) => {
                loadmask.hide();

                new Overlay({
                    'text': evt.detail.message,
                    'buttons': {
                        'ok': Locale.t('editor.onMediaError.ok', 'OK'),
                    },
                    'parent': this
                });
            })
            .addOneTimeListener('loadedmetadata', () => {
                loadmask.hide();
            });
    }

    /**
     * Player loadedmetadata event callback
     *
     * @private
     */
    onPlayerLoadedMetadata(evt){
        const renderer = evt.detail.renderer;
        const renderer_dom = renderer.getDom();
        const link = this.asset_browser.getTabContent('component-links').getLink('video-renderer');

        if(link){
            if(Dom.is(renderer_dom, 'video')){
                link.show();
            }
            else{
                link.hide();
            }
        }

        MasterClock.setRenderer(renderer);
        MasterClock.setTime(0);

        this.addClass('metadata-loaded');
    }

    /**
     * Player scenariochange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayerScenarioChange(evt){
        const scenario = evt.detail.scenario;
        const previous = evt.detail.previous;

        // Deselect all components
        this.configs_editor.unsetComponents();

        if(previous){
            // Hide previous scenario in Tinmeline
            this.controller.getTimeline().getTrack(previous.getId()).hide();
        }
        if(scenario){
            // Show scenario in Tinmeline
            this.controller.getTimeline().getTrack(scenario.getId()).show();
        }

        // Update ConfigEditor component fields
        this.updateConfigEditorComponentFields();
    }

    /**
     * Player componentadd event callback
     *
     * @private
     */
    onPlayerComponentAdd(evt){
        const component = evt.detail.component;

        this.controller.getTimeline().addTrack(component);

        if(component.instanceOf('Block') || component.instanceOf('VideoRenderer') || component.instanceOf('Controller')){
            this.getPlayer().updateBlockTogglers();
        }

        this.selectPlayerComponent(component);

        this.updateConfigEditorComponentFields();
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

        if(component.instanceOf('Block') || component.instanceOf('VideoRenderer') || component.instanceOf('Controller')){
            this.getPlayer().updateBlockTogglers();
        }

        this.updateConfigEditorComponentFields();
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
            this.addClass('has-player');

            /**
             * The player instance
             * @type {Player}
             */
            this.player = player;

            // Create a new Dom instance to workaround the different JS contexts of the player and editor.
            new Dom(this.player.get(0))
                .addListener('load', this.onPlayerLoadSuccess.bind(this, loadmask))
                .addListener('error', this.onPlayerLoadError.bind(this, loadmask))
                .addListener('dimentionsset', this.onPlayerDimentionsSet.bind(this))
                .addListener('sourceset', this.onPlayerSourceSet.bind(this))
                .addListener('loadedmetadata', this.onPlayerLoadedMetadata.bind(this));

            this.player.load();
        }
        else{
            // Assume an error occured
            this.unloadPlayer();
            this.onPlayerFrameLoadError(loadmask);
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
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'parent': this
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

        // Update mainmenu inputs.
        ['title', 'width', 'height'].forEach((input) => {
            this.mainmenu.getItem(input).setValue(this.player.getGuideData(input), true);
        });

        if(this.isLatestRevision()){
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
                .addListener('keydown', this.onKeydown.bind(this))
                .addListener('keyup', this.onKeyup.bind(this))
                .addListener('click', this.onPlayerClick.bind(this))
                .addListener('dragover', this.onPlayerDragOver.bind(this))
                .addListener('drop', this.onPlayerDrop.bind(this));

            // Update the asset browser
            this.asset_browser.getTabContent('guide-assets')
                .addAssets(this.player.getGuideData('assets'), true)
                .addAssets(this.player.getGuideData('shared_assets'), true);

            // Update the timeline and scenario list
            const active_scenario = this.player.getActiveScenario();
            const timeline = this.controller.getTimeline();
            this.player.getScenarios().forEach((scenario) => {
                const track = timeline.addTrack(scenario);
                if(scenario === active_scenario){
                    track.show();
                }
                else{
                    track.hide();
                }
            });

            this.updateConfigEditorImageFields();
            this.updateConfigEditorComponentFields();

            // Add the editor's specific stylesheet
            const player_document = this.player_frame.get(0).contentWindow.document;
            new StyleSheet(player_css)
                .appendTo(player_document.head);

            // Replace the player context menu with the editor's one
            this.player.contextmenu.disable();
            this.player_contextmenu
                .setTarget(player_document.body)
                .enable();

            if(this.configs.autosave && this.configs.autosave.url && this.configs.autosave.interval){
                this._autosave_interval = setInterval(this.autoSave.bind(this), this.configs.autosave.interval * 1000);
            }

            this.setEditing(true);
        }
        else{
            this.setEditing(false);
        }

        this.updateMainmenu(true);

        this.triggerEvent('playerload', {'player': this.player});

        loadmask.hide();
    }

    /**
     * Player error event callback
     *
     * @private
     * @param {LoadMask} loadmask The loadmask to hide
     */
    onPlayerLoadError(loadmask){
        loadmask.hide();

        new Overlay({
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'parent': this
        });
    }

    /**
     * Player dragover event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onPlayerDragOver(evt){
        /**
         * @todo: highlight drop zone
         * @todo: handle page before, page after
         **/

        if(this.hasClass('contents-unlocked')){
            return;
        }

        if(evt.dataTransfer.types.includes('metascore/block')){
            evt.preventDefault();
        }
        else if(evt.dataTransfer.types.includes('metascore/page')){
            const block_dom = evt.target.closest('.metaScore-component.block');
            if(block_dom){
                evt.preventDefault();
            }
        }
        else if(evt.dataTransfer.types.includes('metascore/element')){
            const page_dom = evt.target.closest('.metaScore-component.page');
            if(page_dom){
                evt.preventDefault();
            }
        }
        else if(evt.dataTransfer.types.includes('metascore/asset')){
            const page_dom = evt.target.closest('.metaScore-component.page');
            if(page_dom){
                evt.preventDefault();
            }
        }
    }

    /**
     * Player drop event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onPlayerDrop(evt){
        if(this.hasClass('contents-unlocked')){
            return;
        }

        // Handle block drop ////////////////////////
        if(evt.dataTransfer.types.includes('metascore/block')){
            const configs = JSON.parse(evt.dataTransfer.getData('metascore/block'));
            this.addPlayerComponents('block', Object.assign({
                'x': evt.clientX,
                'y': evt.clientY
            }, configs));

            evt.preventDefault();

            return;
        }

        // Handle page drop ////////////////////////
        if(evt.dataTransfer.types.includes('metascore/page')){
            const block_dom = evt.target.closest('.metaScore-component.block');
            if(block_dom){
                const configs = JSON.parse(evt.dataTransfer.getData('metascore/page'));
                const block = block_dom._metaScore;
                this.addPlayerComponents('page', configs, block);
            }

            evt.preventDefault();

            return;
        }

        // Handle element drop ////////////////////////
        if(evt.dataTransfer.types.includes('metascore/element')){
            const page_dom = evt.target.closest('.metaScore-component.page');
            if(page_dom){
                const configs = JSON.parse(evt.dataTransfer.getData('metascore/element'));
                const page = page_dom._metaScore;
                const page_rect = page_dom.getBoundingClientRect();

                this.addPlayerComponents('element', Object.assign({
                    'x': evt.clientX - page_rect.left,
                    'y': evt.clientY - page_rect.top
                }, configs), page);
            }

            evt.preventDefault();

            return;
        }

        // Handle asset drop ////////////////////////
        if(evt.dataTransfer.types.includes('metascore/asset')){
            const page_dom = evt.target.closest('.metaScore-component.page');
            if(page_dom){
                const asset = JSON.parse(evt.dataTransfer.getData('metascore/asset'));
                const page = page_dom._metaScore;
                const page_rect = page.get(0).getBoundingClientRect();

                const configs = {
                    'name': asset.name,
                    'x': evt.clientX - page_rect.left,
                    'y': evt.clientY - page_rect.top,
                };

                if('shared' in asset && asset.shared){
                    switch(asset.type){
                        case 'image':
                            Object.assign(configs, {
                                'type': 'Content',
                                'background-image': asset.file.url,
                                'width': asset.file.width,
                                'height': asset.file.height
                            });
                            break;

                        case 'lottie_animation':
                        case 'svg':
                            Object.assign(configs, {
                                'type': asset.type === 'svg' ? 'SVG' : 'Animation',
                                'src': asset.file.url
                            });
                            break;
                    }
                }
                else{
                    const matches = /^(image|audio|video)\/.*/.exec(asset.mimetype);
                    if(matches){
                        const type = matches[1];
                        switch(type){
                            case 'image':
                                Object.assign(configs, {
                                    'type': 'Content',
                                    'background-image': asset.url,
                                    'width': asset.width,
                                    'height': asset.height
                                });
                                break;

                            case 'audio':
                            case 'video':
                                Object.assign(configs, {
                                    'type': 'Media',
                                    'tag': type,
                                    'src': asset.url,
                                    'width': asset.width,
                                    'height': asset.height
                                });
                                break;
                        }
                    }
                }

                this.addPlayerComponents('element', configs, page);

                evt.preventDefault();
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

        if(component.instanceOf('VideoRenderer') || component.instanceOf('Controller') || component.instanceOf('Block') || component.instanceOf('BlockToggler')){
            if(['x', 'y', 'width', 'height', 'blocks'].includes(property)){
                this.getPlayer().updateBlockTogglers();
            }
            else if(property === 'name'){
                this.updateConfigEditorComponentFields();
            }
        }

        this.setDirty('components');
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

        if(!component.instanceOf('Scenario')){
            this.selectPlayerComponent(component, evt.shiftKey);
            evt.stopImmediatePropagation();
        }
    }

    /**
     * History add event callback
     *
     * @private
     */
    onHistoryAdd(){
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
     * Window unload event callback
     *
     * @private
     */
    onWindowUnload(){
        if(this.configs.autosave && this.configs.autosave.url){
            // Delete auto-save data using the fetch API as Ajax doesn't support keepalive.
            fetch(this.configs.autosave.url, Object.assign({}, this.configs.xhr, {
                'method': 'DELETE',
                'keepalive': true
            }));
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
     * Update the workspace to reflect changes in dimentions and zoom.
     *
     * @private
     * @return {this}
     */
    updateWorkspace(){
        const {width, height} = this.getPlayer().getDimentions();
        const zoom = this.mainmenu.getItem('zoom').getValue();
        const scale = zoom/100;
        const scaled_width = width * scale;
        const scaled_height = height * scale;

        this.player_wrapper
            .css('width', `${width}px`)
            .css('height', `${height}px`)
            .css('transform', `scale(${scale})`)
            .css('margin-right', `${(scaled_width - width)}px`)
            .css('margin-bottom', `${(scaled_height - height)}px`);

        return this;
    }

    /**
     * Updates the states of the mainmenu buttons
     *
     * @private
     * @param {Boolean} update_revisions Whether to also update the revisions field options
     * @return {this}
     */
    updateMainmenu(update_revisions = false) {
        const is_latest_revision = this.isLatestRevision();
        const is_dirty = this.isDirty();

        if (update_revisions) {
            this.mainmenu.updateRevisionsOptions(this.player.getGuideData('revisions'), this.player.getGuideRevision());
        }

        this.mainmenu
            .toggleItem('save', is_latest_revision)
            .toggleItem('publish', is_latest_revision && !is_dirty)
            .toggleItem('title', is_latest_revision)
            .toggleItem('preview-toggle', is_latest_revision)
            .toggleItem('undo', this.history.hasUndo())
            .toggleItem('redo', this.history.hasRedo())
            .toggleItem('revert', is_dirty)
            .toggleItem('restore', !is_latest_revision);

        return this;
    }

    /**
     * Check if the loaded revision is the latest one.
     *
     * @private
     * @return {Boolean} Whether the latest revision is the one loaded.
     */
    isLatestRevision() {
        const player = this.getPlayer();
        return player && this.player.getGuideData('latest_revision') === this.player.getGuideRevision();
    }

    /**
     * Get the undo/redo instance
     *
     * @return {UndoRedo} The undo/redo instance
     */
    getHistory(){
        return this.history;
    }

    /**
     * Get available image assets
     *
     * @return {Object} The list of image assets, keyed by url
     */
    getImageAssets(){
        const assets = this.asset_browser.getTabContent('guide-assets').getAssets();
        const images = {};

        Object.values(assets).forEach((asset) => {
            const file = 'shared' in asset && asset.shared ? asset.file : asset;

            if(/^image\/.*/.test(file.mimetype)){
                images[file.url] = asset.name;
            }
        });

        return images;
    }

    /**
     * Updates ConfigEditor image fields options
     *
     * @private
     * @return {this}
     */
    updateConfigEditorImageFields(){
        const images = this.getImageAssets();

        Object.values(this.configs_editor.getForms()).forEach((form) => {
            if('updateImageFields' in form){
                form.updateImageFields(images);
            }
        });

        return this;
    }

    /**
     * Updates ConfigEditor component fields options
     *
     * @private
     * @return {this}
     */
    updateConfigEditorComponentFields(){
        const player = this.getPlayer();
        const scenario = player.getActiveScenario();
        const components = scenario ? scenario.getChildren() : [];

        Object.values(this.configs_editor.getForms()).forEach((form) => {
            if('updateComponentFields' in form){
                form.updateComponentFields(components);
            }
        });

        return this;
    }

    /**
     * Set data as dirty/modified
     *
     * @param {String} key The key corresponding to the dirty data
     * @return {this}
     */
    setDirty(key){
        this.dirty[key] = Date.now();

        this.updateMainmenu();

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

        this.updateMainmenu();

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
            return key in this.dirty;
        }

        return Object.keys(this.dirty).length > 0;
    }

    /**
     * Check whether there are unsaved data since last autosave
     *
     * @param {String} key The key corresponding to the data; if undefined, checks whether any data is dirty
     * @return {Boolean} Whether unsaved autosave data exists
     */
    isAutoSaveDirty(key){
        const last_autosave = this._last_autosave ? this._last_autosave : 0;

        if(typeof key !== 'undefined'){
            return key in this.dirty && this.dirty[key] > last_autosave;
        }

        return Object.values(this.dirty).some((date) => {
            return date > last_autosave;
        });
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
     * @param {Object} [params] URL parameters to add to the default url
     * @return {this}
     */
    loadPlayer(params){
        const loadmask = this.createLoadMask();

        this.unloadPlayer();

        const url = new URL(this.configs.player.url, window.location.origin);

        if(typeof params !== 'undefined'){
            const searchParams = url.searchParams;
            Object.entries(params).forEach(([key, value]) => {
                searchParams.set(key, value);
            });
        }

        /**
         * The player's iframe
         * @type {Dom}
         */
        this.player_frame = new Dom('<iframe/>', {'src': url.toString(), 'class': 'player-frame', 'tabindex': -1, 'allowfullscreen': '', 'allow': 'fullscreen'})
            .appendTo(this.player_wrapper)
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

        if(this._autosave_interval){
            clearInterval(this._autosave_interval);
            delete this._autosave_interval;
        }

        this.configs_editor.unsetComponents();

        this
            .removeClass('has-player')
            .removeClass('metadata-loaded');

        this.player_contextmenu.disable();

        this.mainmenu.getItem('revisions').clear();

        this.controller.getTimeline().clear();

        this.asset_browser.getTabContent('guide-assets').clearAssets();

        this.history.clear();

        this.setEditing(false).setClean();

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
     * @param {Mixed} [parent] The components' parent
     * @return {this}
     */
    addPlayerComponents(type, config, parent){
        switch(type){
            case 'element': {
                const configs = isArray(config) ? config : [config];
                const page = parent;
                const components = [];

                configs.forEach((element_config) => {
                    const el_index = page.children(`.element.${element_config.type}`).count() + 1;
                    const defaults = {
                        'name': `${element_config.type} ${el_index}`,
                        'start-time': page.getPropertyValue('start-time'),
                        'end-time': page.getPropertyValue('end-time')
                    };

                    switch(element_config.type){
                        case 'Cursor':
                            defaults['start-time'] = MasterClock.getTime();

                            if(defaults['end-time'] === null){
                                defaults['end-time'] = MasterClock.getRenderer().getDuration();
                            }
                            break;
                    }

                    const component = page.addElement(Object.assign(defaults, element_config));
                    components.push(component);
                });

                this.getHistory().add({
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
                const current_time = MasterClock.getTime();
                const timeline = this.controller.getTimeline();

                delete config.position;

                if(block.getPropertyValue('synched')){
                    const duration = MasterClock.getRenderer().getDuration();

                    // prevent adding the page if current time == 0 or >= media duration
                    if(current_time === 0 || current_time >= duration){
                        new Overlay({
                            'text': Locale.t('editor.addPlayerComponents.page.time.msg', "In a synchronized block, a page cannot be inserted at the media's beginning (@start_time) or end (@duration).<br/><b>Please move the media to a different time before inserting a new page.</b>", {'@start_time': TimeInput.getTextualValue(0), '@duration': TimeInput.getTextualValue(duration)}),
                            'buttons': {
                                'ok': Locale.t('editor.addPlayerComponents.page.time.ok', 'OK'),
                            },
                            'parent': this
                        });

                        break;
                    }

                    const adjacent_page = block.getChild(index);
                    config['start-time'] = before ? adjacent_page.getPropertyValue('start-time') : current_time;
                    config['end-time'] = before ? current_time : adjacent_page.getPropertyValue('end-time');
                    adjacent_page.setPropertyValue(before ? 'start-time' : 'end-time', current_time);
                }

                const component = block.addPage(config, before ? index : index + 1);

                timeline.updateBlockPagesTrackLabels(block);
                block.setActivePage(index);

                this.getHistory().add({
                    'undo': () => {
                        if(block.getPropertyValue('synched')){
                            const adjacent_page = block.getChild(before ? index + 1 : index);
                            const prop = before ? 'start-time' : 'end-time';
                            adjacent_page.setPropertyValue(prop, component.getPropertyValue(prop));
                        }
                        component.remove();
                        timeline.updateBlockPagesTrackLabels(block);
                        block.setActivePage(index);
                    },
                    'redo': () => {
                        if(block.getPropertyValue('synched')){
                            const adjacent_page = block.getChild(index);
                            const prop = before ? 'start-time' : 'end-time';
                            adjacent_page.setPropertyValue(prop, current_time);
                        }
                        block.addPage(component, before ? index : index + 1);
                        timeline.updateBlockPagesTrackLabels(block);
                    }
                });
                break;
            }

            case 'block': {
                const scenario = this.getPlayer().getActiveScenario();
                const configs = isArray(config) ? config : [config];
                const components = [];

                configs.forEach((block_config) => {
                    const component = scenario.addComponent(Object.assign({
                        'name': Locale.t('editor.addPlayerComponents.block.name', 'untitled')
                    }, block_config));

                    components.push(component);
                });

                this.getHistory().add({
                    'undo': () => {
                        components.forEach((component) => {
                            component.remove();
                        });
                    },
                    'redo': () => {
                        components.forEach((component) => {
                            scenario.addComponent(component);
                        });
                    }
                });
                break;
            }
        }

        this.setDirty('components');

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

                    this.getHistory().add({
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
                    const contexts = {};
                    const timeline = this.controller.getTimeline();

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
                                context.auto_page = context.block.addPage();
                            }

                            timeline.updateBlockPagesTrackLabels(context.block);
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

                            timeline.updateBlockPagesTrackLabels(context.block);
                            context.block.setActivePage(page_index);
                        });
                    };

                    removePages();

                    this.getHistory().add({
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

                    this.getHistory().add({
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

            this.setDirty('components');

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

    setPlayerComponentOrder(component, position){
        const parent = component.parents();

        component.insertAt(parent, position);

        this.triggerEvent('playercomponentorder', {'component': component, 'position': position});

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
            const url = new URL(this.configs.player.update_url, window.location.origin);

            const loadmask = this.createLoadMask({
                'text': Locale.t('editor.save.LoadMask.text', 'Saving...'),
                'bar': true
            });

            const options = Object.assign({}, this.configs.xhr, {
                'data': data,
                'responseType': 'json',
                'onError': this.onXHRError.bind(this, loadmask),
                'autoSend': false
            });

            if(!this.isLatestRevision()){
                // This is a restore operation
                const params = url.searchParams;
                params.set('vid', this.getPlayer().getGuideRevision());

                options.onSuccess = this.onRestoreSuccess.bind(this, loadmask);
            }
            else{
                options.onSuccess = this.onSaveSuccess.bind(this, loadmask);

                // Add mainmenu inputs.
                ['title', 'width', 'height'].forEach((input) => {
                    if(this.isDirty(input)){
                        data.set(input, this.mainmenu.getItem(input).getValue());
                    }
                });

                // Add media.
                if(this.isDirty('media')){
                    const source = Object.assign({}, player.getRenderer().getSource());
                    if(source.source === 'upload'){
                        data.set('files[media]', source.object);
                        delete source.object;
                    }

                    data.set('media', JSON.stringify(source));
                }

                // Add components
                if(this.isDirty('components')){
                    const components = player.getScenarios().map((component) => {
                        return component.getPropertyValues();
                    });
                    data.set('components', JSON.stringify(components));
                }

                // Add assets
                if(this.isDirty('assets')){
                    const assets = this.asset_browser.getTabContent('guide-assets').getAssets();
                    if(assets.length > 0){
                        assets.forEach((asset) => {
                            data.append('assets[]', JSON.stringify(asset));
                        });
                    }
                    else{
                        data.set('assets', []);
                    }
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

    autoSave(){
        if(!this._autosaving && this.isAutoSaveDirty()){
            this._autosaving = true;
            this.autosave_indicator.show();

            const now = Date.now();
            const player = this.getPlayer();
            const data = new FormData();

            // Add mainmenu inputs.
            ['title', 'width', 'height'].forEach((input) => {
                if(this.isAutoSaveDirty(input)){
                    data.set(input, this.mainmenu.getItem(input).getValue());
                }
            });

            // Add media.
            if(this.isAutoSaveDirty('media')){
                const source = Object.assign({}, player.getRenderer().getSource());
                if(source.source === 'upload'){
                    data.set('files[media]', source.object);
                    delete source.object;
                }

                data.set('media', JSON.stringify(source));
            }

            // Add components.
            if(this.isAutoSaveDirty('components')){
                const components = player.getScenarios().map((component) => {
                    return component.getPropertyValues();
                });
                data.set('components', JSON.stringify(components));
            }

            // Add assets.
            if(this.isAutoSaveDirty('assets')){
                const assets = this.asset_browser.getTabContent('guide-assets').getAssets();
                if(assets.length > 0){
                    assets.forEach((asset) => {
                        data.append('assets[]', JSON.stringify(asset));
                    });
                }
                else{
                    data.set('assets', []);
                }
            }

            const options = Object.assign({}, this.configs.xhr, {
                'data': data,
                'responseType': 'json',
                'onSuccess': () => {
                    this._last_autosave = now;
                    delete this._autosaving;
                    this.autosave_indicator.hide();
                },
                'onError': () => {
                    delete this._autosaving;
                    this.autosave_indicator.hide();
                }
            });

            Ajax.PUT(this.configs.autosave.url, options);
        }

        return this;
    }

    /**
     * Helper function to create a LoadMask
     *
     * @param {Object =  {'parent': this}} configs Config options to use for the LoadMask
     *
     * @returns {LoadMask} The LoadMask instance
     */
    createLoadMask(configs){
        return new LoadMask(Object.assign({
            'parent': this
        }, configs));
    }
}

// Export the TimeInput class to be used in CKEditor plugins
export {TimeInput};
