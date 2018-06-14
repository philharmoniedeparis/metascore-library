import Dom from './core/Dom';
import Locale from './core/Locale';
import Ajax from './core/Ajax';
import ContextMenu from './core/ui/ContextMenu';
import Alert from './core/ui/overlay/Alert';
import StyleSheet from './core/StyleSheet';
import CuePoint from './player/CuePoint';
import Media from './player/component/Media';
import Controller from './player/component/Controller';
import BlockToggler from './player/component/BlockToggler';
import Block from './player/component/Block';

import '../css/metaScore.player.less';

/**
 * Fired when the player finished initializing
 *
 * @event ready
 * @param {Object} player The player instance
 */
const EVT_READY = 'ready';

/**
 * Fired when the guide's loading finished successfully
 *
 * @event load
 * @param {Object} player The player instance
 * @param {Object} data The json data loaded
 */
const EVT_LOAD = 'load';

/**
 * Fired when the guide's loading failed
 *
 * @event loaderror
 * @param {Object} player The player instance
 */
const EVT_ERROR = 'error';

/**
 * Fired when the id is set
 *
 * @event idset
 * @param {Object} player The player instance
 * @param {String} id The guide's id
 */
const EVT_IDSET = 'idset';

/**
 * Fired when the vid is set
 *
 * @event revisionset
 * @param {Object} player The player instance
 * @param {Integer} vid The guide's vid
 */
const EVT_REVISIONSET = 'revisionset';

/**
 * Fired when the media is added
 *
 * @event mediaadd
 * @param {Object} player The player instance
 * @param {Object} media The media instance
 */
const EVT_MEDIAADD = 'mediaadd';

/**
 * Fired when the controller is added
 *
 * @event controlleradd
 * @param {Object} player The player instance
 * @param {Object} controller The controller instance
 */
const EVT_CONTROLLERADD = 'controlleradd';

/**
 * Fired when a block toggler is added
 *
 * @event blocktoggleradd
 * @param {Object} player The player instance
 * @param {Object} blocktoggler The blocktoggler instance
 */
const EVT_BLOCKTOGGLERADD = 'blocktoggleradd';

/**
 * Fired when a block is added
 *
 * @event blockadd
 * @param {Object} player The player instance
 * @param {Object} block The block instance
 */
const EVT_BLOCKADD = 'blockadd';

/**
 * Fired when the reading index is set
 *
 * @event rindex
 * @param {Object} player The player instance
 * @param {Object} value The reading index value
 */
