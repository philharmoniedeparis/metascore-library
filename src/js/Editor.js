import {Dom} from './core/Dom';
import {_Function} from './core/utils/Function';
import {_Array} from './core/utils/Array';
import {_Object} from './core/utils/Object';
import {_String} from './core/utils/String';
import {_Var} from './core/utils/Var';
import {Locale} from './core/Locale';
import {MainMenu} from './editor/MainMenu';
import {Resizable} from './core/ui/Resizable';
import {BlockPanel} from './editor/panel/Block';
import {PagePanel} from './editor/panel/Page';
import {ElementPanel} from './editor/panel/Element';
import {History} from './editor/History';
import {Alert} from './core/ui/overlay/Alert';
import {LoadMask} from './core/ui/overlay/LoadMask';
import {Clipboard} from './core/Clipboard';
import {Ajax} from './core/Ajax';
import {ContextMenu} from './core/ContextMenu';
import {GuideDetails} from './editor/overlay/GuideDetails';
import {GuideSelector} from './editor/overlay/GuideSelector';
import {Share} from './editor/overlay/Share';


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
     * @param {Object} [configs.ajax={}] Custom options to send with each AJAX request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     */
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super('<div/>', {'class': 'metaScore-editor'});

        if(this.configs.container){
            this.appendTo(this.configs.container);
        }

        // add components

        this.h_ruler = new Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this);
        this.v_ruler = new Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this);

        this.workspace = new Dom('<div/>', {'class': 'workspace'}).appendTo(this);

        this.mainmenu = new MainMenu().appendTo(this)
            .toggleButton('help', this.configs.help_url ? true : false)
            .toggleButton('account', this.configs.account_url ? true : false)
            .toggleButton('logout', this.configs.logout_url ? true : false)
            .addDelegate('button[data-action]:not(.disabled)', 'click', _Function.proxy(this.onMainmenuClick, this))
            .addDelegate('.time', 'valuechange', _Function.proxy(this.onMainmenuTimeFieldChange, this))
            .addDelegate('.r-index', 'valuechange', _Function.proxy(this.onMainmenuRindexFieldChange, this));

        this.sidebar_wrapper = new Dom('<div/>', {'class': 'sidebar-wrapper'}).appendTo(this)
            .addListener('resizestart', _Function.proxy(this.onSidebarResizeStart, this))
            .addListener('resize', _Function.proxy(this.onSidebarResize, this))
            .addListener('resizeend', _Function.proxy(this.onSidebarResizeEnd, this));

        this.sidebar = new Dom('<div/>', {'class': 'sidebar'}).appendTo(this.sidebar_wrapper);

        this.sidebar_resizer = new Resizable({target: this.sidebar_wrapper, directions: ['left']});
        this.sidebar_resizer.getHandle('left')
            .addListener('dblclick', _Function.proxy(this.onSidebarResizeDblclick, this));

        this.panels = {};

        this.panels.block = new BlockPanel().appendTo(this.sidebar)
            .addListener('componentbeforeset', _Function.proxy(this.onBlockBeforeSet, this))
            .addListener('componentset', _Function.proxy(this.onBlockSet, this))
            .addListener('componentunset', _Function.proxy(this.onBlockUnset, this))
            .addListener('valueschange', _Function.proxy(this.onBlockPanelValueChange, this));

        this.panels.block.getToolbar()
            .addDelegate('.selector', 'valuechange', _Function.proxy(this.onBlockPanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', _Function.proxy(this.onBlockPanelToolbarClick, this));

        this.panels.page = new PagePanel().appendTo(this.sidebar)
            .addListener('componentbeforeset', _Function.proxy(this.onPageBeforeSet, this))
            .addListener('componentset', _Function.proxy(this.onPageSet, this))
            .addListener('componentunset', _Function.proxy(this.onPageUnset, this))
            .addListener('valueschange', _Function.proxy(this.onPagePanelValueChange, this));

        this.panels.page.getToolbar()
            .addDelegate('.selector', 'valuechange', _Function.proxy(this.onPagePanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', _Function.proxy(this.onPagePanelToolbarClick, this));

        this.panels.element = new ElementPanel().appendTo(this.sidebar)
            .addListener('componentbeforeset', _Function.proxy(this.onElementBeforeSet, this))
            .addListener('componentset', _Function.proxy(this.onElementSet, this))
            .addListener('valueschange', _Function.proxy(this.onElementPanelValueChange, this));

        this.panels.element.getToolbar()
            .addDelegate('.selector', 'valuechange', _Function.proxy(this.onElementPanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', _Function.proxy(this.onElementPanelToolbarClick, this));

        this.grid = new Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);

        this.history = new History()
            .addListener('add', _Function.proxy(this.onHistoryAdd, this))
            .addListener('undo', _Function.proxy(this.onHistoryUndo, this))
            .addListener('redo', _Function.proxy(this.onHistoryRedo, this));
            
        this.clipboard = new Clipboard();
        
        // prevent the custom contextmenu from overriding the native one in inputs
        this.addDelegate('input', 'contextmenu', function(evt){
            evt.stopImmediatePropagation();
            evt.stopPropagation();
        });
        
        this.contextmenu = new ContextMenu({'target': this, 'items': {
                'about': {
                    'text': Locale.t('editor.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': metaScore.getVersion(), '!revision': metaScore.getRevision()})
                }
            }})
            .appendTo(this);
                
        this.player_contextmenu = new ContextMenu({'target': null, 'items': {
                'add-element': {
                    'text': Locale.t('editor.contextmenu.add-element', 'Add an element'),
                    'items': {
                        'add-element-cursor': {
                            'text': Locale.t('editor.contextmenu.add-element-cursor', 'Cursor'),
                            'callback': _Function.proxy(function(context){
                                this.addPlayerComponent('element', {'type': 'Cursor'}, Dom.closest(context, '.metaScore-component.page')._metaScore);
                            }, this)
                        },
                        'add-element-image': {
                            'text': Locale.t('editor.contextmenu.add-element-image', 'Image'),
                            'callback': _Function.proxy(function(context){
                                this.addPlayerComponent('element', {'type': 'Image'}, Dom.closest(context, '.metaScore-component.page')._metaScore);
                            }, this)
                        },
                        'add-element-text': {
                            'text': Locale.t('editor.contextmenu.add-element-text', 'Text'),
                            'callback': _Function.proxy(function(context){
                                this.addPlayerComponent('element', {'type': 'Text'}, Dom.closest(context, '.metaScore-component.page')._metaScore);
                            }, this)
                        }
                    },
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (Dom.closest(context, '.metaScore-component.page') ? true : false);
                    }, this)
                },
                'copy-element': {
                    'text': Locale.t('editor.contextmenu.copy-element', 'Copy element'),
                    'callback': _Function.proxy(function(context){
                        this.clipboard.setData('element', Dom.closest(context, '.metaScore-component.element')._metaScore.getProperties());
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (Dom.closest(context, '.metaScore-component.element') ? true : false);
                    }, this)
                },
                'paste-element': {
                    'text': Locale.t('editor.contextmenu.paste-element', 'Paste element'),
                    'callback': _Function.proxy(function(context){
                        var component = this.clipboard.getData();
                        component.x += 5;
                        component.y += 5;
                        this.addPlayerComponent('element', component, Dom.closest(context, '.metaScore-component.page')._metaScore);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (this.clipboard.getDataType() === 'element') && (Dom.closest(context, '.metaScore-component.page') ? true : false);
                    }, this)
                },
                'delete-element': {
                    'text': Locale.t('editor.contextmenu.delete-element', 'Delete element'),
                    'callback': _Function.proxy(function(context){
                        this.deletePlayerComponent(Dom.closest(context, '.metaScore-component.element')._metaScore, true);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = Dom.closest(context, '.metaScore-component.element');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'lock-element': {
                    'text': Locale.t('editor.contextmenu.lock-element', 'Lock element'),
                    'callback': _Function.proxy(function(context){
                        Dom.closest(context, '.metaScore-component.element')._metaScore.setProperty('locked', true);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = Dom.closest(context, '.metaScore-component.element');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'unlock-element': {
                    'text': Locale.t('editor.contextmenu.unlock-element', 'Unlock element'),
                    'callback': _Function.proxy(function(context){
                        Dom.closest(context, '.metaScore-component.element')._metaScore.setProperty('locked', false);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = Dom.closest(context, '.metaScore-component.element');
                        return dom && dom._metaScore.getProperty('locked');
                    }, this)
                },
                'element-separator': {
                    'class': 'separator',
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (Dom.closest(context, '.metaScore-component.page, .metaScore-component.element') ? true : false);
                    }, this)
                },
                'add-page': {
                    'text': Locale.t('editor.contextmenu.add-page', 'Add a page'),
                    'callback': _Function.proxy(function(context){
                        this.addPlayerComponent('page', {}, Dom.closest(context, '.metaScore-component.block')._metaScore);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (Dom.closest(context, '.metaScore-component.block') ? true : false);
                    }, this)
                },
                'delete-page': {
                    'text': Locale.t('editor.contextmenu.delete-page', 'Delete page'),
                    'callback': _Function.proxy(function(context){
                        this.deletePlayerComponent(Dom.closest(context, '.metaScore-component.page')._metaScore, true);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (Dom.closest(context, '.metaScore-component.page') ? true : false);
                    }, this)
                },
                'page-separator': {
                    'class': 'separator',
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (Dom.closest(context, '.metaScore-component.block, .metaScore-component.page') ? true : false);
                    }, this)
                },
                'add-block': {
                    'text': Locale.t('editor.contextmenu.add-block', 'Add a block'),
                    'items': {
                        'add-block-synched': {
                            'text': Locale.t('editor.contextmenu.add-block-synched', 'Synchronized'),
                            'callback': _Function.proxy(function(context){
                                this.addPlayerComponent('block', {'synched': true}, this.getPlayer());
                            }, this)
                        },
                        'add-block-non-synched': {
                            'text': Locale.t('editor.contextmenu.add-block-non-synched', 'Non-synchronized'),
                            'callback': _Function.proxy(function(context){
                                this.addPlayerComponent('block', {'synched': false}, this.getPlayer());
                            }, this)
                        },
                        'separator': {
                            'class': 'separator'
                        },
                        'add-block-toggler': {
                            'text': Locale.t('editor.contextmenu.add-block-toggler', 'Block Toggler'),
                            'callback': _Function.proxy(function(context){
                                this.addPlayerComponent('block-toggler', {}, this.getPlayer());
                            }, this)
                        }
                    },
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true);
                    }, this)
                },
                'copy-block': {
                    'text': Locale.t('editor.contextmenu.copy-block', 'Copy block'),
                    'callback': _Function.proxy(function(context){
                        var component = Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore,
                            type = component.instanceOf('BlockToggler') ? 'block-toggler' : 'block';

                        this.clipboard.setData(type, component.getProperties());
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler') ? true : false);
                    }, this)
                },
                'paste-block': {
                    'text': Locale.t('editor.contextmenu.paste-block', 'Paste block'),
                    'callback': _Function.proxy(function(context){
                        var type = this.clipboard.getDataType(),
                            component = this.clipboard.getData();

                        component.x += 5;
                        component.y += 5;

                        if(type === 'block-toggler'){
                            this.getPlayer().addBlockToggler(component);
                        }
                        else{
                            this.getPlayer().addBlock(component);
                        }
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true) && (this.clipboard.getDataType() === 'block' || this.clipboard.getDataType() === 'block-toggler');
                    }, this)
                },
                'delete-block': {
                    'text': Locale.t('editor.contextmenu.delete-block', 'Delete block'),
                    'callback': _Function.proxy(function(context){
                        this.deletePlayerComponent(Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore, true);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'lock-block': {
                    'text': Locale.t('editor.contextmenu.lock-block', 'Lock block'),
                    'callback': _Function.proxy(function(context){
                        Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setProperty('locked', true);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && !dom._metaScore.getProperty('locked');
                    }, this)
                },
                'unlock-block': {
                    'text': Locale.t('editor.contextmenu.unlock-block', 'Unlock block'),
                    'callback': _Function.proxy(function(context){
                        Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler')._metaScore.setProperty('locked', false);
                    }, this),
                    'toggler': _Function.proxy(function(context){
                        if(this.editing !== true){
                            return false;
                        }
                        
                        var dom = Dom.closest(context, '.metaScore-component.block, .metaScore-component.block-toggler');
                        return dom && dom._metaScore.getProperty('locked');
                    }, this)
                },
                'block-separator': {
                    'class': 'separator',
                    'toggler': _Function.proxy(function(context){
                        return (this.editing === true);
                    }, this)
                },
                'about': {
                    'text': Locale.t('editor.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': metaScore.getVersion(), '!revision': metaScore.getRevision()})
                }
            }})
            .appendTo(this.workspace);

        this.detailsOverlay = new GuideDetails({
                'groups': this.configs.user_groups,
                'submit_text': Locale.t('editor.detailsOverlay.submit_text', 'Apply')
            })
            .addListener('show', _Function.proxy(this.onDetailsOverlayShow, this))
            .addListener('submit', _Function.proxy(this.onDetailsOverlaySubmit, this, ['update']));

        this.detailsOverlay.getField('type').readonly(true);

        Dom.addListener(window, 'hashchange', _Function.proxy(this.onWindowHashChange, this));
        Dom.addListener(window, 'beforeunload', _Function.proxy(this.onWindowBeforeUnload, this));

        this
            .addListener('mousedown', _Function.proxy(this.onMousedown, this))
            .addListener('keydown', _Function.proxy(this.onKeydown, this))
            .addListener('keyup', _Function.proxy(this.onKeyup, this))
            .addDelegate('.timefield', 'valuein', _Function.proxy(this.onTimeFieldIn, this))
            .addDelegate('.timefield', 'valueout', _Function.proxy(this.onTimeFieldOut, this))
            .setDirty(false)
            .setEditing(false)
            .updateMainmenu()
            .loadPlayerFromHash();
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
            'ajax': {}
        };
    }

    /**
     * XHR error callback
     *
     * @method onXHRError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    onXHRError(xhr){
        this.loadmask.hide();
        delete this.loadmask;

        new Alert({
            'parent': this,
            'text': Locale.t('editor.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
            'buttons': {
                'ok': Locale.t('editor.onXHRError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Guide creation success callback
     *
     * @method onGuideCreateSuccess
     * @private
     * @param {GuideDetails} overlay The GuideDetails overlay that was used to create the guide
     * @param {XMLHttpRequest} xhr The XHR request
     */
    onGuideCreateSuccess(overlay, xhr){
        var json = JSON.parse(xhr.response);

        this.loadmask.hide();
        delete this.loadmask;

        overlay.hide();

        this.loadPlayer(json.id, json.vid);
    };

    /**
     * Guide saving success callback
     *
     * @method onGuideSaveSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    onGuideSaveSuccess(xhr){
        var player = this.getPlayer(),
            data = JSON.parse(xhr.response);

        this.loadmask.hide();
        delete this.loadmask;

        if((data.id !== player.getId()) || this.configs.reload_player_on_save){
            this.loadPlayer(data.id, data.vid);
        }
        else{
            this.detailsOverlay
                .clearValues(true)
                .setValues(data, true);

            player.updateData(data, true)
                  .setRevision(data.vid);
        
            this.setDirty(false)
                .updateMainmenu();
        }
    };

    /**
     * Guide deletion confirm callback
     *
     * @method onGuideDeleteConfirm
     * @private
     */
    onGuideDeleteConfirm() {
        var id = this.getPlayer().getId(),
            component, options;

        options = _Object.extend({}, {
            'dataType': 'json',
            'method': 'DELETE',
            'success': _Function.proxy(this.onGuideDeleteSuccess, this),
            'error': _Function.proxy(this.onXHRError, this)
        }, this.configs.ajax);

        this.loadmask = new LoadMask({
            'parent': this,
            'autoShow': true
        });

        Ajax.send(this.configs.api_url +'guide/'+ id +'.json', options);
    };

    /**
     * Guide deletion success callback
     *
     * @method onGuideDeleteSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    onGuideDeleteSuccess(xhr){
        this.unloadPlayer();

        this.loadmask.hide();
        delete this.loadmask;
    };

    /**
     * Guide revert confirm callback
     *
     * @method onGuideRevertConfirm
     * @private
     */
    onGuideRevertConfirm() {
        var player = this.getPlayer();

        this.loadPlayer(player.getId(), player.getRevision());
    };

    /**
     * GuideSelector submit callback
     *
     * @method onGuideSelectorSubmit
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideSelector/submit:event"}}GuideSelector.submit{{/crossLink}}
     */
    onGuideSelectorSubmit(evt){
        this.loadPlayer(evt.detail.guide.id, evt.detail.vid);
    };

    /**
     * Keydown event callback
     *
     * @method onKeydown
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onKeydown(evt){
        var player;

        switch(evt.keyCode){
            case 18: //alt
                if(!evt.repeat){
                    this.setEditing(!this.persistentEditing, false);
                    evt.preventDefault();
                }
                break;

            case 72: //h
                if(evt.ctrlKey){ // Ctrl+h
                    player = this.getPlayer();
                    if(player){
                        player.addClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;

            case 90: //z
                if(evt.ctrlKey){ // Ctrl+z
                    this.history.undo();
                    evt.preventDefault();
                }
                break;

            case 89: //y
                if(evt.ctrlKey){ // Ctrl+y
                    this.history.redo();
                    evt.preventDefault();
                }
                break;
        }
    };

    /**
     * Keyup event callback
     *
     * @method onKeyup
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onKeyup(evt){
        var player;

        switch(evt.keyCode){
            case 18: //alt
                this.setEditing(this.persistentEditing, false);
                evt.preventDefault();
                break;

            case 72: //h
                if(evt.ctrlKey){ // Ctrl+h
                    player = this.getPlayer();
                    if(player){
                        player.removeClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;
        }
    };

    /**
     * Mousedown event callback
     *
     * @method onMousedown
     * @private
     * @param {CustomEvent} evt The event object
     */
    onMousedown(evt){
        if(this.player_contextmenu){
            this.player_contextmenu.hide();
        }
    };

    /**
     * Mainmenu click event callback
     *
     * @method onMainmenuClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onMainmenuClick(evt){
        var callback;

        switch(Dom.data(evt.target, 'action')){
            case 'new':
                callback = _Function.proxy(function(){
                    new GuideDetails({
                            'groups': this.configs.user_groups,
                            'autoShow': true
                        })
                        .addListener('show', _Function.proxy(this.onDetailsOverlayShow, this))
                        .addListener('submit', _Function.proxy(this.onDetailsOverlaySubmit, this, ['create']));
                }, this);

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
                        .addListener('buttonclick', function(evt){
                            if(evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;

            case 'open':
                callback = _Function.proxy(this.openGuideSelector, this);

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
                        .addListener('buttonclick', function(evt){
                            if(evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;

            case 'edit':
                this.detailsOverlay.show();
                break;

            case 'save':
                this.saveGuide('update');
                break;

            case 'clone':
                this.saveGuide('clone');
                break;

            case 'publish':
                callback = _Function.proxy(function(){
                    this.saveGuide('update', true);
                }, this);

                new Alert({
                        'parent': this,
                        'text': Locale.t('editor.onMainmenuClick.publish.msg', 'This action will make this version the public version.<br/>Are you sure you want to continue?'),
                        'buttons': {
                            'confirm': Locale.t('editor.onMainmenuClick.publish.yes', 'Yes'),
                            'cancel': Locale.t('editor.onMainmenuClick.publish.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', function(evt){
                        if(evt.detail.action === 'confirm'){
                            callback();
                        }
                    });
                break;

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
                    .addListener('buttonclick', _Function.proxy(function(evt){
                        if(evt.detail.action === 'confirm'){
                            this.onGuideDeleteConfirm();
                        }
                    }, this));
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
                    .addListener('buttonclick', _Function.proxy(function(evt){
                        if(evt.detail.action === 'confirm'){
                            this.onGuideRevertConfirm();
                        }
                    }, this));
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
    };

    /**
     * Mainmenu time field valuechange event callback
     *
     * @method onMainmenuTimeFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuechange:event"}}Time.valuechange{{/crossLink}}
     */
    onMainmenuTimeFieldChange(evt){
        var field = evt.target._metaScore,
            time = field.getValue();

        this.getPlayer().getMedia().setTime(time);
    };

    /**
     * Mainmenu reading index field valuechange event callback
     *
     * @method onMainmenuRindexFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Number/valuechange:event"}}Number.valuechange{{/crossLink}}
     */
    onMainmenuRindexFieldChange(evt){
        var field = evt.target._metaScore,
            value = field.getValue();

        this.getPlayer().setReadingIndex(value, true);
    };

    /**
     * Time field valuein event callback
     *
     * @method onTimeFieldIn
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuein:event"}}Time.valuein{{/crossLink}}
     */
    onTimeFieldIn(evt){
        var field = evt.detail.field,
            time = this.getPlayer().getMedia().getTime();

        field.setValue(time);
    };

    /**
     * Time field valueout event callback
     *
     * @method onTimeFieldOut
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valueout:event"}}Time.valueout{{/crossLink}}
     */
    onTimeFieldOut(evt){
        var time = evt.detail.value;

        this.getPlayer().getMedia().setTime(time);
    };

    /**
     * Sidebar resizestart event callback
     *
     * @method onSidebarResizeStart
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resizestart:event"}}Resizable.resizestart{{/crossLink}}
     */
    onSidebarResizeStart(evt){
        this.addClass('sidebar-resizing');
    };

    /**
     * Sidebar resize event callback
     *
     * @method onSidebarResize
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resize:event"}}Resizable.resize{{/crossLink}}
     */
    onSidebarResize(evt){
        var width = parseInt(this.sidebar_wrapper.css('width'), 10);

        this.workspace.css('right', width +'px');
    };

    /**
     * Sidebar resizeend event callback
     *
     * @method onSidebarResizeEnd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resizeend:event"}}Resizable.resizeend{{/crossLink}}
     */
    onSidebarResizeEnd(evt){
        this.removeClass('sidebar-resizing');
    };

    /**
     * Sidebar resize handle dblclick event callback
     *
     * @method onSidebarResizeDblclick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onSidebarResizeDblclick(evt){
        this.toggleClass('sidebar-hidden');

        this.toggleSidebarResizer();
    };

    /**
     * Block panel componentbeforeset event callback
     *
     * @method onBlockBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    onBlockBeforeSet(evt){
        var block = evt.detail.component;

        this.panels.element.unsetComponent();
        this.panels.page.unsetComponent();
    };

    /**
     * Block panel componentset event callback
     *
     * @method onBlockSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    onBlockSet(evt){
        var block = evt.detail.component;

        if(block.instanceOf('Block')){
            this.panels.page.getToolbar()
                .toggleMenuItem('new', true);

            this.panels.page.setComponent(block.getActivePage());

            this.panels.element.getToolbar()
                .toggleMenuItem('Cursor', true)
                .toggleMenuItem('Image', true)
                .toggleMenuItem('Text', true);
        }

        this.updatePageSelector();

        evt.stopPropagation();
    };

    /**
     * Block panel componentunset event callback
     *
     * @method onBlockUnset
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentunset:event"}}Panel.componentunset{{/crossLink}}
     */
    onBlockUnset(evt){
        this.panels.page.unsetComponent();
        this.panels.page.getToolbar().toggleMenuItem('new', false);
    };

    /**
     * Block panel valuechange event callback
     *
     * @method onBlockPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    onBlockPanelValueChange(evt){
        var panel = this.panels.block,
            block = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values;

        this.history.add({
            'undo': function(){
                panel.updateProperties(block, old_values);
            },
            'redo': function(){
                panel.updateProperties(block, new_values);
            }
        });

        if(!block.instanceOf('BlockToggler')){
            if(('x' in new_values) || ('y' in new_values) || ('width' in new_values) || ('height' in new_values)){
                this.getPlayer().updateBlockTogglers();
            }
        }
    };

    /**
     * Block panel toolbar click event callback
     *
     * @method onBlockPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onBlockPanelToolbarClick(evt){
        var block,
            action = Dom.data(evt.target, 'action');

        switch(action){
            case 'synched':
            case 'non-synched':
                this.addPlayerComponent('block', {'synched': action === 'synched'}, this.getPlayer());
                break;

            case 'block-toggler':
                this.addPlayerComponent('block-toggler', {}, this.getPlayer());
                break;

            case 'delete':
                block = this.panels.block.getComponent();
                this.deletePlayerComponent(block, true);
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Block panel toolbar selector valuechange event callback
     *
     * @method onBlockPanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    onBlockPanelSelectorChange(evt){
        var id = evt.detail.value,
            dom;

        if(!id){
            this.panels.block.unsetComponent();
        }
        else{
            dom = this.getPlayer().getComponent('.media#'+ id +', .controller#'+ id +', .block#'+ id +', .block-toggler#'+ id);

            if(dom && dom._metaScore){
                this.panels.block.setComponent(dom._metaScore);
            }
        }
    };

    /**
     * Page panel componentbeforeset event callback
     *
     * @method onPageBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    onPageBeforeSet(evt){
        var page = evt.detail.component,
            block = page.getBlock();

        this.panels.element.unsetComponent();
        this.panels.block.setComponent(block);
    };

    /**
     * Page panel componentset event callback
     *
     * @method onPageSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    onPageSet(evt){        
        var page = evt.detail.component,
            block = this.panels.block.getComponent(),
            index, previous_page, next_page,
            start_time_field = this.panels.page.getField('start-time'),
            end_time_field = this.panels.page.getField('end-time');

        this.panels.page.getToolbar().toggleMenuItem('new', true);

        this.panels.element
            .unsetComponent()
            .getToolbar()
                .toggleMenuItem('Cursor', true)
                .toggleMenuItem('Image', true)
                .toggleMenuItem('Text', true);

        if(block.getProperty('synched')){
            index = block.getActivePageIndex();
            previous_page = block.getPage(index-1);
            next_page = block.getPage(index+1);

            if(previous_page){
                start_time_field.readonly(false).enable().setMin(previous_page.getProperty('start-time'));
            }
            else{
                start_time_field.readonly(true).enable();
            }

            if(next_page){
                end_time_field.readonly(false).enable().setMax(next_page.getProperty('end-time'));
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
    };

    /**
     * Page panel componentunset event callback
     *
     * @method onPageUnset
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentunset:event"}}Panel.componentunset{{/crossLink}}
     */
    onPageUnset(evt){
        this.panels.element
            .unsetComponent()
            .getToolbar()
                .toggleMenuItem('Cursor', false)
                .toggleMenuItem('Image', false)
                .toggleMenuItem('Text', false);
    };

    /**
     * Page panel valuechange event callback
     *
     * @method onPagePanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    onPagePanelValueChange(evt){
        var editor = this,
            panel = this.panels.page,
            page = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values,
            block, index, previous_page, next_page;

        if(('start-time' in new_values) || ('end-time' in new_values)){
            if((block = page.getBlock()) && block.getProperty('synched')){
                index = block.getActivePageIndex();
                previous_page = block.getPage(index-1);
                next_page = block.getPage(index+1);

                if(('start-time' in new_values) && previous_page){
                    previous_page.setProperty('end-time', new_values['start-time']);
                }

                if(('end-time' in new_values) && next_page){
                    next_page.setProperty('start-time', new_values['end-time']);
                }
            }

            editor.updateElementSelector();
        }

        this.history.add({
            'undo': function(){
                panel.updateProperties(page, old_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    if(('start-time' in new_values) && previous_page){
                        previous_page.setProperty('end-time', old_values['start-time']);
                    }

                    if(('end-time' in new_values) && next_page){
                        next_page.setProperty('start-time', old_values['end-time']);
                    }

                    editor.updateElementSelector();
                }
            },
            'redo': function(){
                panel.updateProperties(page, new_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    if(('start-time' in new_values) && previous_page){
                        previous_page.setProperty('end-time', new_values['start-time']);
                    }

                    if(('end-time' in new_values) && next_page){
                        next_page.setProperty('start-time', new_values['end-time']);
                    }

                    editor.updateElementSelector();
                }
            }
        });
    };

    /**
     * Page panel toolbar click event callback
     *
     * @method onPagePanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onPagePanelToolbarClick(evt){
        var block, page,
            action = Dom.data(evt.target, 'action');

        switch(action){
            case 'new':
                block = this.panels.block.getComponent();
                this.addPlayerComponent('page', {}, block);
                break;

            case 'delete':
                page = this.panels.page.getComponent();
                this.deletePlayerComponent(page, true);
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Page panel toolbar selector valuechange event callback
     *
     * @method onPagePanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    onPagePanelSelectorChange(evt){
        var block = this.panels.block.getComponent(),
            id, dom;

        if(block){
            id = evt.detail.value;
            dom = this.getPlayer().getComponent('.page#'+ id);

            if(dom && dom._metaScore){
                block.setActivePage(dom._metaScore);
            }
        }
    };

    /**
     * Element panel componentbeforeset event callback
     *
     * @method onElementBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    onElementBeforeSet(evt){
        var element = evt.detail.component,
            page = element.parents().get(0)._metaScore;

        this.panels.page.setComponent(page);
    };

    /**
     * Element panel componentset event callback
     *
     * @method onElementSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    onElementSet(evt){
        var element = evt.detail.component,
            player = this.getPlayer();

        player.setReadingIndex(element.getProperty('r-index') || 0);

        evt.stopPropagation();
    };

    /**
     * Element panel valuechange event callback
     *
     * @method onElementPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    onElementPanelValueChange(evt){
        var editor = this,
            panel = this.panels.element,
            element = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values;

        if(('start-time' in new_values) || ('end-time' in new_values)){
            editor.updateElementSelector();
        }

        this.history.add({
            'undo': function(){
                panel.updateProperties(element, old_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    editor.updateElementSelector();
                }
            },
            'redo': function(){
                panel.updateProperties(element, new_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    editor.updateElementSelector();
                }
            }
        });
    };

    /**
     * Element panel toolbar click event callback
     *
     * @method onElementPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onElementPanelToolbarClick(evt){
        var page, element,
            action = Dom.data(evt.target, 'action');

        switch(action){
            case 'Cursor':
            case 'Image':
            case 'Text':
                page = this.panels.page.getComponent();
                this.addPlayerComponent('element', {'type': action}, page);
                break;

            case 'delete':
                element = this.panels.element.getComponent();   
                this.deletePlayerComponent(element, true);
                break;
        }
    };

    /**
     * Element panel toolbar selector valuechange event callback
     *
     * @method onPagePanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    onElementPanelSelectorChange(evt){
        var id = evt.detail.value,
            dom;

        if(!id){
            this.panels.element.unsetComponent();
        }
        else{
            dom = this.getPlayer().getComponent('.element#'+ id);

            if(dom && dom._metaScore){
                this.panels.element.setComponent(dom._metaScore);
            }
        }
    };

    /**
     * Player idset event callback
     *
     * @method onPlayerIdSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/idset:event"}}Player.idset{{/crossLink}}
     */
    onPlayerIdSet(evt){
        var player = evt.detail.player;

        window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
    };

    /**
     * Player revisionset event callback
     *
     * @method onPlayerRevisionSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/revisionset:event"}}Player.revisionset{{/crossLink}}
     */
    onPlayerRevisionSet(evt){
        var player = evt.detail.player;

        window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
    };

    /**
     * Player loadedmetadata event callback
     *
     * @method onPlayerLoadedMetadata
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Media/loadedmetadata:event"}}Media.loadedmetadata{{/crossLink}}
     */
    onPlayerLoadedMetadata(evt){        
        this.mainmenu.timefield.setMax(this.player.getMedia().getDuration());
    };

    /**
     * Media timeupdate event callback
     *
     * @method onPlayerTimeUpdate
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Media/timeupdate:event"}}Media.timeupdate{{/crossLink}}
     */
    onPlayerTimeUpdate(evt){
        var time = evt.detail.media.getTime();

        this.mainmenu.timefield.setValue(time, true);
    };

    /**
     * Player rindex event callback
     *
     * @method onPlayerReadingIndex
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/rindex:event"}}Player.rindex{{/crossLink}}
     */
    onPlayerReadingIndex(evt){
        var rindex = evt.detail.value;

        this.mainmenu.rindexfield.setValue(rindex, true);
    };

    /**
     * Player mousedown event callback
     *
     * @method onPlayerMousedown
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayerMousedown(evt){
        this.contextmenu.hide();
    };

    /**
     * Player mediaadd event callback
     *
     * @method onPlayerMediaAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/mediaadd:event"}}Player.blockadd{{/crossLink}}
     */
    onPlayerMediaAdd(evt){
        this.updateBlockSelector();
        
        this.getPlayer().updateBlockTogglers();
    };

    /**
     * Player controlleradd event callback
     *
     * @method onPlayerControllerAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/controlleradd:event"}}Player.blockadd{{/crossLink}}
     */
    onPlayerControllerAdd(evt){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    };

    /**
     * Player blocktaggleradd event callback
     *
     * @method onPlayerBlockTogglerAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/blocktaggleradd:event"}}Player.blockadd{{/crossLink}}
     */
    onPlayerBlockTogglerAdd(evt){
        this.updateBlockSelector();

        var blocks = this.getPlayer().getComponents('.block, .media.video, .controller');
        evt.detail.blocktoggler.update(blocks);
    };

    /**
     * Player blockadd event callback
     *
     * @method onPlayerBlockAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/blockadd:event"}}Player.blockadd{{/crossLink}}
     */
    onPlayerBlockAdd(evt){
        this.updateBlockSelector();

        this.getPlayer().updateBlockTogglers();
    };

    /**
     * Player childremove event callback
     *
     * @method onPlayerChildRemove
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Dom/childremove:event"}}Dom.childremove{{/crossLink}}
     */
    onPlayerChildRemove(evt){
        var child = evt.detail.child,
            component = child._metaScore;

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
    };

    /**
     * Player frame load event callback
     *
     * @method onPlayerFrameLoadSuccess
     * @private
     * @param {UIEvent} evt The event object
     */
    onPlayerFrameLoadSuccess(evt){
        var player = this.player_frame.get(0).contentWindow.player;
    
        if(player){
            player
                .addListener('load', _Function.proxy(this.onPlayerLoadSuccess, this))
                .addListener('error', _Function.proxy(this.onPlayerLoadError, this))
                .addListener('idset', _Function.proxy(this.onPlayerIdSet, this))
                .addListener('revisionset', _Function.proxy(this.onPlayerRevisionSet, this))
                .addListener('loadedmetadata', _Function.proxy(this.onPlayerLoadedMetadata, this))
                .load();
        }
    };

    /**
     * Player frame error event callback
     *
     * @method onPlayerFrameLoadError
     * @private
     * @param {UIEvent} evt The event object
     */
    onPlayerFrameLoadError(evt){
        this.loadmask.hide();
        delete this.loadmask;

        new Alert({
            'parent': this,
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Player load event callback
     *
     * @method onPlayerLoadSuccess
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/load:event"}}Player.load{{/crossLink}}
     */
    onPlayerLoadSuccess(evt){
        var player_body = this.player_frame.get(0).contentWindow.document.body,
            data;
        
        this.player = evt.detail.player
            .addClass('in-editor')
            .addDelegate('.metaScore-component', 'beforedrag', _Function.proxy(this.onComponentBeforeDrag, this))
            .addDelegate('.metaScore-component', 'click', _Function.proxy(this.onComponentClick, this))
            .addDelegate('.metaScore-component.block', 'pageadd', _Function.proxy(this.onBlockPageAdd, this))
            .addDelegate('.metaScore-component.block', 'pageactivate', _Function.proxy(this.onBlockPageActivate, this))
            .addDelegate('.metaScore-component.page', 'elementadd', _Function.proxy(this.onPageElementAdd, this))
            .addListener('mousedown', _Function.proxy(this.onPlayerMousedown, this))
            .addListener('mediaadd', _Function.proxy(this.onPlayerMediaAdd, this))
            .addListener('controlleradd', _Function.proxy(this.onPlayerControlleAdd, this))
            .addListener('blocktoggleradd', _Function.proxy(this.onPlayerBlockTogglerAdd, this))
            .addListener('blockadd', _Function.proxy(this.onPlayerBlockAdd, this))
            .addListener('keydown', _Function.proxy(this.onKeydown, this))
            .addListener('keyup', _Function.proxy(this.onKeyup, this))
            .addListener('click', _Function.proxy(this.onPlayerClick, this))
            .addListener('timeupdate', _Function.proxy(this.onPlayerTimeUpdate, this))
            .addListener('rindex', _Function.proxy(this.onPlayerReadingIndex, this))
            .addListener('childremove', _Function.proxy(this.onPlayerChildRemove, this));
            
        this.player.contextmenu
            .disable();
        
        this.player_contextmenu
            .setTarget(player_body)
            .enable();
            
        data = this.player.getData();

        new Dom(player_body)
            .addListener('keydown', _Function.proxy(this.onKeydown, this))
            .addListener('keyup', _Function.proxy(this.onKeyup, this));

        this
            .setEditing(true)
            .updateMainmenu()
            .updateBlockSelector();

        this.mainmenu
            .toggleButton('save', data.permissions.update)
            .toggleButton('clone', data.permissions.clone)
            .toggleButton('publish', data.permissions.update)
            .toggleButton('delete', data.permissions.delete);

        this.mainmenu.rindexfield.setValue(0, true);

        this.detailsOverlay
            .clearValues(true)
            .setValues(data, true);

        this.loadmask.hide();
        delete this.loadmask;
    };

    /**
     * Player error event callback
     *
     * @method onPlayerLoadError
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/error:event"}}Player.error{{/crossLink}}
     */
    onPlayerLoadError(evt){
        this.loadmask.hide();
        delete this.loadmask;

        new Alert({
            'parent': this,
            'text': Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

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

        this.panels.block.unsetComponent();

        evt.stopPropagation();
    };

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
    };

    /**
     * Component click event callback
     *
     * @method onComponentClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onComponentClick(evt, dom){
        var component;

        if(this.editing !== true){
            return;
        }

        component = dom._metaScore;

        if(component.instanceOf('Element')){
            this.panels.element.setComponent(component);
        }
        else if(component.instanceOf('Page')){
            this.panels.page.setComponent(component);
        }
        else{
            this.panels.block.setComponent(component);
        }

        evt.stopImmediatePropagation();
    };

    /**
     * Block pageadd event callback
     *
     * @method onBlockPageAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageadd:event"}}Block.pageadd{{/crossLink}}
     */
    onBlockPageAdd(evt){
        var block = evt.detail.block;

        if(block === this.panels.block.getComponent()){
            this.updatePageSelector();
        }

        evt.stopPropagation();
    };

    /**
     * Block pageactivate event callback
     *
     * @method onBlockPageActivate
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageactivate:event"}}Block.pageactivate{{/crossLink}}
     */
    onBlockPageActivate(evt){
        var page, basis;

        if(this.editing !== true){
            return;
        }

        page = evt.detail.page;
        basis = evt.detail.basis;

        if((basis !== 'pagecuepoint') || (page.getBlock() === this.panels.block.getComponent())){
            this.panels.page.setComponent(page);
        }
    };

    /**
     * Page elementadd event callback
     *
     * @method onPageElementAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Page/elementadd:event"}}Page.elementadd{{/crossLink}}
     */
    onPageElementAdd(evt){
        var page = evt.detail.page,
            block, media;
        
        if((evt.detail.new) && (evt.detail.element.data('type') === 'Cursor')){
            block = page.getBlock();
            media = this.getPlayer().getMedia();
            
            evt.detail.element
                .setProperty('start-time', media.getTime())
                .setProperty('end-time', block.getProperty('synched') ? page.getProperty('end-time') : media.getDuration());
        }

        if(page === this.panels.page.getComponent()){
            this.updateElementSelector();
        }

        evt.stopPropagation();
    };

    /**
     * History add event callback
     *
     * @method onHistoryAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/add:event"}}History.add{{/crossLink}}
     */
    onHistoryAdd(evt){
        this.setDirty(true)
            .updateMainmenu();
    };

    /**
     * History undo event callback
     *
     * @method onHistoryUndo
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/undo:event"}}History.undo{{/crossLink}}
     */
    onHistoryUndo(evt){
        this.updateMainmenu();
    };

    /**
     * History redo event callback
     *
     * @method onHistoryRedo
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/redo:event"}}History.redo{{/crossLink}}
     */
    onHistoryRedo(evt){
        this.updateMainmenu();
    };

    /**
     * GuideDetails show event callback
     *
     * @method onDetailsOverlayShow
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Overlay/show:event"}}Overlay.show{{/crossLink}}
     */
    onDetailsOverlayShow(evt){
        var player = this.getPlayer();

        if(player){
            player.getMedia().pause();
        }
    };

    /**
     * GuideDetails submit event callback
     *
     * @method onDetailsOverlaySubmit
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideDetails/submit:event"}}GuideDetails.submit{{/crossLink}}
     */
    onDetailsOverlaySubmit(op, evt){
        var overlay = evt.detail.overlay,
            data = evt.detail.values,
            player, callback;

        switch(op){
            case 'create':
                this.createGuide(data, overlay);
                break;

            case 'update':
                player = this.getPlayer();

                callback = _Function.proxy(function(new_duration){
                    if(new_duration){
                        player.getComponents('.block').each(function(index, block_dom){
                            var block, page;
                            
                            if(block_dom._metaScore){
                                block = block_dom._metaScore;

                                if(block.getProperty('synched')){
                                    page = block.getPage(block.getPageCount()-1);
                                    if(page){
                                        page.setProperty('end-time', new_duration);
                                    }
                                }
                            }
                        });
                    }
                    
                    player.updateData(data);
                    overlay.setValues(_Object.extend({}, player.getData(), data), true).hide();

                    this.mainmenu.timefield.setMax(new_duration);
                    
                    this.setDirty(true)
                        .updateMainmenu();
                }, this);

                if('media' in data){
                    this.getMediaFileDuration(data['media'].url, _Function.proxy(function(new_duration){
                        var old_duration = player.getMedia().getDuration(),
                            formatted_old_duration, formatted_new_duration,
                            blocks = [], block, page, msg;

                        if(new_duration !== old_duration){
                            formatted_old_duration = (parseInt((old_duration / 360000), 10) || 0);
                            formatted_old_duration += ":";
                            formatted_old_duration += _String.pad(parseInt((old_duration / 6000) % 60, 10) || 0, 2, "0", "left");
                            formatted_old_duration += ":";
                            formatted_old_duration += _String.pad(parseInt((old_duration / 100) % 60, 10) || 0, 2, "0", "left");
                            formatted_old_duration += ".";
                            formatted_old_duration += _String.pad(parseInt((old_duration) % 100, 10) || 0, 2, "0", "left");
                                                     
                            formatted_new_duration = (parseInt((new_duration / 360000), 10) || 0);
                            formatted_new_duration += ":";
                            formatted_new_duration += _String.pad(parseInt((new_duration / 6000) % 60, 10) || 0, 2, "0", "left");
                            formatted_new_duration += ":";
                            formatted_new_duration += _String.pad(parseInt((new_duration / 100) % 60, 10) || 0, 2, "0", "left");
                            formatted_new_duration += ".";
                            formatted_new_duration += _String.pad(parseInt((new_duration) % 100, 10) || 0, 2, "0", "left");
                            
                            if(new_duration < old_duration){
                                player.getComponents('.block').each(function(index, block_dom){
                                    if(block_dom._metaScore){
                                        block = block_dom._metaScore;

                                        if(block.getProperty('synched')){
                                            _Array.each(block.getPages(), function(index, page){
                                                if(page.getProperty('start-time') > new_duration){
                                                    blocks.push(block.getProperty('name'));
                                                    return false;
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                            if(blocks.length > 0){
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
                                .addListener('buttonclick', function(evt){
                                    if(evt.detail.action === 'confirm'){
                                        callback(new_duration);
                                    }
                                });
                            }
                        }
                        else{
                            callback();
                        }
                    }, this));
                }
                else{
                    callback();
                }
                break;
        }
    };

    /**
     * Window hashchange event callback
     *
     * @method onWindowHashChange
     * @private
     * @param {HashChangeEvent} evt The event object
     */
    onWindowHashChange(evt){
        var callback = _Function.proxy(this.loadPlayerFromHash, this),
            oldURL = evt.oldURL;

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
                .addListener('buttonclick', function(evt){
                    if(evt.detail.action === 'confirm'){
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
    };

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
    };

    /**
     * Updates the editing state
     *
     * @method setEditing
     * @param {Boolean} editing The new state
     * @param {Boolean} sticky Whether the new state is persistent or temporary
     * @chainable
     */
    setEditing(editing, sticky){
        var player = this.getPlayer();

        this.editing = editing !== false;

        if(sticky !== false){
            this.persistentEditing = this.editing;
        }

        _Object.each(this.panels, function(key, panel){
            if(this.editing){
                panel.enable();
            }
            else{
                panel.disable();
            }
        }, this);

        this.toggleClass('editing', this.editing);

        if(player){
            player.toggleClass('editing', this.editing);
        }

        this.toggleSidebarResizer();

        return this;

    };

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
    };

    /**
     * Loads a player from the location hash
     *
     * @method loadPlayerFromHash
     * @private
     * @chainable
     */
    loadPlayerFromHash() {
        var hash, match;

        hash = window.location.hash;

        if(match = hash.match(/(#|&)guide=(\w+)(:(\d+))?/)){
            this.loadPlayer(match[2], match[4]);
        }

        return this;
    };

    /**
     * Updates the states of the mainmenu buttons
     *
     * @method updateMainmenu
     * @private
     * @chainable
     */
    updateMainmenu() {
        var player = this.getPlayer(),
            hasPlayer = player ? true : false;

        this.mainmenu.toggleButton('edit', hasPlayer);
        this.mainmenu.toggleButton('save', hasPlayer);
        this.mainmenu.toggleButton('clone', hasPlayer);
        this.mainmenu.toggleButton('publish', hasPlayer);
        this.mainmenu.toggleButton('delete', hasPlayer);
        this.mainmenu.toggleButton('share', hasPlayer && player.getData('published'));
        this.mainmenu.toggleButton('download', hasPlayer);

        this.mainmenu.toggleButton('undo', this.history.hasUndo());
        this.mainmenu.toggleButton('redo', this.history.hasRedo());
        this.mainmenu.toggleButton('revert', this.isDirty());

        return this;
    };

    /**
     * Updates the selector of the block panel
     *
     * @method updateBlockSelector
     * @private
     * @chainable
     */
    updateBlockSelector() {
        var panel = this.panels.block,
            toolbar = panel.getToolbar(),
            selector = toolbar.getSelector(),
            block, label;

        selector
            .clear()
            .addOption(null, '');

        this.getPlayer().getComponents('.media.video, .controller, .block, .block-toggler').each(function(index, dom){
            if(dom._metaScore){
                block = dom._metaScore;                
                selector.addOption(block.getId(), panel.getSelectorLabel(block));
            }
        }, this);

        block = panel.getComponent();
        selector.setValue(block ? block.getId() : null, true);

        return this;
    };

    /**
     * Updates the selector of the page panel
     *
     * @method updatePageSelector
     * @private
     * @chainable
     */
    updatePageSelector() {
        var block = this.panels.block.getComponent(),
            page = this.panels.page.getComponent(),
            toolbar = this.panels.page.getToolbar(),
            selector = toolbar.getSelector();

        selector.clear();

        if(block && block.instanceOf('Block')){
            _Array.each(block.getPages(), function(index, page){
                selector.addOption(page.getId(), index+1);
            });
        }

        selector.setValue(page ? page.getId() : null, true);

        return this;
    };

    /**
     * Updates the selector of the element panel
     *
     * @method updateElementSelector
     * @private
     * @chainable
     */
    updateElementSelector() {
        var panel = this.panels.element,
            block = this.panels.block.getComponent(),
            page = this.panels.page.getComponent(),
            toolbar = panel.getToolbar(),
            selector = toolbar.getSelector(),
            element, rindex, optgroups = {};

        // clear the selector
        selector.clear();

        // fill the list of optgroups
        if(page.instanceOf('Page')){
            _Array.each(page.getElements(), function(index, element){
                rindex = element.getProperty('r-index') || 0;

                if(!(rindex in optgroups)){
                    optgroups[rindex] = [];
                }

                optgroups[rindex].push(element);
            }, this);
        }

        // create the optgroups and their options
        _Array.each(Object.keys(optgroups).sort(_Array.naturalSortInsensitive), function(index, rindex){
            var options = optgroups[rindex],
                optgroup;

            // sort options by element names
            options.sort(function(a, b){
                return _Array.naturalSortInsensitive(a.getName(), b.getName());
            });

            // create the optgroup
            optgroup = selector.addGroup(Locale.t('editor.elementSelectorGroupLabel', 'Reading index !rindex', {'!rindex': rindex})).attr('data-r-index', rindex);

            // create the options
            _Array.each(options, function(index, element){
                selector.addOption(element.getId(), panel.getSelectorLabel(element), optgroup);
            }, this);
        }, this);

        element = panel.getComponent();

        selector.setValue(element ? element.getId() : null, true);

        return this;
    };

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
    };

    /**
     * Check whether the guide is dirty
     *
     * @method isDirty
     * @return {Boolean} Whether the guide is dirty
     */
    isDirty() {
        return this.dirty;
    };

    /**
     * Get the player instance if any
     *
     * @method getPlayer
     * @return {Player} The player instance
     */
    getPlayer() {
        return this.player;
    };

    /**
     * Loads a player by guide id and vid
     *
     * @method loadPlayer
     * @param {String} id The guide's id
     * @param {Integer} vid The guide's revision id
     * @chainable
     */
    loadPlayer(id, vid){
        var url = this.configs.player_url + id +"?autoload=false&keyboard=1";

        if(vid){
            url += "&vid="+ vid;
        }

        this.loadmask = new LoadMask({
            'parent': this,
            'autoShow': true
        });
        
        this.unloadPlayer();
        
        this.player_frame = new Dom('<iframe/>', {'src': url, 'class': 'player-frame'}).appendTo(this.workspace)
            .addListener('load', _Function.proxy(this.onPlayerFrameLoadSuccess, this))
            .addListener('error', _Function.proxy(this.onPlayerFrameLoadError, this));

        return this;
    };

    /**
     * Unload the player
     *
     * @method unloadPlayer
     * @chainable
     */
    unloadPlayer() {
        delete this.player;
        
        this.player_contextmenu.disable();
        
        if(this.player_frame){
            this.player_frame.remove();                
            delete this.player_frame;
        }
        
        this.panels.block.unsetComponent();
        this.history.clear();
        this.setDirty(false)
            .updateMainmenu();

        return this;
    };
    
    /**
     * Add a component to the player
     *
     * @method addPlayerComponent
     * @private
     * @param {String} type The component's type
     * @param {Object} configs Configs to pass to the component
     * @param {Mixed} parent The component's parent
     * @chainable 
     */
    addPlayerComponent(type, configs, parent){
        var panel, component,
            page_configs,
            index, previous_page, start_time, end_time;
        
        switch(type){
            case 'element':
                panel = this.panels.element;
                component = parent.addElement(_Object.extend({'name': Locale.t('editor.onElementPanelToolbarClick.defaultElementName', 'untitled')}, configs));

                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        component.remove();
                    },
                    'redo': function(){
                        parent.addElement(component);
                        panel.setComponent(component);
                    }
                });
                break;
                
            case 'page':
                panel = this.panels.page;
                
                if(parent.getProperty('synched')){
                    index = parent.getActivePageIndex();
                    previous_page = parent.getPage(index);

                    start_time = this.getPlayer().getMedia().getTime();
                    end_time = previous_page.getProperty('end-time');

                    configs['start-time'] = start_time;
                    configs['end-time'] = end_time;
                }

                component = parent.addPage(configs, index+1);
                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        parent.removePage(component);
                        parent.setActivePage(index);
                    },
                    'redo': function(){
                        parent.addPage(component, index+1);
                        panel.setComponent(component);
                    }
                });
                break;
                
            case 'block':
                panel = this.panels.block;
                component = parent.addBlock(_Object.extend({'name': Locale.t('editor.onBlockPanelToolbarClick.defaultBlockName', 'untitled')}, configs));

                page_configs = {};

                if(component.getProperty('synched')){
                    page_configs['start-time'] = 0;
                    page_configs['end-time'] = parent.getMedia().getDuration();
                }

                component.addPage(page_configs);

                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        component.remove();
                    },
                    'redo': function(){
                        parent.addBlock(component);
                        panel.setComponent(component);
                    }
                });
                break;
                
            case 'block-toggler':
                panel = this.panels.block;
                component = parent.addBlockToggler(_Object.extend({'name': Locale.t('editor.onBlockPanelToolbarClick.defaultBlockTogglerName', 'untitled')}, configs));

                panel.setComponent(component);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        component.remove();
                    },
                    'redo': function(){
                        parent.addBlockToggler(component);
                        panel.setComponent(component);
                    }
                });
                break;
        }
        
        this.player_frame.focus();
        
        return this;
    };
    
    /**
     * Remove a component from the player
     *
     * @method deletePlayerComponent
     * @private
     * @param {player.Component} component The component
     * @chainable 
     */
    deletePlayerComponent(component, confirm){
        var editor = this,
            player = this.getPlayer(),
            panel, block, page,
            index, configs, auto_page,
            type, alert_msg;
            
        if(component.instanceOf('Block') || component.instanceOf('BlockToggler')){
            type = 'block';
        }
        else if(component.instanceOf('Page')){
            type = 'page';
        }
        else if(component.instanceOf('Element')){
            type = 'element';
        }
            
        if(type && (confirm === true)){
            switch(type){
                case 'block':
                    alert_msg = Locale.t('editor.deletePlayerComponent.block.msg', 'Are you sure you want to delete the block <em>@name</em>?', {'@name': component.getName()});
                    break;
                    
                case 'page':
                    block = component.getBlock();
                    alert_msg = Locale.t('editor.deletePlayerComponent.page.msg', 'Are you sure you want to delete page @index of <em>@block</em>?', {'@index': block.getPageIndex(component) + 1, '@block': block.getName()});
                    break;
                    
                case 'element':
                    alert_msg = Locale.t('editor.deletePlayerComponent.element.msg', 'Are you sure you want to delete the element <em>@name</em>?', {'@name': component.getName()});
                    break;
            }
            
            new Alert({
                'parent': this,
                'text': alert_msg,
                'buttons': {
                    'confirm': Locale.t('editor.deletePlayerComponent.yes', 'Yes'),
                    'cancel': Locale.t('editor.deletePlayerComponent.no', 'No')
                },
                'autoShow': true
            })
            .addClass('delete-player-component')
            .addListener('buttonclick', function(evt){
                if(evt.detail.action === 'confirm'){
                    editor.deletePlayerComponent(component, false);
                }
            });
        }
        else{
            switch(type){
                case 'block':
                    panel = this.panels.block;
                    
                    if(panel.getComponent() === component){
                        panel.unsetComponent();
                    }
                    
                    component.remove();
         
                    this.history.add({
                        'undo': function(){
                            if(component.instanceOf('BlockToggler')){
                                player.addBlockToggler(component);
                            }
                            else{
                                player.addBlock(component);
                            }
                            panel.setComponent(component);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            component.remove();
                        }
                    });

                    if(!component.instanceOf('BlockToggler')){
                        player.updateBlockTogglers();
                    }
                    break;
                    
                case 'page':
                    panel = this.panels.page;
                    block = component.getBlock();
                    index = block.getActivePageIndex();

                    panel.unsetComponent();
                    block.removePage(component);

                    if(block.getPageCount() < 1){
                        configs = {};

                        if(block.getProperty('synched')){
                            configs['start-time'] = 0;
                            configs['end-time'] = player.getMedia().getDuration();
                        }

                        auto_page = block.addPage(configs);
                        panel.setComponent(auto_page);
                    }

                    block.setActivePage(Math.max(0, index-1));

                    this.history.add({
                        'undo': function(){
                            if(auto_page){
                                block.removePage(auto_page, true);
                            }

                            block.addPage(component, index);
                            panel.setComponent(component);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            block.removePage(component, true);

                            if(auto_page){
                                block.addPage(auto_page);
                                panel.setComponent(auto_page);
                            }

                            block.setActivePage(index-1);
                        }
                    });
                    break;
                
                case 'element':
                    panel = this.panels.element;
                    page = component.getPage();
                
                    if(panel.getComponent() === component){
                        panel.unsetComponent();
                    }
                    
                    component.remove();
         
                    this.history.add({
                        'undo': function(){
                            page.addElement(component);
                            panel.setComponent(component);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            component.remove();
                        }
                    });
                    break;
            }
        
            this.player_frame.focus();
        }
        
        return this;
    };

    /**
     * Opens the guide selector
     *
     * @method openGuideSelector
     * @chainable
     */
    openGuideSelector() {
        new GuideSelector({
                'url': this.configs.api_url +'guide.json',
                'autoShow': true
            })
            .addListener('submit', _Function.proxy(this.onGuideSelectorSubmit, this));

        return this;
    };

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
        var data = new FormData(),
            options;

        // append values from the details overlay
        _Object.each(details, function(key, value){
            if(key === 'thumbnail' || key === 'media'){
                data.append('files['+ key +']', value.object);
            }
            else{
                data.append(key, value);
            }
        });

        // prepare the Ajax options object
        options = _Object.extend({
            'data': data,
            'dataType': 'json',
            'success': _Function.proxy(this.onGuideCreateSuccess, this, [overlay]),
            'error': _Function.proxy(this.onXHRError, this)
        }, this.configs.ajax);

        // add a loading mask
        this.loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.createGuide.LoadMask.text', 'Saving...'),
            'autoShow': true
        });

        Ajax.post(this.configs.api_url +'guide.json', options);

        return this;
    };

    /**
     * Saves the loaded guide
     *
     * @method saveGuide
     * @param {String} action The action to perform when saving ('update' or 'clone')
     * @param {Boolean} publish Whether to published the new revision
     * @chainable
     */
    saveGuide(action, publish){
        var player = this.getPlayer(),
            id = player.getId(),
            vid = player.getRevision(),
            components = player.getComponents('.media, .controller, .block, .block-toggler'),
            data = new FormData(),
            details = this.detailsOverlay.getValues(),
            blocks = [],
            component, options;

        // append the publish flag if true
        if(publish === true){
            data.append('publish', true);
        }

        // append values from the details overlay
        _Object.each(details, function(key, value){
            if(key === 'thumbnail' || key === 'media'){
                data.append('files['+ key +']', value.object);
            }
            else if(_Var.is(value, 'array')){
                _Array.each(value, function(index, val){
                    data.append(key +'[]', val);
                });
            }
            else{
                data.append(key, value);
            }
        });

        // append blocks data
        components.each(function(index, dom){
            component = dom._metaScore;

            if(component.instanceOf('Media')){
                data.append('blocks[]', JSON.stringify(_Object.extend({'type': 'media'}, component.getProperties())));
            }
            else if(component.instanceOf('Controller')){
                data.append('blocks[]', JSON.stringify(_Object.extend({'type': 'controller'}, component.getProperties())));
            }
            else if(component.instanceOf('BlockToggler')){
                data.append('blocks[]', JSON.stringify(_Object.extend({'type': 'block-toggler'}, component.getProperties())));
            }
            else if(component.instanceOf('Block')){
                data.append('blocks[]', JSON.stringify(_Object.extend({'type': 'block'}, component.getProperties())));
            }
        }, this);

        // prepare the Ajax options object
        options = _Object.extend({
            'data': data,
            'dataType': 'json',
            'success': _Function.proxy(this.onGuideSaveSuccess, this),
            'error': _Function.proxy(this.onXHRError, this)
        }, this.configs.ajax);

        // add a loading mask
        this.loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.saveGuide.LoadMask.text', 'Saving...'),
            'autoShow': true
        });

        Ajax.post(this.configs.api_url +'guide/'+ id +'/'+ action +'.json?vid='+ vid, options);

        return this;
    };

    /**
     * Get a media file's duration in centiseconds
     *
     * @method getMediaFileDuration
     * @private
     * @param {String} url The file's url
     * @param {Function} callback A callback function to call with the duration
     */
    getMediaFileDuration(url, callback){
        var media = new Dom('<audio/>', {'src': url})
            .addListener('loadedmetadata', function(evt){
                var duration = Math.round(parseFloat(media.get(0).duration) * 100);

                callback(duration);
            });
    };
    
}