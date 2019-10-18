import {className} from '../css/Player.scss';

import Dom from './core/Dom';
import {MasterClock} from './core/media/Clock';
import Locale from './core/Locale';
import Ajax from './core/Ajax';
import ContextMenu from './core/ui/ContextMenu';
import Overlay from './core/ui/Overlay';
import StyleSheet from './core/StyleSheet';
import CuePoint from './player/CuePoint';
import Media from './player/component/Media';
import Controller from './player/component/Controller';
import BlockToggler from './player/component/BlockToggler';
import Block from './player/component/Block';
import {isEmpty} from './core/utils/Var';
import {getRendererForMime} from './core/utils/Media';

/**
 * Provides the main Player class
 *
 * @emits {ready} Fired when the player finished initializing
 * @param {Object} player The player instance
 *
 * @emits {load} Fired when the guide's loading finished successfully
 * @param {Object} player The player instance
 * @param {Object} data The json data loaded
 *
 * @emits {loaderror} Fired when the guide's loading failed
 * @param {Object} player The player instance
 *
 * @emits {componentadd} Fired when a component is added
 * @param {Object} component The component instance
 * @param {Boolean} new Whether the component was an already existing one, or a newly created one from configs
 *
 * @emits {componentremove} Fired when a component is removed
 * @param {Object} component The component instance
 *
 * @emits {scenariochange} Fired when the scenario changes
 * @param {Object} player The player instance
 * @param {Object} value The scenario
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

        // Set the banner for ContextMenus
        ContextMenu.setBannerText(Locale.t('Player.contextmenuBanner', 'metaScore Player v.!version r.!revision', {'!version': this.constructor.getVersion(), '!revision': this.constructor.getRevision()}));

        /**
         * Whether the player has finished loading
         * @type {Boolean}
         */
        this.loaded = false;

        this.components_container = new Dom('<div/>', {'class': 'components-container'})
            .appendTo(this);

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
                'logo': {
                    'class': 'logo'
                }
            }})
            .appendTo(this);

        this
            .addListener('childremove', this.onChildRemove.bind(this))
            .addDelegate('.metaScore-component', 'propchange', this.onComponentPropChange.bind(this))
            .appendTo(this.configs.container);

        MasterClock.addListener('timeupdate', this.onMasterClockTimeUpdate.bind(this));

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
                this.components_container.find('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
                evt.preventDefault();
                evt.stopPropagation();
                break;

            case "ArrowRight":
                this.components_container.find('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
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
                this.play(params.inTime, params.outTime, params.scenario);
                break;

            case 'pause':
                this.getRenderer().pause();
                break;

            case 'seek':
                this.getRenderer().setTime(params.seconds);
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
                const state = method.replace('Block', '');
                const show = state === 'toggle' ? void 0 : method !== 'hide';

                this.getComponents('.media.video, .controller, .block').forEach((block) => {
                    if(block.getName() === params.name){
                        block.toggleVisibility(show);
                    }
                });
                break;
            }

            case 'scenario':
                this.setActiveScenario(params.value);
                break;

            case 'playing':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': this.getRenderer().isPlaying()
                }), origin);
                break;

            case 'time':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': this.getRenderer().getTime()
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
                                'params': event.detail.media.getTime()
                            }), origin);
                        });
                        break;

                    case 'scenariochange':
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
                this.getRenderer().setTime(0);
                break;

            case 'play':
                this.togglePlay();
                break;
        }

        evt.stopPropagation();
    }

    /**
     * Media sourceset event callback
     *
     * @private
     */
    onRendererSourceSet(evt){
        MasterClock.setRenderer(evt.detail.renderer);
    }

    /**
     * Media waiting event callback
     *
     * @private
     */
    onRendererWaiting(){
        this.addClass('media-waiting');
    }

    /**
     * Media seeking event callback
     *
     * @private
     */
    onRendererSeeking(){
        this.addClass('media-waiting');
    }

    /**
     * Media seeked event callback
     *
     * @private
     */
    onRendererSeeked(){
        this.removeClass('media-waiting');
    }

    /**
     * Media playing event callback
     *
     * @private
     */
    onRendererPlaying(){
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
    onRendererPlay(){
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
    onRendererPause(){
        this.removeClass('media-waiting');

        if(this.controller){
            this.controller.removeClass('playing');
        }
    }

    /**
     * Media suspend event callback
     *
     * @private
     */
    onRendererSuspend(){
        this.removeClass('media-waiting');
    }

    /**
     * Media suspend event callback
     *
     * @private
     */
    onRendererStalled(){
        this.removeClass('media-waiting');
    }

    /**
     * Media error event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onRendererError(evt){
        const message = evt.detail.message;

        this.removeClass('media-waiting');

        // Only show an alert if not in an editor, as an alert will otherwise be shown in the editor
        if(!this.in_editor){
            new Overlay({
                'parent': this,
                'text': message,
                'buttons': {
                    'ok': Locale.t('player.onRendererError.ok', 'OK'),
                }
            });
        }

        this.triggerEvent('mediaerror', {'player': this, 'message': message});

        evt.stopPropagation();
    }

    /**
     * Media timeupdate event callback
     *
     * @private
     */
    onMasterClockTimeUpdate(){
        if(this.controller){
            this.controller.updateTime(MasterClock.getTime());
        }
    }

    /**
     * childremove event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onChildRemove(evt){
        const component = evt.detail.child._metaScore;

        if(component){
            this.triggerEvent('componentremove', {'component': component}, true, false);
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
            this.getRenderer().setTime(evt.detail.time);
        }
    }

    /**
     * Element of type Text play event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTextElementPlay(evt){
        this.play(evt.detail.inTime, evt.detail.outTime, evt.detail.scenario);
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
        const state = evt.detail.action;
        const show = state === 'toggle' ? void 0 : state !== 'hide';

        this.getComponents('.media.video, .controller, .block').forEach((block) => {
            if(block.getName() === evt.detail.block){
                block.toggleVisibility(show);
            }
        });
    }

    /**
     * Component propchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentPropChange(evt){
        const component = evt.detail.component;

        switch(evt.detail.property){
            case 'hidden':{
                // Update all BlockTogglers to reflect the change in a component's hidden state.
                this.components_container.find(`.block-toggler .button[data-component=${component.getId()}]`)
                    .toggleClass('active', component.getPropertyValue('hidden'));
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
        this.data = evt.target.getResponse();

        /**
         * A stylesheet containing the guide's custom css
         * @type {StyleSheet}
         */
        this.css = new StyleSheet()
            .setInternalValue(this.data.css)
            .appendTo(document.head);

        this.addDelegate('.metaScore-component', 'propchange', this.onComponentPropChange.bind(this));

        this.data.components.forEach((component) => {
            switch(component.type){
                case 'Media':
                    /**
                     * The media block
                     * @type {Media}
                     */
                    this.media = this.addMedia(component);
                    break;

                case 'Controller':
                    /**
                     * The controller block
                     * @type {Controller}
                     */
                    this.controller = this.addController(component);
                    break;

                case 'BlockToggler':
                    this.addBlockToggler(component);
                    break;

                default:
                    this.addBlock(component);
            }
        });

        if(this.configs.keyboard){
            this.addListener('keydown', this.onKeydown.bind(this));
        }

        this
            .setSource(this.data.media)
            .updateBlockTogglers()
            .removeClass('loading');

        this.loaded = true;

        this.triggerEvent('load', {'player': this, 'data': this.data}, true, false);

        this.setActiveScenario(this.data.scenarios[0]);
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
     * Get the loaded JSON data
     *
     * @param {String} [key] An optional data key
     * @return {Object} The value corresponding to the key, or the entire JSON data
     */
    getData(key){
        if(key){
            return this.data[key];
        }

        return this.data;
    }

    /**
     * Get the id of the loaded guide
     *
     * @return {String} The id
     */
    getId() {
        return this.getData('id');
    }

    /**
     * Get the revision id of the loaded guide
     *
     * @return {String} The revision id
     */
    getRevision() {
        return this.getData('vid');
    }

    /**
     * Get the renderer
     *
     * @return {Dom} The renderer
     */
    getRenderer(){
        return this.renderer;
    }

    /**
     * Set the media source
     *
     * @param {Object} source The source as objects with 'url' and 'mime' keys
     * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
     * @return {this}
     */
    setSource(source, supressEvent){
        if(this.renderer){
            this.renderer.remove();
        }

        const renderer = getRendererForMime(source.mime);
        if(renderer){
            /**
             * The renderer
             * @type {Dom}
             */
            this.renderer = new renderer({'tag': this.data.media.type})
                .addListener('ready', (evt) => {
                    evt.detail.renderer.setSource(source, supressEvent);
                })
                .addListener('sourceset', this.onRendererSourceSet.bind(this))
                .addListener('waiting', this.onRendererWaiting.bind(this))
                .addListener('seeking', this.onRendererSeeking.bind(this))
                .addListener('seeked', this.onRendererSeeked.bind(this))
                .addListener('playing', this.onRendererPlaying.bind(this))
                .addListener('play', this.onRendererPlay.bind(this))
                .addListener('pause', this.onRendererPause.bind(this))
                .addListener('suspend', this.onRendererSuspend.bind(this))
                .addListener('stalled', this.onRendererStalled.bind(this))
                .addListener('error', this.onRendererError.bind(this))
                .appendTo(this)
                .init();
        }

        return this;
    }

    /**
     * Update the loaded JSON data
     *
     * @param {Object} data The data key, value pairs to update
     * @param {Boolean} [skipInternalUpdates=false] Whether to skip internal update methods for CSS, media sources, etc
     * @return {this}
     */
    updateData(data, skipInternalUpdates){
        Object.assign(this.data, data);

        if(skipInternalUpdates !== true){
            if('css' in data){
                this.updateCSS(data.css);
            }

            if('media' in data){
                this.setSource(data.media);
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
        let components = this.components_container.find('.metaScore-component');

        if(selector){
            components = components.filter(selector);
        }

        return components.elements.map((dom) => dom._metaScore);
    }

    /**
     * Get root components by CSS selector
     *
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom instance containing the selected components
     * TODO: improve
     */
    getRootComponents(selector){
        let components = this.components_container.children('.metaScore-component');

        if(selector){
            components = components.filter(selector);
        }

        return components.elements.map((dom) => dom._metaScore);
    }

    /**
     * Create and add a Media instance
     *
     * @param {Object} configs The configurations to send to the Media class
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event or not
     * @return {Media} The Media instance
     */
    addMedia(configs, supressEvent){
        let media = configs;
        const existing = media instanceof Media;

        if(existing){
            media.appendTo(this.components_container);
        }
        else{
            media = new Media(media)
                .appendTo(this.components_container)
                .init();
        }

        if(media.getPropertyValue('scenario') === this.getActiveScenario()){
            media.activate();
        }
        else{
            media.deactivate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': media, 'new': !existing}, true, false);
        }

        return media;
    }

    /**
     * Create and add a Controller instance
     *
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event or not
     * @return {Controller} The Controller instance
     */
    addController(configs, supressEvent){
        let controller = configs;
        const existing = controller instanceof Controller;

        if(existing){
            controller.appendTo(this.components_container);
        }
        else{
            controller = new Controller(controller)
                .addDelegate('.buttons button', 'click', this.onControllerButtonClick.bind(this))
                .appendTo(this.components_container)
                .init();
        }

        if(controller.getPropertyValue('scenario') === this.getActiveScenario()){
            controller.activate();
        }
        else{
            controller.deactivate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': controller, 'new': !existing}, true, false);
        }

        return controller;
    }

    /**
     * Create and add a Block Toggler instance
     *
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event or not
     * @return {BlockToggler} The Block Toggler instance
     */
    addBlockToggler(configs, supressEvent){
        let block_toggler = configs;
        const existing = block_toggler instanceof BlockToggler;

        if(existing){
            block_toggler.appendTo(this.components_container);
        }
        else{
            block_toggler = new BlockToggler(block_toggler)
                .appendTo(this.components_container)
                .init();
        }

        this.updateBlockToggler(block_toggler);

        if(block_toggler.getPropertyValue('scenario') === this.getActiveScenario()){
            block_toggler.activate();
        }
        else{
            block_toggler.deactivate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': block_toggler, 'new': !existing}, true, false);
        }

        return block_toggler;
    }

    /**
     * Create and add a Block instance
     *
     * @param {Object} configs The configurations to send to the Block class
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event or not
     * @return {Block} The Block instance
     */
    addBlock(configs, supressEvent){
        let block = configs;
        const existing = block instanceof Block;

        if(existing){
            block.appendTo(this.components_container);
        }
        else{
            block = new Block(block)
                .addDelegate('.element.Cursor', 'time', this.onCursorElementTime.bind(this))
                .addDelegate('.element.Text', 'play', this.onTextElementPlay.bind(this))
                .addDelegate('.element.Text', 'page', this.onTextElementPage.bind(this))
                .addDelegate('.element.Text', 'block_visibility', this.onTextElementBlockVisibility.bind(this))
                .appendTo(this.components_container)
                .init();
        }

        if(block.getChildrenCount() === 0){
            // add a page
            const page_configs = {};
            if(block.getPropertyValue('synched')){
                page_configs['start-time'] = 0;
                page_configs['end-time'] = this.getRenderer().getDuration();
            }
            block.addPage(page_configs);
        }

        if(block.getPropertyValue('scenario') === this.getActiveScenario()){
            block.activate();
        }
        else{
            block.deactivate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': block, 'new': !existing}, true, false);
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
        const renderer = this.getRenderer();

        if(renderer.isPlaying()){
            renderer.pause();
        }
        else{
            renderer.play();
        }

        return this;
    }

    /**
     * Start playing the media at the current position, or plays a specific extract
     *
     * @param {String} [inTime] The time at which the media should start playing
     * @param {String} [outTime] The time at which the media should stop playing
     * @param {String} [scenario] A reading index to go to while playing
     * @return {this}
     */
    play(inTime, outTime, scenario){
        if(this.cuepoint){
            this.cuepoint.deactivate();
        }

        const _inTime = parseFloat(inTime);
        const _outTime = parseFloat(outTime);

        if(isNaN(_inTime)){
            this.getRenderer().play();
        }
        else{
            /**
             * The active time link's cuepoint
             * @type {CuePoint}
             */
            this.cuepoint = new CuePoint({
                'inTime': _inTime,
                'outTime': !isNaN(_outTime) ? _outTime : null,
                'considerError': true
            })
            .addListener('seekout', (evt) => {
                evt.target.deactivate();
                delete this.cuepoint;
            })
            .addListener('stop', (evt) => {
                evt.target.getRenderer().pause();
            });

            if(scenario){
                const previous_scenario = this.getActiveScenario();
                this.cuepoint
                    .addListener('start', () => {
                        this.setActiveScenario(scenario);
                    })
                    .addListener('seekout', () => {
                        this.setActiveScenario(previous_scenario);
                    });
            }

            this.cuepoint.activate();

            this.getRenderer().setTime(_inTime).play();
        }

        return this;
    }

    /**
     * Get the list of scenarios
     *
     * @return {Array} The scenarios
     */
    getScenarios(){
        return this.getData('scenarios');
    }

    /**
     * Add a new scenario
     *
     * @param {String} scenario The scenario
     * @return {this}
     */
    addScenario(scenario){
        const scenarios = this.getScenarios();
        scenarios.push(scenario);

        return this;
    }

    /**
     * Get the current scenario
     *
     * @return {String} The scenario
     */
    getActiveScenario(){
        return this.scenario;
    }

    /**
     * Set the current scenario
     *
     * @param {String} scenario The scenario
     * @param {Boolean} [supressEvent=false] Whether to supress the scenariochange event or not
     * @return {this}
     */
    setActiveScenario(scenario, supressEvent){
        if(scenario !== this.scenario){
            const scenarios = this.getScenarios();

            if(!scenarios.includes(scenario)){
                console.error(`scenario "${scenario}" does not exist`);
            }
            else{
                this.scenario = scenario;

                this.getRootComponents().forEach((component) => {
                    if(component.getPropertyValue('scenario') === this.scenario){
                        component.activate();
                    }
                    else{
                        component.deactivate();
                    }
                });

                if(supressEvent !== true){
                    this.triggerEvent('scenariochange', {'player': this, 'scenario': this.scenario}, true, false);
                }
            }
        }

        return this;
    }

    /**
    * Update a block toggler
    *
    * @return {this}
    */
    updateBlockToggler(block_toggler) {
        let blocks = [];
        const ids = block_toggler.getPropertyValue('blocks');

        if(ids === null){
            // If ids is not an array, return all blocks for backwards compatibility.
            // See BlockToggler's blocks property
            blocks = this.getComponents('.block, .controller, .media.video');
        }
        else if(!isEmpty(ids)){
            blocks = this.getComponents(`#${ids.join(', #')}`);
        }

        block_toggler.update(blocks);

        return this;
    }

    /**
    * Update all block togglers
    *
    * @return {this}
    */
    updateBlockTogglers() {
        this.getComponents('.block-toggler').forEach((block_toggler) => {
            this.updateBlockToggler(block_toggler);
        });

        return this;
    }

}