const EVT_RINDEX = 'rindex';

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
     * @param {String} [configs.locale] The locale file to load
     * @param {Boolean} [configs.autoload=true] Whether to automatically call the load function
     */
    constructor(configs) {
        // call parent constructor
        super('<div></div>', {'class': 'metaScore-player'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.loaded = false;

        if(this.configs.api){
            Dom.addListener(window, 'message', this.onAPIMessage.bind(this));
        }

        if('locale' in this.configs){
            Locale.load(this.configs.locale, this.onLocaleLoad.bind(this));
        }
        else{
            this.init();
        }
    }

    static getDefaults() {
        return {
            'url': '',
            'container': 'body',
            'ajax': {},
            'keyboard': false,
            'api': false,
            'autoload': true,
            'lang': 'en'
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
    }

    /**
     * API message event callback
     *
     * @method onAPIMessage
     * @private
     * @param {MessageEvent} evt The event object
     */
    onAPIMessage(evt){
        let data,
            source, origin,
            method, params;

        try {
            data = JSON.parse(evt.data);
        }
        catch(e){
            return;
        }

        if (!('method' in data)) {
            return;
        }

        source = evt.source;
        origin = evt.origin;
        method = data.method;
        params = 'params' in data ? data.params : null;

        switch(method){
            case 'play':
                this.play(params.inTime, params.outTime, params.rIndex);
                break;

            case 'pause':
                this.getMedia().pause();
                break;

            case 'seek':
                this.getMedia().setTime(parseFloat(params.seconds, 10) * 100);
                break;

            case 'page':
                {
                    const dom = this.getComponent(`.block[data-name="${params.block}"]`);
                    if(dom && dom._metaScore){
                        dom._metaScore.setActivePage(params.index);
                    }
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

                this.getComponents('.media.video, .controller, .block').forEach((dom) => {
                    if(dom._metaScore && dom._metaScore.getName() === params.name){
                        dom._metaScore.toggleVisibility(show);
                    }
                });
                break;

            case 'rindex':
                this.setReadingIndex(!isNaN(params.index) ? params.index : 0);
                break;

            case 'playing':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': this.getMedia().isPlaying()
                }), origin);
                break;

            case 'time':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': this.getMedia().getTime() / 100
                }), origin);
                break;

            case 'addEventListener':
                switch(params.type){
                    case 'ready':
                        if(this.loaded){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback
                            }), origin);
                        }
                        else{
                            this.addListener('load', () => {
                                source.postMessage(JSON.stringify({
                                    'callback': params.callback
                                }), origin);
                            });
                        }
                        break;

                    case 'timeupdate':
                        this.addListener(params.type, (event) => {
                            source.postMessage(JSON.stringify({
                                'callback': params.callback,
                                'params': event.detail.media.getTime() / 100
                            }), origin);
                        });
                        break;

                    case 'rindex':
                        this.addListener(params.type, (event) => {
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
    }

    /**
     * Controller button click event callback
     *
     * @method onControllerButtonClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    onControllerButtonClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'rewind':
                this.getMedia().reset();
                break;

            case 'play':
                this.togglePlay();
                break;
        }

        evt.stopPropagation();
    }

    /**
     * Media loadedmetadata event callback
     *
     * @method onMediaLoadedMetadata
     * @private
     */
    onMediaLoadedMetadata(){
        this.getMedia().reset();
    }

    /**
     * Media waiting event callback
     *
     * @method onMediaWaiting
     * @private
     */
    onMediaWaiting(){
        this.addClass('media-waiting');
    }

    /**
     * Media seeking event callback
     *
     * @method onMediaSeeking
     * @private
     */
    onMediaSeeking(){
        this.addClass('media-waiting');
    }

    /**
     * Media seeked event callback
     *
     * @method onMediaSeeked
     * @private
     */
    onMediaSeeked(){
        this.removeClass('media-waiting');
    }

    /**
     * Media playing event callback
     *
     * @method onMediaPlaying
     * @private
     */
    onMediaPlaying(){
        this.removeClass('media-waiting');

        this.controller.addClass('playing');
    }

    /**
     * Media play event callback
     *
     * @method onMediaPlay
     * @private
     */
    onMediaPlay(){
        this.removeClass('media-waiting');

        this.controller.addClass('playing');
    }

    /**
     * Media pause event callback
     *
     * @method onMediaPause
     * @private
     */
    onMediaPause(){
        this.removeClass('media-waiting');

        this.controller.removeClass('playing');
    }

    /**
     * Media timeupdate event callback
     *
     * @method onMediaTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    onMediaTimeUpdate(evt){
        const currentTime = evt.detail.media.getTime();

        this.controller.updateTime(currentTime);
    }

    /**
     * Media suspend event callback
     *
     * @method onMediaSuspend
     * @private
     */
    onMediaSuspend(){
        this.removeClass('media-waiting');
    }

    /**
     * Media suspend event callback
     *
     * @method onMediaStalled
     * @private
     */
    onMediaStalled(){
        this.removeClass('media-waiting');
    }

    /**
     * Media error event callback
     *
     * @method onMediaError
     * @private
     * @param {Event} evt The event object
     */
    onMediaError(evt){
        let error = evt.target.error,
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
    }

    /**
     * Block pageactivate event callback
     *
     * @method onPageActivate
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPageActivate(evt){
        let block = evt.target._metaScore,
            page = evt.detail.page,
            basis = evt.detail.basis;

        if(block.getProperty('synched') && (basis !== 'pagecuepoint')){
            this.getMedia().setTime(page.getProperty('start-time'));
        }
    }

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
    }

    /**
     * Element of type Text play event callback
     *
     * @method onTextElementPlay
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementPlay(evt){
        this.play(evt.detail.inTime, evt.detail.outTime, evt.detail.rIndex);
    }

    /**
     * Element of type Text page event callback
     *
     * @method onTextElementPage
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementPage(evt){
        const dom = this.getComponent(`.block[data-name="${evt.detail.block}"]`);
        if(dom && dom._metaScore){
            dom._metaScore.setActivePage(evt.detail.index);
        }
    }

    /**
     * Element of type Text block_visibility event callback
     *
     * @method onTextElementBlockVisibility
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementBlockVisibility(evt){
        let show;

        switch(evt.detail.action){
            case 'show':
                show = true;
                break;
            case 'hide':
                show = false;
                break;
        }

        this.getComponents('.media.video, .controller, .block').forEach((dom) => {
            if(dom._metaScore && dom._metaScore.getName() === evt.detail.block){
                dom._metaScore.toggleVisibility(show);
            }
        });
    }

    /**
     * Componenet propchange event callback
     *
     * @method onComponenetPropChange
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponenetPropChange(evt){
        let component = evt.detail.component,
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
    }

    /**
     * loadsuccess event callback
     *
     * @method onLoadSuccess
     * @private
     * @param {Event} evt The event object
     */
    onLoadSuccess(evt){
        this.json = JSON.parse(evt.target.getResponse());

        this.setId(this.json.id)
            .setRevision(this.json.vid);

        this.css = new StyleSheet()
            .setInternalValue(this.json.css)
            .appendTo(document.head);

        this.rindex_css = new StyleSheet()
            .appendTo(document.head);

        this.json.blocks.forEach((block) => {
            switch(block.type){
                case 'media':
                    this.media = this.addMedia(Object.assign({}, block, {'type': this.json.type}))
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
        });

        this.updateBlockTogglers();

        if(this.configs.keyboard){
            new Dom('body').addListener('keydown', this.onKeydown.bind(this));
        }

        this.removeClass('loading');

        this.loaded = true;

        this.triggerEvent(EVT_LOAD, {'player': this, 'data': this.json}, true, false);
    }

    /**
     * loaderror event callback
     *
     * @method onLoadError
     * @private
     */
    onLoadError(){
        this.removeClass('loading');

        this.triggerEvent(EVT_ERROR, {'player': this}, true, false);
    }

    init() {
        this.contextmenu = new ContextMenu({'target': this, 'items': {
                'about': {
                    'text': Locale.t('player.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': this.constructor.getVersion(), '!revision': this.constructor.getRevision()})
                },
                'logo': {
                    'class': 'logo'
                }
            }})
            .appendTo(this);

        this.appendTo(this.configs.container);

        this.triggerEvent(EVT_READY, {'player': this}, true, false);

        if(this.configs.autoload !== false){
            this.load();
        }
    }

    /**
     * Load the guide
     *
     * @method load
     * @private
     */
    load() {
        let options;

        this.addClass('loading');

        options = Object.assign({}, {
            'onSuccess': this.onLoadSuccess.bind(this),
            'onError': this.onLoadError.bind(this)
        }, this.configs.ajax);

        Ajax.GET(this.configs.url, options);
    }

    /**
     * Get the id of the loaded guide
     *
     * @method getId
     * @return {String} The id
     */
    getId() {
        return this.data('id');
    }

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
    }

    /**
     * Get the revision id of the loaded guide
     *
     * @method getRevision
     * @return {String} The revision id
     */
    getRevision() {
        return this.data('vid');
    }

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
    }

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
    }

    /**
     * Get the media instance
     *
     * @method getMedia
     * @return {Media} The media instance
     */
    getMedia() {
        return this.media;
    }

    /**
     * Update the loaded JSON data
     *
     * @method updateData
     * @param {Object} data The data key, value pairs to update
     * @param {Boolean} [skipInternalUpdates=false] Whether to skip internal update methods for CSS, media sources, etc
     * @chainable
     */
    updateData(data, skipInternalUpdates){
        Object.assign(this.json, data);

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
    }

    /**
     * Get a component by CSS selector
     *
     * @method getComponent
     * @param {String} selector The CSS selector
     * @return {Component} The component
     */
    getComponent(selector){
        return this.getComponents(selector).get(0);
    }

    /**
     * Get components by CSS selector
     *
     * @method getComponents
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom instance containing the selected components
     */
    getComponents(selector){
        let components;

        components = this.find('.metaScore-component');

        if(selector){
            components = components.filter(selector);
        }

        return components;
    }

    /**
     * Create and add a Media instance
     *
     * @method addMedia
     * @param {Object} configs The configurations to send to the Media class
     * @param {Boolean} [supressEvent=false] Whether to supress the mediadd event or not
     * @return {Media} The Media instance
     */
    addMedia(configs, supressEvent){
        const media = new Media(configs)
            .addListener('loadedmetadata', this.onMediaLoadedMetadata.bind(this))
            .addListener('waiting', this.onMediaWaiting.bind(this))
            .addListener('seeking', this.onMediaSeeking.bind(this))
            .addListener('seeked', this.onMediaSeeked.bind(this))
            .addListener('playing', this.onMediaPlaying.bind(this))
            .addListener('play', this.onMediaPlay.bind(this))
            .addListener('pause', this.onMediaPause.bind(this))
            .addListener('timeupdate', this.onMediaTimeUpdate.bind(this))
            .addListener('suspend', this.onMediaSuspend.bind(this))
            .addListener('stalled', this.onMediaStalled.bind(this))
            .addListener('error', this.onMediaError.bind(this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_MEDIAADD, {'player': this, 'media': media}, true, false);
        }

        return media;
    }

    /**
     * Create and add a Controller instance
     *
     * @method addController
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {Controller} The Controller instance
     */
    addController(configs, supressEvent){
        const controller = new Controller(configs)
            .addDelegate('.buttons button', 'click', this.onControllerButtonClick.bind(this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_CONTROLLERADD, {'player': this, 'controller': controller}, true, false);
        }

        return controller;
    }

    /**
     * Create and add a Block Toggler instance
     *
     * @method addBlockToggler
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {BlockToggler} The Block Toggler instance
     */
    addBlockToggler(configs, supressEvent){
        const toggler = new BlockToggler(configs)
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_BLOCKTOGGLERADD, {'player': this, 'blocktoggler': toggler}, true, false);
        }

        return toggler;
    }

    /**
     * Create and add a Block instance
     *
     * @method addBlock
     * @param {Object} configs The configurations to send to the Block class
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @return {Block} The Block instance
     */
    addBlock(configs, supressEvent){
        let block;

        if(configs instanceof Block){
            block = configs;
            block.appendTo(this);
        }
        else{
            block = new Block(Object.assign({}, configs, {
                    'container': this,
                    'listeners': {
                        'propchange': this.onComponenetPropChange.bind(this)
                    }
                }))
                .addListener('pageactivate', this.onPageActivate.bind(this))
                .addDelegate('.element[data-type="Cursor"]', 'time', this.onCursorElementTime.bind(this))
                .addDelegate('.element[data-type="Text"]', 'play', this.onTextElementPlay.bind(this))
                .addDelegate('.element[data-type="Text"]', 'page', this.onTextElementPage.bind(this))
                .addDelegate('.element[data-type="Text"]', 'block_visibility', this.onTextElementBlockVisibility.bind(this));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_BLOCKADD, {'player': this, 'block': block}, true, false);
        }

        return block;
    }

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
    }

    /**
     * Toggles the media playing state
     *
     * @method togglePlay
     * @chainable
     */
    togglePlay() {
        const media = this.getMedia();

        if(media.isPlaying()){
            media.pause();
        }
        else{
            media.play();
        }

        return this;
    }

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
        let player = this,
            media = this.getMedia();

        if(this.cuepoint){
            this.cuepoint.destroy();
        }

        inTime = parseFloat(inTime);
        outTime = parseFloat(outTime);
        rIndex = parseInt(rIndex, 10);

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
            .addListener('start', () => {
                player.setReadingIndex(!isNaN(rIndex) ? rIndex : 0);
            })
            .addListener('seekout', (evt) => {
                evt.target.destroy();
                delete player.cuepoint;

                player.setReadingIndex(0);
            })
            .addListener('stop', (evt) => {
                evt.target.getMedia().pause();
            })
            .init();

            media.setTime(inTime).play();
        }

        return this;
    }

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
                .addRule(`.metaScore-component.element[data-r-index="${index}"]`, 'display: block;')
                .addRule(`.metaScore-component.element[data-r-index="${index}"]:not([data-start-time]), .metaScore-component.element[data-r-index="${index}"].active`, 'pointer-events: auto;')
                .addRule(`.metaScore-component.element[data-r-index="${index}"]:not([data-start-time]) .contents, .metaScore-component.element[data-r-index="${index}"].active .contents`, 'display: block;')
                .addRule(`.in-editor.editing.show-contents .metaScore-component.element[data-r-index="${index}"] .contents`, 'display: block;');

            this.data('r-index', index);
        }
        else{
            this.data('r-index', null);
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_RINDEX, {'player': this, 'value': index}, true, false);
        }

        return this;
    }

    updateBlockTogglers() {
        let block_togglers = this.getComponents('.block-toggler'),
            blocks = this.getComponents('.block, .media.video, .controller');

        block_togglers.forEach((dom) => {
            dom._metaScore.update(blocks);
        });
    }

}
