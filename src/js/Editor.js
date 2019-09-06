import Dom from './core/Dom';
import {naturalCompare} from './core/utils/String';
import {naturalSortInsensitive} from './core/utils/Array';
import {isArray, isNumber, isEmpty} from './core/utils/Var';
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
import TimeField from './editor/field/Time';
import Controller from './editor/Controller';

import {className} from '../css/Editor.less';

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
     * @property {String} [player_url=''] The base URL of players
     * @property {String} [api_url=''] The base URL of the RESTful API
     * @property {String} [lang='en'] The language to use for i18n
     * @property {Object} [xhr={}] Custom options to send with each XHR request. See {@link Ajax.send} for available options
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
            'player_url': '',
            'api_url': '',
            'lang': 'en',
            'xhr': {}
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
        const top =  new Dom('<div/>', {'id': 'top'}).appendTo(this);

        /**
         * The top menu
         * @type {MainMenu}
         */
        this.mainmenu = new MainMenu().appendTo(top)
            .addDelegate('button[data-action]', 'click', this.onMainmenuClick.bind(this))
            .addDelegate('.checkbox.field[data-action="edit-toggle"]', 'valuechange', this.onMainmenuEditToggleFieldChange.bind(this))
            .addDelegate('.number.field[data-action="r-index"]', 'valuechange', this.onMainmenuRindexFieldChange.bind(this));

        const center =  new Dom('<div/>', {'id': 'center'}).appendTo(this);

        const left =  new Dom('<div/>', {'id': 'left'}).appendTo(center);

        /**
         * The workspace
         * @type {Dom}
         */
        this.workspace = new Dom('<div/>', {'class': 'workspace'}).appendTo(left);

        /**
         * The horizontal ruler
         * @type {Dom}
         */
        this.h_ruler = new Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this.workspace);

        /**
         * The vertical ruler
         * @type {Dom}
         */
        this.v_ruler = new Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this.workspace);

        const bottom =  new Dom('<div/>', {'id': 'bottom'}).appendTo(left);

        /**
         * The controller
         * @type {Dom}
         */
        this.controller = new Controller()
            .addListener('timeset', this.onControllerTimeSet.bind(this))
            .addDelegate('.time.field', 'valuechange', this.onControllerTimeFieldChange.bind(this))
            .addDelegate('button', 'click', this.onControllerButtonClick.bind(this))
            .appendTo(bottom);

        const right =  new Dom('<div/>', {'id': 'right'}).appendTo(center)
            .addListener('resizestart', this.onSidebarResizeStart.bind(this))
            .addListener('resizeend', this.onSidebarResizeEnd.bind(this));

        /**
         * The sidebar resizer
         * @type {Resizable}
         */
        this.sidebar_resizer = new Resizable({target: right, directions: ['left']});
        this.sidebar_resizer.getHandle('left')
            .addListener('dblclick', this.onSidebarResizeDblclick.bind(this));

        /**
         * The sidebar
         * @type {Dom}
         */
        this.sidebar = new Dom('<div/>', {'class': 'sidebar'}).appendTo(right);

        /**
         * The list of panels
         * @type {Object}
         */
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
            .addListener('beforecursoradvancededitmodeunlock', this.onElementPanelBeforeCursorAdvancedEditModeUnlock.bind(this))
            .addListener('valueschange', this.onElementPanelValueChange.bind(this));

        this.panels.element.getToolbar()
            .addDelegate('.selector', 'valuechange', this.onElementPanelSelectorChange.bind(this))
            .addDelegate('.buttons [data-action]', 'click', this.onElementPanelToolbarClick.bind(this));

        /**
         * The grid
         * @type {Dom}
         */
        this.grid = new Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);

        /**
         * The undo/redo handler
         * @type {History}
         */
        this.history = new History()
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
                        'add-element-image': {
                            'text': Locale.t('editor.contextmenu.add-element-image', 'Image'),
                            'callback': (context) => {
                                this.addPlayerComponents('element', {'type': 'Image'}, context.el.closest('.metaScore-component.page')._metaScore);
                            }
                        },
                        'add-element-text': {
                            'text': Locale.t('editor.contextmenu.add-element-text', 'Text'),
                            'callback': (context) => {
                                this.addPlayerComponents('element', {'type': 'Text'}, context.el.closest('.metaScore-component.page')._metaScore);
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

                        this.panels.block.setComponent(page.getBlock());
                        this.panels.page.setComponent(page);

                        page.getElements().forEach((element, index) => {
                            this.panels.element.setComponent(element, index > 0);
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

                        this.panels.block.setComponent(page.getBlock());
                        this.panels.page.setComponent(page);
                        this.panels.element.unsetComponents();

                        page.getElements().forEach((element) => {
                            if(element.getPropertyValue('r-index') === rindex){
                                this.panels.element.setComponent(element, true);
                            }
                        });
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (context.el.closest('.metaScore-component.page') ? true : false);
                    }
                },
                'copy-elements': {
                    'text': () => {
                        if(this.panels.element.getComponents().length > 0){
                            return Locale.t('editor.contextmenu.copy-selected-elements', 'Copy selected elements');
                        }
                        return Locale.t('editor.contextmenu.copy-element', 'Copy element');
                    },
                    'callback': (context) => {
                        const configs = [];
                        let elements = this.panels.element.getComponents();

                        if(elements.length === 0){
                            elements = [context.el.closest('.metaScore-component.element')._metaScore];
                        }

                        elements.forEach((element) => {
                            const config = element.getPropertyValues(void 0, true);
                            // Slightly move the copy by 5 pixels right and 5 pixels down.
                            config.x += 5;
                            config.y += 5;

                            configs.push(config);
                        });

                        this.clipboard.setData('element', configs);
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && ((this.panels.element.getComponents().length > 0) || (context.el.closest('.metaScore-component.element') ? true : false));
                    }
                },
                'paste-elements': {
                    'text': Locale.t('editor.contextmenu.paste-elements', 'Paste elements'),
                    'callback': (context) => {
                        this.addPlayerComponents('element', this.clipboard.getData(), context.el.closest('.metaScore-component.page')._metaScore);
                    },
                    'toggler': (context) => {
                        return (this.editing === true) && (this.clipboard.getDataType() === 'element') && (context.el.closest('.metaScore-component.page') ? true : false);
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
     * Guide revert confirm callback
     *
     * @private
     */
    onGuideRevertConfirm() {
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

    /**
     * Mainmenu click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onMainmenuClick(evt){
        switch(Dom.data(evt.target, 'action')){
            case 'save':
                this.saveGuide('update');
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
     * Controller button click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object.
     */
    onControllerButtonClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'rewind':
                this.getPlayer().getMedia().reset();
                break;
            default:
                this.getPlayer().togglePlay();
        }
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

        field.setValue(time);
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
     * Sidebar resizestart event callback
     *
     * @private
     */
    onSidebarResizeStart(){
        this.addClass('sidebar-resizing');
    }

    /**
     * Sidebar resizeend event callback
     *
     * @private
     */
    onSidebarResizeEnd(){
        this.removeClass('sidebar-resizing');
    }

    /**
     * Sidebar resize handle dblclick event callback
     *
     * @private
     */
    onSidebarResizeDblclick(){
        this.toggleClass('sidebar-hidden');

        this.toggleSidebarResizer();
    }

    /**
     * Block panel componentset event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onBlockSet(evt){
        const block = evt.detail.component;

        if(block.instanceOf('Block')){
            this.panels.page.getToolbar().toggleMenuItem('new', true);
        }
        else if(block.instanceOf('BlockToggler')){
            // Update the 'blocks' field options and value
            const panel = this.panels.block;
            const field = panel.getField('blocks');

            this.getPlayer().getComponents('.media.video, .controller, .block').forEach((component) => {
                field.addOption(component.getId(), component.getName());
            });

            field.setValue(block.getPropertyValue('blocks'));
        }

        this.updatePageSelector();
    }

    /**
     * Block panel componentunset event callback
     *
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
     * @private
     * @param {CustomEvent} evt The event object
     */
    onBlockPanelValueChange(evt){
        const sets = evt.detail;

        const update = (key) => {
            const doUpdateBlockTogglers = sets.some((set) => {
                return (
                    ('x' in set[key]) ||
                    ('y' in set[key]) ||
                    ('width' in set[key]) ||
                    ('height' in set[key]) ||
                    ('blocks' in set[key])
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
     * @private
     * @param {CustomEvent} evt The event object
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
     * @private
     * @param {CustomEvent} evt The event object
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
     * @private
     * @param {CustomEvent} evt The event object
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
     * @private
     * @param {MouseEvent} evt The event object
     */
    onPagePanelToolbarClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'new-before': {
                const block = this.panels.block.getComponent();
                this.addPlayerComponents('page', {'position': 'before'}, block);
                break;
            }

            case 'new-after': {
                const block = this.panels.block.getComponent();
                this.addPlayerComponents('page', {'position': 'after'}, block);
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
     * @private
     * @param {CustomEvent} evt The event object
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
     * @private
     * @param {CustomEvent} evt The event object
     */
    onElementSet(evt){
        const element = evt.detail.component;
        const player = this.getPlayer();

        player.setReadingIndex(element.getPropertyValue('r-index') || 0);

        evt.stopPropagation();
    }

    /**
     * Element panel beforecursoradvancededitmodeunlock event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onElementPanelBeforeCursorAdvancedEditModeUnlock(evt){
        evt.detail.media = this.getPlayer().getMedia();
    }

    /**
     * Element panel valuechange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
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
     * @private
     * @param {CustomEvent} evt The event object
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
        const field = this.mainmenu.getItem('r-index');

        field.setValue(rindex, true);
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
     * Player mediaadd event callback
     *
     * @private
     */
    onPlayerMediaAdd(){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    }

    /**
     * Player controlleradd event callback
     *
     * @private
     */
    onPlayerControllerAdd(){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    }

    /**
     * Player blocktaggleradd event callback
     *
     * @private
     */
    onPlayerBlockTogglerAdd(){
        this.updateBlockSelector();
    }

    /**
     * Player blockadd event callback
     *
     * @private
     */
    onPlayerBlockAdd(){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    }

    /**
    * Player component beforeremove event callback
    *
    * @private
    * @param {CustomEvent} evt The event object
    */
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
     * @private
     * @param {CustomEvent} evt The event object
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
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     */
    onPlayerFrameLoadSuccess(loadmask){
        const player = this.player_frame.get(0).contentWindow.player;

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
            .addDelegate('.metaScore-component', 'beforedrag', this.onComponentBeforeDrag.bind(this))
            .addDelegate('.metaScore-component, .metaScore-component *', 'click', this.onComponentClick.bind(this))
            .addDelegate('.metaScore-component.block', 'pageadd', this.onBlockPageAdd.bind(this))
            .addDelegate('.metaScore-component.page', 'activate', this.onPageActivate.bind(this))
            .addDelegate('.metaScore-component.page', 'elementadd', this.onPageElementAdd.bind(this))
            .addDelegate('.metaScore-component', 'beforeremove', this.onComponentBeforeRemove.bind(this))
            .addListener('mousedown', this.onPlayerMousedown.bind(this))
            .addListener('mediaadd', this.onPlayerMediaAdd.bind(this))
            .addListener('controlleradd', this.onPlayerControllerAdd.bind(this))
            .addListener('blocktoggleradd', this.onPlayerBlockTogglerAdd.bind(this))
            .addListener('blockadd', this.onPlayerBlockAdd.bind(this))
            .addListener('keydown', this.onKeydown.bind(this))
            .addListener('keyup', this.onKeyup.bind(this))
            .addListener('rindex', this.onPlayerReadingIndex.bind(this))
            .addListener('childremove', this.onPlayerChildRemove.bind(this))
            .addListener('click', this.onPlayerClick.bind(this))
            .addListener('play', this.onPlayerPlay.bind(this))
            .addListener('pause', this.onPlayerPause.bind(this));

            this.player.setInEditor(true);

            this.player.contextmenu.disable();

            const player_body = this.player_frame.get(0).contentWindow.document.body;
            this.player_contextmenu
                .setTarget(player_body)
                .enable();

            this
                .setEditing(true)
                .updateMainmenu()
                .updateBlockSelector()
                .updatePageSelector()
                .updateElementSelector();

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

		Object.entries(this.panels).forEach(([, panel]) => {
            panel.unsetComponents();
        });

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
     * Component click event callback
     *
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
     * @private
     * @param {CustomEvent} evt The event object
     */
    onBlockPageAdd(evt){
        const block = evt.detail.block;

        if(block === this.panels.block.getComponent()){
            this.updatePageSelector();
        }

        evt.stopPropagation();
    }

    /**
     * Page activate event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPageActivate(evt){
        const page = evt.detail.page;

        if(page.getBlock() === this.panels.block.getComponent()){
            this.panels.page.setComponent(page);
        }
    }

    /**
     * Page elementadd event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPageElementAdd(evt){
        const element = evt.detail.element;
        const page = evt.detail.page;

        if(evt.detail.new && element.instanceOf('Cursor')){
            const media = this.getPlayer().getMedia();

            if(!isNumber(element.getPropertyValue('start-time'))){
                element.setPropertyValue('start-time', media.getTime());

            }

            if(!isNumber(element.getPropertyValue('end-time'))){
                const block = page.getBlock();
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

		Object.entries(this.panels).forEach(([, panel]) => {
            if(this.editing){
                panel.enable();
            }
            else{
                panel.disable();
            }
        });

        this.toggleClass('editing', this.editing);

        this.mainmenu.getItem('edit-toggle').setValue(this.editing, true);
        this.controller[this.editing ? 'maximize' : 'minimize']();

        if(player){
            player.toggleClass('editing', this.editing);
        }

        this.toggleSidebarResizer();

        return this;
    }

    /**
     * Toggles the activation of the sidebar resizer
     *
     * @private
     * @return {this}
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
     * Updates the selector of the block panel
     *
     * @private
     * @return {this}
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
     * @private
     * @return {this}
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
     * @private
     * @return {this}
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
        this.player_frame = new Dom('<iframe/>', {'src': this.configs.player_url, 'class': 'player-frame'}).appendTo(this.workspace)
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

		Object.entries(this.panels).forEach(([, panel]) => {
            panel.unsetComponents();
        });

        this
            .removeClass('has-player')
            .removeClass('metadata-loaded');

        this.controller.dettachMedia();

        this.player_contextmenu.disable();

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
                const panel = this.panels.element;
                const components = [];

                this.panels.block.setComponent(page.getBlock());
                this.panels.page.setComponent(page);

                configs.forEach((element_config, index) => {
                    const component = page.addElement(element_config);
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
                            'text': Locale.t('editor.addPlayerComponents.page.time.msg', "In a synchronized block, a page cannot be inserted at the media's beginning (@start_time) or end (@duration).<br/><b>Please move the media to a different time before inserting a new page.</b>", {'@start_time': TimeField.getTextualValue(0), '@duration': TimeField.getTextualValue(duration)}),
                            'buttons': {
                                'ok': Locale.t('editor.addPlayerComponents.page.time.ok', 'OK'),
                            },
                            'autoShow': true
                        });

                        break;
                    }

                    const adjacent_page = block.getPage(index);
                    config['start-time'] = before ? adjacent_page.getPropertyValue('start-time') : current_time;
                    config['end-time'] = before ? current_time : adjacent_page.getPropertyValue('end-time');
                    adjacent_page.setPropertyValue(before ? 'start-time' : 'end-time', current_time);
                }

                const component = block.addPage(config, before ? index : index + 1);
                block.setActivePage(index);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponents();
                        if(block.getPropertyValue('synched')){
                            const adjacent_page = block.getPage(before ? index + 1 : index);
                            const prop = before ? 'start-time' : 'end-time';
                            adjacent_page.setPropertyValue(prop, component.getPropertyValue(prop));
                        }
                        block.removePage(component);
                        block.setActivePage(index);
                    },
                    'redo': function(){
                        if(block.getPropertyValue('synched')){
                            const adjacent_page = block.getPage(index);
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
                const player = parent;
                const panel = this.panels.block;
                const components = [];

                configs.forEach((block_config, index) => {
                    let component = null;

                    switch(block_config.type){
                        case 'BlockToggler':
                            component = player.addBlockToggler(Object.assign({'name': Locale.t('editor.onBlockPanelToolbarClick.defaultBlockTogglerName', 'untitled')}, block_config));
                            break;

                        default: {
                            component = player.addBlock(Object.assign({'name': Locale.t('editor.onBlockPanelToolbarClick.defaultBlockName', 'untitled')}, block_config));
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
        const options = Object.assign({
            'data': data,
            'responseType': 'json',
            'onSuccess': this.onGuideSaveSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask),
            'autoSend': false
        }, this.configs.xhr);

        const hundred = 100;

        Ajax.PATCH(this.configs.api_url, options)
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
     * Get a media file's duration in centiseconds
     *
     * @private
     * @param {Object} file The file's url
     * @property {String} mime The file's mime type
     * @property {String} url The file's url
     * @param {Function} callback A callback function to call with an eventual error and the duration
     */
    getMediaFileDuration(file, callback){
        if(isEmpty(file.mime)){
            const message = Locale.t('editor.getMediaFileDuration.no-mime.error', "The file's mime type could not be determined for !url", {'!url': file.url});
            callback(new Error(message));
        }
        else{
            const renderer = this.getPlayer().getMedia().constructor.getRendererForMime(file.mime);
            if(renderer){
                renderer.getDurationFromURI(file.url, (error, duration) => {
                    if(error){
                        callback(error);
                        return;
                    }

                    const centiseconds_multiplier = 100;
                    callback(null, Math.round(parseFloat(duration) * centiseconds_multiplier));
                });
            }
            else{
                const message = Locale.t('editor.getMediaFileDuration.no-renderer.error', 'No compatible renderer found for the mime type !mime', {'!mine': file.mine});
                callback(new Error(message));
            }
        }

    }

}
