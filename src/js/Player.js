import {Dom} from './core/Dom';
import {Locale} from './core/Locale';
import {Ajax} from './core/Ajax';
import {_Function} from './core/utils/Function';
import {_Object} from './core/utils/Object';
import {_Array} from './core/utils/Array';
import {CuePoint} from './CuePoint';
import {ContextMenu} from './core/ui/ContextMenu';
import {Alert} from './core/ui/overlay/Alert';
import {StyleSheet} from './core/StyleSheet';
import {Media} from './player/component/Media';
import {Controller} from './player/component/Controller';
import {Block} from './player/component/Block';

/**
 * Fired when the guide's loading finished successfully
 *
 * @event load
 * @param {Object} player The player instance
 * @param {Object} data The json data loaded
 */
var EVT_LOAD = 'load';

/**
     * Fired when the guide's loading failed
     *
     * @event loaderror
     * @param {Object} player The player instance
     */
var EVT_ERROR = 'error';

/**
     * Fired when the id is set
     *
     * @event idset
     * @param {Object} player The player instance
     * @param {String} id The guide's id
     */
var EVT_IDSET = 'idset';

/**
     * Fired when the vid is set
     *
     * @event revisionset
     * @param {Object} player The player instance
     * @param {Integer} vid The guide's vid
     */
var EVT_REVISIONSET = 'revisionset';

/**
     * Fired when the media is added
     *
     * @event mediaadd
     * @param {Object} player The player instance
     * @param {Object} media The media instance
     */
var EVT_MEDIAADD = 'mediaadd';

/**
     * Fired when the controller is added
     *
     * @event controlleradd
     * @param {Object} player The player instance
     * @param {Object} controller The controller instance
     */
var EVT_CONTROLLERADD = 'controlleradd';

/**
     * Fired when a block toggler is added
     *
     * @event blocktoggleradd
     * @param {Object} player The player instance
     * @param {Object} blocktoggler The blocktoggler instance
     */
var EVT_BLOCKTOGGLERADD = 'blocktoggleradd';

/**
     * Fired when a block is added
     *
     * @event blockadd
     * @param {Object} player The player instance
     * @param {Object} block The block instance
     */
var EVT_BLOCKADD = 'blockadd';

/**
     * Fired when the reading index is set
     *
     * @event rindex
     * @param {Object} player The player instance
     * @param {Object} value The reading index value
     */
var EVT_RINDEX = 'rindex';

export default class Player extends Dom {

    /**
     * Provides the main Player class
     *
     * @class Player
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.url=''] The URL of the guide's JSON data to load
     * @param {Mixed} [configs.container='body'] The HTMLElement, Dom instance, or CSS selector to which the player should be appended
     * @param {Object} [configs.ajax={}] Custom options to send with each AJAX request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     * @param {Boolean} [configs.keyboard=false] Whether to activate keyboard shortcuts or not
     * @param {Boolean} [configs.api=false] Whether to allow API access or not
     * @param {Boolean} [configs.autoload=true] Whether to automatically call the load function
     */
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super('<div></div>', {'class': 'metaScore-player'});
        
        this.loaded = false;

        if(this.configs.api){
            Dom.addListener(window, 'message', _Function.proxy(this.onAPIMessage, this));
        }
        
