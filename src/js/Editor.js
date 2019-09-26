/* eslint-disable */

import Dom from './core/Dom';
import {getMediaFileDuration} from './core/utils/Media';
import {isArray, isNumber} from './core/utils/Var';
import Locale from './core/Locale';
import MainMenu from './editor/MainMenu';
import ComponentForm from './editor/ComponentForm';
import UndoRedo from './editor/UndoRedo';
import Alert from './core/ui/overlay/Alert';
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
        // Tools pane ////////////////////////
        const tools_pane = new Pane({
                'axis': 'vertical',
                'resizable': {
                    'directions': ['right']
                }
            })
            .attr('id', 'tools-pane')
            .appendTo(this);

        this.asset_browser = new AssetBrowser(Object.assign({'xhr': this.configs.xhr}, this.configs.asset_browser))
            .addListener('tabchange', this.onAssetBrowserTabChange.bind(this))
            .appendTo(tools_pane.getContents());

        // Center pane ////////////////////////
        const center_pane = new Pane({
                'axis': 'vertical'
            })
            .attr('id', 'center-pane')
            .appendTo(this);

        /**
         * The top menu
         * @type {MainMenu}
         */
        this.mainmenu = new MainMenu()
            .addDelegate('button[data-action]', 'click', this.onMainmenuClick.bind(this))
            .addDelegate('.checkbox.input[data-action="edit-toggle"]', 'valuechange', this.onMainmenuEditToggleFieldChange.bind(this))
            .addDelegate('.number.input[data-action="r-index"]', 'valuechange', this.onMainmenuRindexFieldChange.bind(this))
            .appendTo(center_pane.getContents());

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
            .attr('id', 'configs-pane')
            .appendTo(this);

        /**
         * The component form
         * @type {ComponentForm}
         */
        this.component_form = new ComponentForm()
            .addListener('componentset', this.onComponentFormComponentSet.bind(this))
            .addListener('beforecursoradvancededitmodeunlock', this.onComponentFormBeforeCursorAdvancedEditModeUnlock.bind(this))
            .appendTo(config_pane.getContents());

        // Bottom pane ////////////////////////
        const bottom_pane = new Pane({
                'axis': 'horizontal',
                'resizable': {
                    'directions': ['top']
                }
            })
            .attr('id', 'bottom-pane')
            .appendTo(this);

        /**
         * The controller
         * @type {Controller}
         */
        this.controller = new Controller()
            .addListener('timeset', this.onControllerTimeSet.bind(this))
            .appendTo(bottom_pane.getContents());

        this.controller.getControls()
            .addDelegate('button', 'click', this.onControllerControlsButtonClick.bind(this))

        this.controller.getTimeInput()
            .addListener('valuechange', this.onControllerTimeFieldChange.bind(this))

        this.controller.getTimeline()
            .addDelegate('.track', 'click', this.onTimelineTrackClick.bind(this))
            .getHandlesContainer()
                .addDelegate('.handle', 'click', this.onTimelineTrackClick.bind(this));

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
            evt.stopPropagation();
        });

        Dom.addListener(window, 'beforeunload', this.onWindowBeforeUnload.bind(this));

        this
            .addListener('mousedown', this.onMousedown.bind(this))
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keyup', this.onKeyup.bind(this))
            .addDelegate('.time.field', 'valuein', this.onTimeFieldIn.bind(this))
            .addDelegate('.time.field', 'valueout', this.onTimeFieldOut.bind(this))
            .setDirty(false)
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
                        const page = context.el.closest('.metaScore-component.page')._metaScore;

                        this.component_form.unsetComponents();

                        page.getChildren().forEach((element, index) => {
                            this.component_form.setComponent(element, index > 0);
                        });
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.page') ? true : false);
                    }
                },
                'select-elements-matching-index': {
                    'text': Locale.t('editor.contextmenu.select-elements-matching-index', 'Select all elements of the current reading index'),
                    'callback': (context) => {
                        const rindex = this.getPlayer().getReadingIndex();
                        const page = context.el.closest('.metaScore-component.page')._metaScore;

                        this.component_form.unsetComponents();

                        page.getChildren().forEach((element) => {
                            if(element.getPropertyValue('r-index') === rindex){
                                this.component_form.setComponent(element, true);
                            }
                        });
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.page') ? true : false);
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
                            const config = element.getPropertyValues(void 0, true);
                            // Slightly move the copy by 5 pixels right and 5 pixels down.
                            config.x += 5;
                            config.y += 5;

                            configs.push(config);
                        });
                        this.clipboard.setData('element', configs);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }
                        const components = this.component_form.getComponents('Element');
                        if(components.length > 0){
                            context.data.selected = true;
                            context.data.elements = components;
                            return true;
                        }
                        const component = context.el.closest('.metaScore-component.element');
                        if(component){
                            context.data.elements = [component];
                            return true;
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
                        if((this.editing !== true) || (this.clipboard.getDataType() !== 'element')){
                            return false;
                        }
                        const dom = context.el.closest('.metaScore-component.page');
                        if(dom){
                            context.data.element = this.clipboard.getData();
                            context.data.page = dom._metaScore;
                            return true;
                        }
                        return false;
                    }
                },
                'delete-elements': {
                    'text': () => {
                        if(this.panels.element.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.delete-selected-elements', 'Delete selected elements');
                        }
                        return Locale.t('editor.contextmenu.delete-element', 'Delete element');
                    },
                    'callback': (context) => {
                        let elements = this.panels.element.getComponents();
                        if(elements.length === 0){
                            elements = [context.el.closest('.metaScore-component.element')._metaScore];
                        }
                        this.deletePlayerComponents('element', elements);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.element.getComponents().length > 0){
                            return true;
                        }
                        const dom = context.el.closest('.metaScore-component.element');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'lock-element': {
                    'text': Locale.t('editor.contextmenu.lock-element', 'Lock element'),
                    'callback': (context) => {
                        context.el.closest('.metaScore-component.element')._metaScore.setPropertyValue('locked', true);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = context.el.closest('.metaScore-component.element');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'unlock-element': {
                    'text': Locale.t('editor.contextmenu.unlock-element', 'Unlock element'),
                    'callback': (context) => {
                        context.el.closest('.metaScore-component.element')._metaScore.setPropertyValue('locked', false);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = context.el.closest('.metaScore-component.element');
                        return dom && dom._metaScore.getPropertyValue('locked');
                    }
                },
                'element-separator': {
                    'class': 'separator',
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.element.getComponents().length > 0){
                            return true;
                        }
                        return (context.el.closest('.metaScore-component.page, .metaScore-component.element') ? true : false);
                    }
                },
                'add-page-before': {
                    'text': Locale.t('editor.contextmenu.add-page-before', 'Add a page before'),
                    'callback': (context) => {
                        this.addPlayerComponents('page', {'position': 'before'}, context.el.closest('.metaScore-component.block')._metaScore);
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.block') ? true : false);
                    }
                },
                'add-page-after': {
                    'text': Locale.t('editor.contextmenu.add-page-after', 'Add a page after'),
                    'callback': (context) => {
                        this.addPlayerComponents('page', {'position': 'after'}, context.el.closest('.metaScore-component.block')._metaScore);
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.block') ? true : false);
                    }
                },
                'delete-page': {
                    'text': () => {
                        if(this.panels.page.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.delete-selected-pages', 'Delete selected pages');
                        }
                        return Locale.t('editor.contextmenu.delete-page', 'Delete page');
                    },
                    'callback': (context) => {
                        let pages = this.panels.page.getComponents();
                        if(pages.length === 0){
                            pages = [context.el.closest('.metaScore-component.page')._metaScore];
                        }
                        this.deletePlayerComponents('page', pages);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.page.getComponents().length > 0){
                            return true;
                        }
                        return context.el.closest('.metaScore-component.page') ? true : false;
                    }
                },
                'page-separator': {
                    'class': 'separator',
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.block, .metaScore-component.page') ? true : false);
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
                        return (this.editing === true) && (context.el.is('.metaScore-player'));
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
                    'callback': (context) => {
                        const component = context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore;
                        const config = component.getPropertyValues(void 0, true);

                        // Slightly move the copy by 5 pixels right and 5 pixels down.
                        config.x += 5;
                        config.y += 5;

                        this.clipboard.setData('block', config);
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler') ? true : false);
                    }
                },
                'paste-block': {
                    'text': Locale.t('editor.contextmenu.paste-block', 'Paste block'),
                    'callback': () => {
                        this.addPlayerComponents('block', this.clipboard.getData(), this.getPlayer());
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (this.clipboard.getDataType() === 'block') && (context.el.is('.metaScore-player'));
                    }
                },
                'delete-blocks': {
                    'text': () => {
                        if(this.panels.block.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.delete-selected-blocks', 'Delete selected blocks');
                        }
                        return Locale.t('editor.contextmenu.delete-block', 'Delete block');
                    },
                    'callback': (context) => {
                        let blocks = this.panels.block.getComponents().filter((block) => block.instanceOf('Block') || block.instanceOf('BlockToggler'));
                        if(blocks.length === 0){
                            blocks = [context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore];
                        }
                        this.deletePlayerComponents('block', blocks);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }
                        if(this.panels.block.getComponents().length > 0){
                            return true;
                        }
                        const dom = context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'lock-block': {
                    'text': Locale.t('editor.contextmenu.lock-block', 'Lock block'),
                    'callback': (context) => {
                        context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setPropertyValue('locked', true);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getPropertyValue('locked');
                    }
                },
                'unlock-block': {
                    'text': Locale.t('editor.contextmenu.unlock-block', 'Unlock block'),
                    'callback': (context) => {
                        context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setPropertyValue('locked', false);
                    },
                    'toggler': (context) => {
                        if(this.editing !== true){
                            return false;
                        }

                        const dom = context.el.closest('.metaScore-component.block, .metaScore-component.block-toggler');
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
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     * @param {Event} evt The event object
     */
    onGuideSaveSuccess(loadmask){
        loadmask.hide();

        this
            .setDirty(false)
            .updateMainmenu();
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

    /**
     * Mainmenu click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onMainmenuClick(evt){
        switch(Dom.data(evt.target, 'action')){
            case 'save':
                this.saveGuide();
                break;

            case 'revert':
                this.showRevertDialog();
                break;

            case 'undo':
                this.history.undo();
                break;

            case 'redo':
                this.history.redo();
                break;

            case 'settings':
                break;
        }
    }

    /**
     * Mainmenu edit toggle field valuechange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onMainmenuEditToggleFieldChange(evt){
        const value = evt.detail.value;

        this.setEditing(value);
    }

    /**
     * Mainmenu reading index field valuechange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onMainmenuRindexFieldChange(evt){
        const value = evt.detail.value;

        this.getPlayer().setReadingIndex(value, true);
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
        const value = evt.detail.value;

        this.getPlayer().getMedia().setTime(value);
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
     * Time field valuein event callback
     *
     * @private
     * @param {CustomEvent} evt
     */
    onTimeFieldIn(evt){
        const field = evt.detail.field;
        const time = this.getPlayer().getMedia().getTime();

        field.getInput().setValue(time);
    }

    /**
     * Time field valueout event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTimeFieldOut(evt){
        const time = evt.detail.value;

        this.getPlayer().getMedia().setTime(time);
    }
    /**
     * Controller timeset event callback
     *
     * @private
     */
    onControllerTimeSet(evt){
        const time = evt.detail.time;

        this.getPlayer().getMedia().setTime(time);
    }

    /**
     * ComponentForm componentset event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentFormComponentSet(evt){
        /**
         * @todo
         */
        /*const component = evt.detail.component;

        if(component.instanceOf('BlockToggler')){
            // Update the 'blocks' field options and value
            const field = this.component_form.getField('blocks');

            this.getPlayer().getComponents('.media.video, .controller, .block').forEach((component) => {
                field.addOption(component.getId(), component.getName());
            });

            field.setValue(block.getPropertyValue('blocks'));
        }
        else if(component.instanceOf('Page')){
            const page = evt.detail.component;
            const block = page.getParent();
            const start_time_field = this.component_form.getField('start-time');
            const end_time_field = this.component_form.getField('end-time');

            if(block.getPropertyValue('synched')){
                const index = block.getChildIndex(page);
                const previous_page = block.getChild(index-1);
                const next_page = block.getChild(index+1);

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

            evt.stopPropagation();
        }
        else if(component.instanceOf('Element')){
            const element = evt.detail.component;
            const player = this.getPlayer();

            player.setReadingIndex(element.getPropertyValue('r-index') || 0);

            evt.stopPropagation();
        }*/
    }

    /**
     * ComponentForm beforecursoradvancededitmodeunlock event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentFormBeforeCursorAdvancedEditModeUnlock(evt){
        evt.detail.media = this.getPlayer().getMedia();
    }

    /**
     * Player sourceset event callback
     *
     * @private
     */
    onPlayerSourceSet(){
        const loadmask = new LoadMask({
            'parent': this,
            'autoShow': true
        });

        this.removeClass('metadata-loaded');

        this.controller.dettachMedia();

        this.getPlayer()
            .addOneTimeListener('mediaerror', (evt) => {
                loadmask.hide();

                new Alert({
                    'parent': this,
                    'text': evt.detail.message,
                    'buttons': {
                        'ok': Locale.t('editor.onMediaError.ok', 'OK'),
                    },
                    'autoShow': true
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
    onPlayerLoadedMetadata(){
        const media = this.getPlayer().getMedia();

        this.addClass('metadata-loaded');

        this.controller.attachMedia(media);

        media.reset();
    }

    /**
     * Player rindex event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayerReadingIndex(evt){
        const rindex = evt.detail.value;
        const input = this.mainmenu.getItem('r-index');

        input.setValue(rindex, true);
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

        this.controller.timeline.addTrack(component);

        if(component.instanceOf('Media') || component.instanceOf('Controller') || component.instanceOf('Block')){
            this.getPlayer().updateBlockTogglers();
        }
        else if(component.instanceOf('Element')){
            const page = component.getParent();

            if(evt.detail.new && component.instanceOf('Cursor')){
                const media = this.getPlayer().getMedia();

                if(!isNumber(component.getPropertyValue('start-time'))){
                    component.setPropertyValue('start-time', media.getTime());
                }

                if(!isNumber(component.getPropertyValue('end-time'))){
                    const block = page.getParent();
                    component.setPropertyValue('end-time', block.getPropertyValue('synched') ? page.getPropertyValue('end-time') : media.getDuration());
                }
            }
        }
    }

    /**
    * Player component beforeremove event callback
    *
    * @private
    * @param {CustomEvent} evt The event object
    */
    onComponentBeforeRemove(evt){
        const component = evt.target._metaScore;
        this.component_form.unsetComponent(component, true);
    }

    /**
     * Player childremove event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayerChildRemove(evt){
        const child = evt.detail.child;
        const component = child._metaScore;

        if(component){
            this.controller.timeline.removeTrack(component);

            if(component.instanceOf('Block') || component.instanceOf('Media') || component.instanceOf('Controller')){
                this.getPlayer().updateBlockTogglers();
            }
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
                .addListener('loadedmetadata', this.onPlayerLoadedMetadata.bind(this))
                .addListener('componentadd', this.onPlayerComponentAdd.bind(this));

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
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onPlayerLoadSuccess(loadmask){
        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(this.player.get(0))
            .addDelegate('.metaScore-component', 'propchange', this.onComponentPropChange.bind(this))
            .addDelegate('.metaScore-component', 'beforedrag', this.onComponentBeforeDrag.bind(this))
            .addDelegate('.metaScore-component', 'dragstart', this.onComponentDragStart.bind(this), true)
            .addDelegate('.metaScore-component', 'dragend', this.onComponentDragEnd.bind(this), true)
            .addDelegate('.metaScore-component', 'beforeresize', this.onComponentBeforeResize.bind(this))
            .addDelegate('.metaScore-component', 'resizestart', this.onComponentResizeStart.bind(this), true)
            .addDelegate('.metaScore-component', 'resizeend', this.onComponentResizeEnd.bind(this), true)
            .addDelegate('.metaScore-component', 'beforeremove', this.onComponentBeforeRemove.bind(this))
            .addDelegate('.metaScore-component, .metaScore-component *', 'click', this.onComponentClick.bind(this))
            .addListener('mousedown', this.onPlayerMousedown.bind(this))
            .addListener('childremove', this.onPlayerChildRemove.bind(this))
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keyup', this.onKeyup.bind(this))
            .addListener('rindex', this.onPlayerReadingIndex.bind(this))
            .addListener('click', this.onPlayerClick.bind(this))
            .addListener('play', this.onPlayerPlay.bind(this))
            .addListener('pause', this.onPlayerPause.bind(this));

            this.player
                .addListener('dragover', this.onPlayerDragOver.bind(this))
                .addListener('drop', this.onPlayerDrop.bind(this))
                .setInEditor(true);

            this.player.contextmenu.disable();

            const player_body = this.player_frame.get(0).contentWindow.document.body;
            this.player_contextmenu
                .setTarget(player_body)
                .enable();

            this.asset_browser.getGuideAssets()
                .addAssets(this.player.getData('assets'), true)
                .addAssets(this.player.getData('shared_assets'), true);

            this
                .setEditing(true)
                .updateMainmenu();

            this.mainmenu.getItem('r-index').setValue(0, true);

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

        new Alert({
            'parent': this,
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    onPlayerDragOver(evt){
        /**
         * @todo: highlight drop zone
         * @todo: handle page before, page after
         **/

        if(evt.dataTransfer.getData('metascore/component')){
            evt.preventDefault();
        }
    }

    onPlayerDrop(evt){
        let data = evt.dataTransfer.getData('metascore/component');

        if(data){
            data = JSON.parse(data);

            const type = data.type;
            let configs = data.configs;
            let parent = null;

            switch(data.type){
                case 'element':
                    parent = evt.target.closest('.metaScore-component.page')._metaScore;
                    const rect = parent.get(0).getBoundingClientRect();

                    configs = Object.assign({
                        'x': evt.clientX - rect.left,
                        'y': evt.clientY - rect.top
                    }, configs);
                    break;
                case 'page':
                    parent = evt.target.closest('.metaScore-component.block')._metaScore;
                    break;
                case 'block':
                    configs = Object.assign({
                        'x': evt.clientX,
                        'y': evt.clientY
                    }, configs);

                    parent = this.player;
                    break;
            }

            this.addPlayerComponents(type, configs, parent);
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

		this.component_form.unsetComponents();

        evt.stopPropagation();
    }

    /**
     * Player playing event callback
     *
     * @private
     */
    onPlayerPlay(){
        this.addClass('playing');

        this.controller.find('button .icon-play')
            .removeClass('icon-play')
            .addClass('icon-pause');
    }

    /**
     * Player pause event callback
     *
     * @private
     */
    onPlayerPause(){
        this.removeClass('playing');

        this.controller.find('button .icon-pause')
            .removeClass('icon-pause')
            .addClass('icon-play');
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
        this.setDirty(true)
            .updateMainmenu();
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

        this.mainmenu.getItem('edit-toggle').setValue(this.editing, true);

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
        const hasPlayer = player ? true : false;

        this.mainmenu
            .toggleItem('save', hasPlayer)
            .toggleItem('edit-toggle', hasPlayer)
            .toggleItem('undo', this.history.hasUndo())
            .toggleItem('redo', this.history.hasRedo())
            .toggleItem('revert', this.isDirty());

        return this;
    }

    /**
     * Set whether the guide is dirty
     *
     * @param {Boolean} dirty Whether the guide is dirty
     * @return {this}
     */
    setDirty(dirty){
        /**
         * Whether the guide has unsaved data
         * @type {Boolean}
         */
        this.dirty = dirty;

        return this;
    }

    /**
     * Check whether the guide is dirty
     *
     * @return {Boolean} Whether the guide is dirty
     */
    isDirty() {
        return this.dirty;
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
     * @return {this}
     */
    loadPlayer(){
        const loadmask = new LoadMask({
            'parent': this,
            'autoShow': true
        });

        this.unloadPlayer();

        /**
         * The player's iframe
         * @type {Dom}
         */
        this.player_frame = new Dom('<iframe/>', {'src': this.configs.player.url, 'class': 'player-frame'}).appendTo(this.workspace)
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

        this.component_form.unsetComponents();

        this
            .removeClass('has-player')
            .removeClass('metadata-loaded');

        this.player_contextmenu.disable();

        this.controller.dettachMedia();

        this.player_contextmenu.disable();

        this.asset_browser.getGuideAssets().clearAssets();

        this.history.clear();

        this.setDirty(false)
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
        switch(type){
            case 'element': {
                const configs = isArray(config) ? config : [config];
                const page = parent;
                const components = [];

                configs.forEach((element_config, index) => {
                    const component = page.addElement(element_config);
                    this.component_form.setComponent(component, index > 0);
                    components.push(component);
                });

                this.history.add({
                    'undo': () => {
                        this.component_form.unsetComponents();
                        components.forEach((component) => {
                            component.remove();
                        })
                    },
                    'redo': () => {
                        components.forEach((component, index) => {
                            page.addElement(component);
                            this.component_form.setComponent(component, index > 0);
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
                        new Alert({
                            'parent': this,
                            'text': Locale.t('editor.addPlayerComponents.page.time.msg', "In a synchronized block, a page cannot be inserted at the media's beginning (@start_time) or end (@duration).<br/><b>Please move the media to a different time before inserting a new page.</b>", {'@start_time': TimeInput.getTextualValue(0), '@duration': TimeInput.getTextualValue(duration)}),
                            'buttons': {
                                'ok': Locale.t('editor.addPlayerComponents.page.time.ok', 'OK'),
                            },
                            'autoShow': true
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
                        this.component_form.unsetComponents();
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
                        block.setActivePage(index);
                    }
                });
                break;
            }

            case 'block': {
                const configs = isArray(config) ? config : [config];
                const player = parent || this.player;
                const components = [];

                configs.forEach((block_config, index) => {
                    let component = null;

                    switch(block_config.type){
                        case 'BlockToggler':
                            component = player.addBlockToggler(Object.assign({'name': Locale.t('editor.defaultBlockTogglerName', 'untitled')}, block_config));
                            break;

                        default: {
                            component = player.addBlock(Object.assign({'name': Locale.t('editor.defaultBlockName', 'untitled')}, block_config));
                        }
                    }

                    this.component_form.setComponent(component, index > 0);
                    components.push(component);
                });

                this.history.add({
                    'undo': () => {
                        this.component_form.unsetComponents();
                        components.forEach((component) => {
                            component.remove();
                        });
                    },
                    'redo': () => {
                        components.forEach((component, index) => {
                            parent[`add${component.getPropertyValue('type')}`](component);
                            this.component_form.setComponent(component, index > 0);
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
                'parent': this,
                'text': alert_msg,
                'autoShow': true,
                'onConfirm': () => {
                    this.deletePlayerComponents(type, components, false);
                }
            })
            .addClass('delete-player-component');
        }
        else{
            switch(type){
                case 'block': {
                    components.forEach((component) => {
                        this.component_form.unsetComponent(component);
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
                                this.component_form.unsetComponent(component);
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
                                this.component_form.unsetComponent(ctx.component);

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

                        this.component_form.unsetComponent(component);
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
                                this.component_form.unsetComponent(ctx.component);
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
        if(keep_existing && this.component_form.getComponents().includes(component)){
            this.component_form.unsetComponent(component);
        }
        else{
            this.component_form.setComponent(component, keep_existing);
        }

        return this;
    }

    /**
     * Saves the loaded guide
     *
     * @return {this}
     */
    saveGuide(){
        const player = this.getPlayer();
        const components = player.getComponents('.media, .controller, .block, .block-toggler');
        const data = new FormData();

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
        const options = Object.assign({}, this.configs.xhr, {
            'data': data,
            'responseType': 'json',
            'onSuccess': this.onGuideSaveSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask),
            'autoSend': false
        });

        const hundred = 100;

        Ajax.PATCH(this.configs.player.update_url, options)
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
     * Show a confirm dialog to revert the guide to its last saved version
     *
     * @return {this}
     */
    showRevertDialog(){
        new Confirm({
            'parent': this,
            'text': Locale.t('editor.onMainmenuClick.revert.msg', 'Are you sure you want to revert back to the last saved version?<br/><strong>Any unsaved data will be lost.</strong>'),
            'autoShow': true,
            'onConfirm': () => {
                this.loadPlayer();
            }
        });
    }
}
