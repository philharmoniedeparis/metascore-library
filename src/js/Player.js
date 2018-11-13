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
import {toCentiseconds, toSeconds} from './core/utils/Media';

import {className} from '../css/Player.less';

/**
 * Provides the main Player class
 *
 * @emits {ready} Fired when the player finished initializing
 * @param {Object} player The player instance
 * @emits {load} Fired when the guide's loading finished successfully
 * @param {Object} player The player instance
 * @param {Object} data The json data loaded
 * @emits {loaderror} Fired when the guide's loading failed
 * @param {Object} player The player instance
 * @emits {idset} Fired when the id is set
 * @param {Object} player The player instance
 * @param {String} id The guide's id
 * @emits {revisionset} Fired when the vid is set
 * @param {Object} player The player instance
 * @param {Integer} vid The guide's vid
 * @emits {mediaadd} Fired when the media is added
 * @param {Object} player The player instance
 * @param {Object} media The media instance
 * @emits {controlleradd} Fired when the controller is added
 * @param {Object} player The player instance
 * @param {Object} controller The controller instance
 * @emits {blocktoggleradd} Fired when a block toggler is added
 * @param {Object} player The player instance
 * @param {Object} blocktoggler The blocktoggler instance
 * @emits {blockadd} Fired when a block is added
 * @param {Object} player The player instance
 * @param {Object} block The block instance
 * @emits {rindex} Fired when the reading index is set
 * @param {Object} player The player instance
 * @param {Object} value The reading index value
 */