        this.contextmenu = new ContextMenu({'target': this, 'items': {
                'about': {
                    'text': Locale.t('player.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': metaScore.getVersion(), '!revision': metaScore.getRevision()})
                },
                'logo': {
                    'class': 'logo'
                }
            }})
            .appendTo(this);

        this.appendTo(this.configs.container);

        if(this.configs.autoload !== false){
            this.load();
        }
    }

    Player.defaults = {
        'url': '',
        'container': 'body',
        'ajax': {},
        'keyboard': false,
        'api': false,
        'autoload': true
    };

    /**
     * Keydown event callback
     *
     * @method onKeydown
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onKeydown(evt){
        switch(evt.keyCode){
            case 32: //space-bar
                this.togglePlay();
                evt.preventDefault();
                break;

            case 37: //left
                this.find('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
                evt.preventDefault();
                break;

            case 39: //right
                this.find('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
                evt.preventDefault();
                break;
        }
    };

    /**
     * API message event callback
     *
     * @method onAPIMessage
     * @private
     * @param {MessageEvent} evt The event object
     */
    onAPIMessage(evt){
        var player = this,
            data,
            source, origin, method, params,
            dom;

        try {
            data = JSON.parse(evt.data);
        }
        catch(e){
            return false;
        }

        if (!('method' in data)) {
            return false;
        }

        source = evt.source;
        origin = evt.origin;
        method = data.method;
        params = 'params' in data ? data.params : null;

        switch(method){
            case 'play':
                player.play(params.inTime, params.outTime, params.rIndex);
                break;

            case 'pause':
                player.getMedia().pause();
                break;

            case 'seek':
                player.getMedia().setTime(parseFloat(params.seconds, 10) * 100);
                break;

            case 'page':
                dom = player.getComponent('.block[data-name="'+ params.block +'"]');
                if(dom && dom._metaScore){
                    dom._metaScore.setActivePage(params.index);
                }
                break;

            case 'showBlock':
            case 'hideBlock':
            case 'toggleBlock':
                var show;

                switch(method){
                    case 'showBlock':
                        show = true;
                        break;
                    case 'hideBlock':
                        show = false;
                        break;
                }

                player.getComponents('.media.video, .controller, .block').each(function(index, dom){                    
                    if(dom._metaScore && dom._metaScore.getName() === params.name){
                        dom._metaScore.toggleVisibility(show);
                    }
                });
                break;

            case 'rindex':
                player.setReadingIndex(!isNaN(params.index) ? params.index : 0);
                break;

            case 'playing':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': player.getMedia().isPlaying()
                }), origin);
                break;

            case 'time':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': player.getMedia().getTime() / 100
                }), origin);
                break;

            case 'addEventListener':
                switch(params.type){
                    case 'ready':
                        if(player.loaded){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback
                            }), origin);
                        }
                        else{
                            player.addListener('load', function(event){
                                source.postMessage(JSON.stringify({
                                    'callback': params.callback
                                }), origin);
                            });
                        }
                        break;

                    case 'timeupdate':
                        player.addListener(params.type, function(event){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback,
                                'params': event.detail.media.getTime() / 100
                            }), origin);
                        });
                        break;

                    case 'rindex':
                        player.addListener(params.type, function(event){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback,
                                'params': event.detail.value
                            }), origin);
                        });
                        break;
                }
                break;

            case 'removeEventListener':
                break;
        }
    };

    /**
     * Controller button click event callback
     *
     * @method onControllerButtonClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onControllerButtonClick(evt){
        var action = Dom.data(evt.target, 'action');

        switch(action){
            case 'rewind':
                this.getMedia().reset();
                break;

            case 'play':
                this.togglePlay();
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Media loadedmetadata event callback
     *
     * @method onMediaLoadedMetadata
     * @private
     * @param {Event} evt The event object
     */
    onMediaLoadedMetadata(evt){
        this.getMedia().reset();
    };

    /**
     * Media waiting event callback
     *
     * @method onMediaWaiting
     * @private
     * @param {Event} evt The event object
     */
    onMediaWaiting(evt){
        this.addClass('media-waiting');
    };

    /**
     * Media seeking event callback
     *
     * @method onMediaSeeking
     * @private
     * @param {Event} evt The event object
     */
    onMediaSeeking(evt){
        this.addClass('media-waiting');
    };

    /**
     * Media seeked event callback
     *
     * @method onMediaSeeked
     * @private
     * @param {Event} evt The event object
     */
    onMediaSeeked(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media playing event callback
     *
     * @method onMediaPlaying
     * @private
     * @param {Event} evt The event object
     */
    onMediaPlaying(evt){
        this.removeClass('media-waiting');
        
        this.controller.addClass('playing');
    };

    /**
     * Media play event callback
     *
     * @method onMediaPlay
     * @private
     * @param {Event} evt The event object
     */
    onMediaPlay(evt){
        this.removeClass('media-waiting');
        
        this.controller.addClass('playing');
    };

    /**
     * Media pause event callback
     *
     * @method onMediaPause
     * @private
     * @param {Event} evt The event object
     */
    onMediaPause(evt){
        this.removeClass('media-waiting');
        
        this.controller.removeClass('playing');
    };

    /**
     * Media timeupdate event callback
     *
     * @method onMediaTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    onMediaTimeUpdate(evt){
        var currentTime = evt.detail.media.getTime();

        this.controller.updateTime(currentTime);
    };

    /**
     * Media suspend event callback
     *
     * @method onMediaSuspend
     * @private
     * @param {Event} evt The event object
     */
    onMediaSuspend(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media suspend event callback
     *
     * @method onMediaStalled
     * @private
     * @param {Event} evt The event object
     */
    onMediaStalled(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media error event callback
     *
     * @method onMediaError
     * @private
     * @param {Event} evt The event object
     */
    onMediaError(evt){
        var error = evt.target.error,
            text;
        
        this.removeClass('media-waiting');
        
        switch(error.code) {
            case error.MEDIA_ERR_ABORTED:
                text = Locale.t('player.onMediaError.Aborted.msg', 'You aborted the media playback.');
                break;
                
            case error.MEDIA_ERR_NETWORK:
                text = Locale.t('player.onMediaError.Network.msg', 'A network error caused the media download to fail.');
                break;
                
            case error.MEDIA_ERR_DECODE:
                text = Locale.t('player.onMediaError.Decode.msg', 'The media playback was aborted due to a format problem.');
                break;
                
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                text = Locale.t('player.onMediaError.NotSupported.msg', 'The media could not be loaded, either because the server or network failed or because the format is not supported.');
                break;
                
            default:
                text = Locale.t('player.onMediaError.Default.msg', 'An unknown error occurred.');
                break;
        }
        
        new Alert({
            'parent': this,
            'text': text,
            'buttons': {
                'ok': Locale.t('editor.onMediaError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Block pageactivate event callback
     *
     * @method onPageActivate
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPageActivate(evt){
        var block = evt.target._metaScore,
            page = evt.detail.page,
            basis = evt.detail.basis;

        if(block.getProperty('synched') && (basis !== 'pagecuepoint')){
            this.getMedia().setTime(page.getProperty('start-time'));
        }
    };

    /**
     * Element of type Cursor time event callback
     *
     * @method onCursorElementTime
     * @private
     * @param {CustomEvent} evt The event object
     */
    onCursorElementTime(evt){            
        if(!this.hasClass('editing') || evt.detail.element.hasClass('selected')){
            this.getMedia().setTime(evt.detail.value);
        }
    };

    /**
     * Element of type Text play event callback
     *
     * @method onTextElementPlay
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementPlay(evt){
        this.play(evt.detail.inTime, evt.detail.outTime, evt.detail.rIndex);
    };

    /**
     * Element of type Text page event callback
     *
     * @method onTextElementPage
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementPage(evt){
        var dom = this.getComponent('.block[data-name="'+ evt.detail.block +'"]');
        if(dom && dom._metaScore){
            dom._metaScore.setActivePage(evt.detail.index);
        }
    };

    /**
     * Element of type Text block_visibility event callback
     *
     * @method onTextElementBlockVisibility
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementBlockVisibility(evt){
        var show;

        switch(evt.detail.action){
            case 'show':
                show = true;
                break;
            case 'hide':
                show = false;
                break;
        }
        
        this.getComponents('.media.video, .controller, .block').each(function(index, dom){                    
            if(dom._metaScore && dom._metaScore.getName() === evt.detail.block){
                dom._metaScore.toggleVisibility(show);
            }
        });
    };

    /**
     * Componenet propchange event callback
     *
     * @method onComponenetPropChange
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponenetPropChange(evt){
        var component = evt.detail.component,
            cuepoint;

        switch(evt.detail.property){
            case 'start-time':
            case 'end-time':
                component.setCuePoint({
                    'media': this.getMedia()
                });
                break;
                
            case 'direction':
            case 'acceleration':
                cuepoint = component.getCuePoint();
                if(cuepoint){
                    cuepoint.update();
                }
                break;
        }
    };

    /**
     * loadsuccess event callback
     *
     * @method onLoadSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    onLoadSuccess(xhr){
        this.json = JSON.parse(xhr.response);

        this.setId(this.json.id)
            .setRevision(this.json.vid);

        this.css = new StyleSheet()
            .setInternalValue(this.json.css)
            .appendTo(document.head);

        this.rindex_css = new StyleSheet()
            .appendTo(document.head);

        _Array.each(this.json.blocks, function(index, block){
            switch(block.type){
                case 'media':
                    this.media = this.addMedia(_Object.extend({}, block, {'type': this.json.type}))
                        .setSources([this.json.media]);
                    break;

                case 'controller':
                    this.controller = this.addController(block);
                    break;

                case 'block-toggler':
                    this.addBlockToggler(block);
                    break;

                default:
                    this.addBlock(block);
            }
        }, this);

        this.updateBlockTogglers();

        if(this.configs.keyboard){
            new Dom('body').addListener('keydown', _Function.proxy(this.onKeydown, this));
        }

        this.removeClass('loading');
        
        this.loaded = true;

        this.triggerEvent(EVT_LOAD, {'player': this, 'data': this.json}, true, false);
    };

    /**
     * loaderror event callback
     *
     * @method onLoadError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    onLoadError(xhr){
        this.removeClass('loading');

        this.triggerEvent(EVT_ERROR, {'player': this}, true, false);
    };

    /**
     * Load the guide
     *
     * @method load
     * @private
     */
    load() {
        var options;

        this.addClass('loading');

        options = _Object.extend({}, {
            'success': _Function.proxy(this.onLoadSuccess, this),
            'error': _Function.proxy(this.onLoadError, this)
        }, this.configs.ajax);


        Ajax.get(this.configs.url, options);
    };

    /**
     * Get the id of the loaded guide
     *
     * @method getId
     * @return {String} The id
     */
    getId() {
        return this.data('id');
    };

    /**
     * Set the id of the loaded guide in a data attribute
     *
     * @method setId
     * @param {String} id The id
     * @param {Boolean} [supressEvent=false] Whether to supress the idset event
     * @chainable
     */
    setId(id, supressEvent){
        this.data('id', id);

        if(supressEvent !== true){
            this.triggerEvent(EVT_IDSET, {'player': this, 'id': id}, true, false);
        }

        return this;
    };

    /**
     * Get the revision id of the loaded guide
     *
     * @method getRevision
     * @return {String} The revision id
     */
    getRevision() {
        return this.data('vid');
    };

    /**
     * Set the revision id of the loaded guide in a data attribute
     *
     * @method setRevision
     * @param {String} id The id
     * @param {Boolean} [supressEvent=false] Whether to supress the revisionset event
     * @chainable
     */
    setRevision(vid, supressEvent){
        this.data('vid', vid);

        if(supressEvent !== true){
            this.triggerEvent(EVT_REVISIONSET, {'player': this, 'vid': vid}, true, false);
        }

        return this;
    };

    /**
     * Get the loaded JSON data
     *
     * @method getData
     * @param {String} [key] An optional data key
     * @return {Object} The value corresponding to the key, or the entire JSON data
     */
    getData(key){
        if(key){
            return this.json[key];
        }
        
        return this.json;
    };

    /**
     * Get the media instance
     *
     * @method getMedia
     * @return {Media} The media instance
     */
    getMedia() {
        return this.media;
    };

    /**
     * Update the loaded JSON data
     *
     * @method updateData
     * @param {Object} data The data key, value pairs to update
     * @param {Boolean} [skipInternalUpdates=false] Whether to skip internal update methods for CSS, media sources, etc
     * @chainable
     */
    updateData(data, skipInternalUpdates){
        _Object.extend(this.json, data);

        if(skipInternalUpdates !== true){
            if('css' in data){
                this.updateCSS(data.css);
            }

            if('media' in data){
                this.getMedia().setSources([data.media]);
            }

            if('vid' in data){
                this.setRevision(data.vid);
            }
        }
        
        return this;
    };

    /**
     * Get a component by CSS selector
     *
     * @method getComponent
     * @param {String} selector The CSS selector
     * @return {Component} The component
     */
    getComponent(selector){
        return this.getComponents(selector).get(0);
    };

    /**
     * Get components by CSS selector
     *
     * @method getComponents
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom instance containing the selected components
     */
    getComponents(selector){
        var components;

        components = this.find('.metaScore-component');

        if(selector){
            components = components.filter(selector);
        }

        return components;
    };

    /**
     * Create and add a Media instance
     *
     * @method addMedia
     * @param {Object} configs The configurations to send to the Media class
     * @param {Boolean} [supressEvent=false] Whether to supress the mediadd event or not
     * @return {Media} The Media instance
     */
    addMedia(configs, supressEvent){
        var media = new Media(configs)
            .addListener('loadedmetadata', _Function.proxy(this.onMediaLoadedMetadata, this))
            .addListener('waiting', _Function.proxy(this.onMediaWaiting, this))
            .addListener('seeking', _Function.proxy(this.onMediaSeeking, this))
            .addListener('seeked', _Function.proxy(this.onMediaSeeked, this))
            .addListener('playing', _Function.proxy(this.onMediaPlaying, this))
            .addListener('play', _Function.proxy(this.onMediaPlay, this))
            .addListener('pause', _Function.proxy(this.onMediaPause, this))
            .addListener('timeupdate', _Function.proxy(this.onMediaTimeUpdate, this))
            .addListener('suspend', _Function.proxy(this.onMediaSuspend, this))
            .addListener('stalled', _Function.proxy(this.onMediaStalled, this))
            .addListener('error', _Function.proxy(this.onMediaError, this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_MEDIAADD, {'player': this, 'media': media}, true, false);
        }

        return media;
    };

    /**
     * Create and add a Controller instance
     *
     * @method addController
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {Controller} The Controller instance
     */
    addController(configs, supressEvent){
        var controller = new Controller(configs)
            .addDelegate('.buttons button', 'click', _Function.proxy(this.onControllerButtonClick, this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_CONTROLLERADD, {'player': this, 'controller': controller}, true, false);
        }

        return controller;
    };

    /**
     * Create and add a Block Toggler instance
     *
     * @method addBlockToggler
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {BlockToggler} The Block Toggler instance
     */
    addBlockToggler(configs, supressEvent){
        var toggler = new BlockToggler(configs)
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_BLOCKTOGGLERADD, {'player': this, 'blocktoggler': toggler}, true, false);
        }

        return toggler;
    };

    /**
     * Create and add a Block instance
     *
     * @method addBlock
     * @param {Object} configs The configurations to send to the Block class
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @return {Block} The Block instance
     */
    addBlock(configs, supressEvent){
        var block, page;

        if(configs instanceof Block){
            block = configs;
            block.appendTo(this);
        }
        else{
            block = new Block(_Object.extend({}, configs, {
                    'container': this,
                    'listeners': {
                        'propchange': _Function.proxy(this.onComponenetPropChange, this)
                    }
                }))
                .addListener('pageactivate', _Function.proxy(this.onPageActivate, this))
                .addDelegate('.element[data-type="Cursor"]', 'time', _Function.proxy(this.onCursorElementTime, this))
                .addDelegate('.element[data-type="Text"]', 'play', _Function.proxy(this.onTextElementPlay, this))
                .addDelegate('.element[data-type="Text"]', 'page', _Function.proxy(this.onTextElementPage, this))
                .addDelegate('.element[data-type="Text"]', 'block_visibility', _Function.proxy(this.onTextElementBlockVisibility, this));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_BLOCKADD, {'player': this, 'block': block}, true, false);
        }

        return block;
    };

    /**
     * Update the custom CSS
     *
     * @method updateCSS
     * @param {String} value The custom CSS value
     * @chainable
     */
    updateCSS(value){
        this.css.setInternalValue(value);

        return this;
    };

    /**
     * Toggles the media playing state
     *
     * @method togglePlay
     * @chainable
     */
    togglePlay() {
        var media = this.getMedia();

        if(media.isPlaying()){
            media.pause();
        }
        else{
            media.play();
        }

        return this;
    };

    /**
     * Start playing the media at the current position, or plays a specific extract
     *
     * @method play
     * @param {String} [inTime] The time at which the media should start playing
     * @param {String} [outTime] The time at which the media should stop playing
     * @param {String} [rIndex] A reading index to go to while playing
     * @chainable
     */
    play(inTime, outTime, rIndex){
        var player = this,
            media = this.getMedia();

        if(this.cuepoint){
            this.cuepoint.destroy();
        }

        inTime = parseFloat(inTime);
        outTime = parseFloat(outTime);
        rIndex = parseInt(rIndex);

        if(isNaN(inTime)){
            media.play();
        }
        else{
            this.cuepoint = new CuePoint({
                'media': media,
                'inTime': inTime,
                'outTime': !isNaN(outTime) ? outTime : null,
                'considerError': true
            })
            .addListener('start', function(evt){
                player.setReadingIndex(!isNaN(rIndex) ? rIndex : 0);
            })
            .addListener('seekout', function(evt){
                evt.target.destroy();
                delete player.cuepoint;

                player.setReadingIndex(0);
            })
            .addListener('stop', function(evt){
                evt.target.getMedia().pause();
            })
            .init();

            media.setTime(inTime).play();
        }

        return this;
    };

    /**
     * Set the current reading index
     *
     * @method setReadingIndex
     * @param {Integer} index The reading index
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @chainable
     */
    setReadingIndex(index, supressEvent){
        this.rindex_css.removeRules();

        if(index !== 0){
            this.rindex_css
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]', 'display: block;')
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]), .metaScore-component.element[data-r-index="'+ index +'"].active', 'pointer-events: auto;')
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]) .contents, .metaScore-component.element[data-r-index="'+ index +'"].active .contents', 'display: block;')
                .addRule('.in-editor.editing.show-contents .metaScore-component.element[data-r-index="'+ index +'"] .contents', 'display: block;');

            this.data('r-index', index);
        }
        else{
            this.data('r-index', null);
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_RINDEX, {'player': this, 'value': index}, true, false);
        }

        return this;
    };

    updateBlockTogglers() {
        var block_togglers = this.getComponents('.block-toggler'),
            blocks = this.getComponents('.block, .media.video, .controller');

        block_togglers.each(function(index, dom){
            dom._metaScore.update(blocks);
        });
    };

}