export default class Player extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [url=''] The URL of the guide's JSON data to load
     * @property {Mixed} [container='body'] The HTMLElement, Dom instance, or CSS selector to which the player should be appended
     * @property {Object} [xhr={}] Custom options to send with each XHR request. See {@link Ajax.send} for available options
     * @property {Boolean} [autoload=true] Whether to automatically call the load function
     * @property {Boolean} [keyboard=true] Whether to activate keyboard shortcuts or not
     * @property {Boolean} [api=false] Whether to allow API access or not
     * @property {String} [lang] The language to use for i18n
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `metaScore-player ${className}`, 'tabindex': 0});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * Whether the player has finished loading
         * @type {Boolean}
         */
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

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'url': '',
            'container': 'body',
            'xhr': {},
            'autoload': true,
            'keyboard': true,
            'api': false,
            'lang': 'en'
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
    init() {

        /**
         * The context menu
         * @type {ContextMenu}
         */
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

        this.triggerEvent('ready', {'player': this}, false, false);

        if(this.configs.autoload !== false){
            this.load();
        }
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
     * Keydown event callback
     *
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onKeydown(evt){
        switch(evt.key){
            case " ":
                this.togglePlay();
                evt.preventDefault();
                evt.stopPropagation();
                break;

            case "ArrowLeft":
                this.find('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
                evt.preventDefault();
                evt.stopPropagation();
                break;

            case "ArrowRight":
                this.find('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
                evt.preventDefault();
                evt.stopPropagation();
                break;
        }
    }

    /**
     * API message event callback
     *
     * @private
     * @param {MessageEvent} evt The event object
     */
    onAPIMessage(evt){ // eslint-disable-line complexity
        let data = null;

        try {
            data = JSON.parse(evt.data);
        }
        catch(e){
            return;
        }

        if (!('method' in data)) {
            return;
        }

        const source = evt.source;
        const origin = evt.origin;
        const method = data.method;
        const params = 'params' in data ? data.params : null;

        switch(method){
            case 'play':
                this.play(params.inTime, params.outTime, params.rIndex);
                break;

            case 'pause':
                this.getMedia().pause();
                break;

            case 'seek':
                this.getMedia().setTime(toCentiseconds(params.seconds));
                break;

            case 'page':
                {
                    const block = this.getComponent(`.block[data-name="${params.block}"]`);
                    if(block){
                        block.setActivePage(params.index);
                    }
                }
                break;

            case 'showBlock':
            case 'hideBlock':
            case 'toggleBlock':{
                const show = method !== 'hideBlock';

                this.getComponents('.media.video, .controller, .block').forEach((block) => {
                    if(block.getName() === params.name){
                        block.toggleVisibility(show);
                    }
                });
                break;
            }

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
                    'params': toSeconds(this.getMedia().getTime())
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
                                'params': toSeconds(event.detail.media.getTime())
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
                /**
                 * @todo add support
                 */
                break;
        }
    }

    /**
     * Controller button click event callback
     *
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
     * Media waiting event callback
     *
     * @private
     */
    onMediaWaiting(){
        this.addClass('media-waiting');
    }

    /**
     * Media seeking event callback
     *
     * @private
     */
    onMediaSeeking(){
        this.addClass('media-waiting');
    }

    /**
     * Media seeked event callback
     *
     * @private
     */
    onMediaSeeked(){
        this.removeClass('media-waiting');
    }

    /**
     * Media playing event callback
     *
     * @private
     */
    onMediaPlaying(){
        this.removeClass('media-waiting');

        if(this.controller){
            this.controller.addClass('playing');
        }
    }

    /**
     * Media play event callback
     *
     * @private
     */
    onMediaPlay(){
        this.removeClass('media-waiting');

        if(this.controller){
            this.controller.addClass('playing');
        }
    }

    /**
     * Media pause event callback
     *
     * @private
     */
    onMediaPause(){
        this.removeClass('media-waiting');

        if(this.controller){
            this.controller.removeClass('playing');
        }
    }

    /**
     * Media timeupdate event callback
     *
     * @private
     */
    onMediaTimeUpdate(){
        if(this.controller){
            const currentTime = this.getMedia().getTime();
            this.controller.updateTime(currentTime);
        }
    }

    /**
     * Media suspend event callback
     *
     * @private
     */
    onMediaSuspend(){
        this.removeClass('media-waiting');
    }

    /**
     * Media suspend event callback
     *
     * @private
     */
    onMediaStalled(){
        this.removeClass('media-waiting');
    }

    /**
     * Media error event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onMediaError(evt){
        const error = evt.target.error;
        let text = '';

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
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPageActivate(evt){
        const block = evt.target._metaScore;
        const page = evt.detail.current;

        if(block.getPropertyValue('synched')){
            this.getMedia().setTime(page.getPropertyValue('start-time'));
        }
    }

    /**
     * Element of type Cursor time event callback
     *
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
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementPlay(evt){
        this.play(evt.detail.inTime, evt.detail.outTime, evt.detail.rIndex);
    }

    /**
     * Element of type Text page event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementPage(evt){
        const block = this.getComponent(`.block[data-name="${evt.detail.block}"]`);
        if(block){
            block.setActivePage(evt.detail.index);
        }
    }

    /**
     * Element of type Text block_visibility event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementBlockVisibility(evt){
        const show = evt.detail.action !== 'hide';

        this.getComponents('.media.video, .controller, .block').forEach((block) => {
            if(block.getName() === evt.detail.block){
                block.toggleVisibility(show);
            }
        });
    }

    /**
     * Componenet propchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponenetPropChange(evt){
        const component = evt.detail.component;

        switch(evt.detail.property){
            case 'start-time':
            case 'end-time':
                component.setCuePoint({
                    'media': this.getMedia()
                });
                break;

            case 'direction':
            case 'acceleration':{
                const cuepoint = component.getCuePoint();
                if(cuepoint){
                    cuepoint.update();
                }
                break;
            }
        }
    }

    /**
     * loadsuccess event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onLoadSuccess(evt){
        /**
         * The guide's JSON data
         * @type {Object}
         */
        this.json = evt.target.getResponse();

        this.setId(this.json.id)
            .setRevision(this.json.vid);

        /**
         * A stylesheet containing the guide's custom css
         * @type {StyleSheet}
         */
        this.css = new StyleSheet()
            .setInternalValue(this.json.css)
            .appendTo(document.head);

        /**
         * A stylesheet for dynamic r-index manipulation
         * @type {StyleSheet}
         */
        this.rindex_css = new StyleSheet()
            .appendTo(document.head);

        this.json.blocks.forEach((block) => {
            switch(block.type){
                case 'Media':
                    /**
                     * The media block
                     * @type {Media}
                     */
                    this.media = this.addMedia(Object.assign({}, block, {'type': this.json.type}))
                        .setSource(this.json.media);
                    break;

                case 'Controller':
                    /**
                     * The controller block
                     * @type {Controller}
                     */
                    this.controller = this.addController(block);
                    break;

                case 'BlockToggler':
                    this.addBlockToggler(block);
                    break;

                default:
                    this.addBlock(block);
            }
        });

        this.updateBlockTogglers();

        if(this.configs.keyboard){
            this.addListener('keydown', this.onKeydown.bind(this));
        }

        this.removeClass('loading');

        this.loaded = true;

        this.triggerEvent('load', {'player': this, 'data': this.json}, true, false);
    }

    /**
     * loaderror event callback
     *
     * @private
     */
    onLoadError(){
        this.removeClass('loading');

        this.triggerEvent('error', {'player': this}, true, false);
    }

    /**
     * Load the guide
     *
     * @private
     */
    load() {
        this.addClass('loading');

        const options = Object.assign({}, {
            'responseType': 'json',
            'onSuccess': this.onLoadSuccess.bind(this),
            'onError': this.onLoadError.bind(this)
        }, this.configs.xhr);

        Ajax.GET(this.configs.url, options);

        return this;
    }

    /**
     * Get the id of the loaded guide
     *
     * @return {String} The id
     */
    getId() {
        return this.data('id');
    }

    /**
     * Set the id of the loaded guide in a data attribute
     *
     * @param {String} id The id
     * @param {Boolean} [supressEvent=false] Whether to supress the idset event
     * @return {this}
     */
    setId(id, supressEvent){
        this.data('id', id);

        if(supressEvent !== true){
            this.triggerEvent('idset', {'player': this, 'id': id}, true, false);
        }

        return this;
    }

    /**
     * Get the revision id of the loaded guide
     *
     * @return {String} The revision id
     */
    getRevision() {
        return this.data('vid');
    }

    /**
     * Set the revision id of the loaded guide in a data attribute
     *
     * @param {String} vid The revision id
     * @param {Boolean} [supressEvent=false] Whether to supress the revisionset event
     * @return {this}
     */
    setRevision(vid, supressEvent){
        this.data('vid', vid);

        if(supressEvent !== true){
            this.triggerEvent('revisionset', {'player': this, 'vid': vid}, true, false);
        }

        return this;
    }

    /**
     * Get the loaded JSON data
     *
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
     * @return {Media} The media instance
     */
    getMedia() {
        return this.media;
    }

    /**
     * Update the loaded JSON data
     *
     * @param {Object} data The data key, value pairs to update
     * @param {Boolean} [skipInternalUpdates=false] Whether to skip internal update methods for CSS, media sources, etc
     * @return {this}
     */
    updateData(data, skipInternalUpdates){
        Object.assign(this.json, data);

        if(skipInternalUpdates !== true){
            if('css' in data){
                this.updateCSS(data.css);
            }

            if('media' in data){
                this.getMedia().setSource(data.media);
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
     * @param {String} selector The CSS selector
     * @return {Component} The component
     * TODO: improve
     */
    getComponent(selector){
        const components = this.getComponents(selector);
        return components[0];
    }

    /**
     * Get components by CSS selector
     *
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom instance containing the selected components
     * TODO: improve
     */
    getComponents(selector){
        let components = this.find('.metaScore-component');

        if(selector){
            components = components.filter(selector);
        }

        return components.elements.map((dom) => dom._metaScore);
    }

    /**
     * Create and add a Media instance
     *
     * @param {Object} configs The configurations to send to the Media class
     * @param {Boolean} [supressEvent=false] Whether to supress the mediadd event or not
     * @return {Media} The Media instance
     */
    addMedia(configs, supressEvent){
        let media = configs;

        if(!(media instanceof Media)){
            media = new Media(configs)
                .addListener('waiting', this.onMediaWaiting.bind(this))
                .addListener('seeking', this.onMediaSeeking.bind(this))
                .addListener('seeked', this.onMediaSeeked.bind(this))
                .addListener('playing', this.onMediaPlaying.bind(this))
                .addListener('play', this.onMediaPlay.bind(this))
                .addListener('pause', this.onMediaPause.bind(this))
                .addListener('timeupdate', this.onMediaTimeUpdate.bind(this))
                .addListener('suspend', this.onMediaSuspend.bind(this))
                .addListener('stalled', this.onMediaStalled.bind(this))
                .addListener('error', this.onMediaError.bind(this));
        }

        media.appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent('mediaadd', {'player': this, 'media': media}, true, false);
        }

        return media;
    }

    /**
     * Create and add a Controller instance
     *
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {Controller} The Controller instance
     */
    addController(configs, supressEvent){
        let controller = configs;

        if(!(controller instanceof Controller)){
            controller = new Controller(controller)
                .addDelegate('.buttons button', 'click', this.onControllerButtonClick.bind(this));
        }

        controller.appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent('controlleradd', {'player': this, 'controller': controller}, true, false);
        }

        return controller;
    }

    /**
     * Create and add a Block Toggler instance
     *
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {BlockToggler} The Block Toggler instance
     */
    addBlockToggler(configs, supressEvent){
        let toggler = configs;

        if(!(toggler instanceof BlockToggler)){
            toggler = new BlockToggler(toggler);
        }

        toggler.appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent('blocktoggleradd', {'player': this, 'blocktoggler': toggler}, true, false);
        }

        return toggler;
    }

    /**
     * Create and add a Block instance
     *
     * @param {Object} configs The configurations to send to the Block class
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @return {Block} The Block instance
     */
    addBlock(configs, supressEvent){
        let block = configs;

        if(block instanceof Block){
            block.appendTo(this);
        }
        else{
            block = new Block(Object.assign({}, block, {
                    'container': this,
                    'listeners': {
                        'propchange': this.onComponenetPropChange.bind(this)
                    }
                }))
                .addListener('pageactivate', this.onPageActivate.bind(this))
                .addDelegate('.element.Cursor', 'time', this.onCursorElementTime.bind(this))
                .addDelegate('.element.Text', 'play', this.onTextElementPlay.bind(this))
                .addDelegate('.element.Text', 'page', this.onTextElementPage.bind(this))
                .addDelegate('.element.Text', 'block_visibility', this.onTextElementBlockVisibility.bind(this));
        }

        if(supressEvent !== true){
            this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
        }

        return block;
    }

    /**
     * Update the custom CSS
     *
     * @param {String} value The custom CSS value
     * @return {this}
     */
    updateCSS(value){
        this.css.setInternalValue(value);

        return this;
    }

    /**
     * Toggles the media playing state
     *
     * @return {this}
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
     * @param {String} [inTime] The time at which the media should start playing
     * @param {String} [outTime] The time at which the media should stop playing
     * @param {String} [rIndex] A reading index to go to while playing
     * @return {this}
     */
    play(inTime, outTime, rIndex){
        const player = this;
        const media = this.getMedia();

        if(this.cuepoint){
            this.cuepoint.destroy();
        }

        const _inTime = parseFloat(inTime);
        const _outTime = parseFloat(outTime);
        const _rIndex = parseInt(rIndex, 10);

        if(isNaN(_inTime)){
            media.play();
        }
        else{
            /**
             * The active time link's cuepoint
             * @type {CuePoint}
             */
            this.cuepoint = new CuePoint({
                'media': media,
                'inTime': _inTime,
                'outTime': !isNaN(_outTime) ? _outTime : null,
                'considerError': true
            })
            .addListener('start', () => {
                player.setReadingIndex(!isNaN(_rIndex) ? _rIndex : 0);
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

            media.setTime(_inTime).play();
        }

        return this;
    }

    /**
     * Get the current reading index
     *
     * @return {Integer} The reading index
     */
    getReadingIndex(){
        const value = parseInt(this.data('r-index'), 10);
        return isNaN(value) ? null : value;
    }

    /**
     * Set the current reading index
     *
     * @param {Integer} index The reading index
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @return {this}
     */
    setReadingIndex(index, supressEvent){
        if(index !== this.getReadingIndex()){
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
                this.triggerEvent('rindex', {'player': this, 'value': index}, true, false);
            }
        }

        return this;
    }

    /**
    * Update all block togglers
    *
    * @return {this}
    */
    updateBlockTogglers() {
        const block_togglers = this.getComponents('.block-toggler');
        const blocks = this.getComponents('.block, .media.video, .controller');

        block_togglers.forEach((block_toggler) => {
            block_toggler.update(blocks);
        });
    }

}
