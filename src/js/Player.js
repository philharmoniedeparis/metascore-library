import {className} from '../css/Player.scss';

import Dom from './core/Dom';
import {MasterClock} from './core/media/Clock';
import Locale from './core/Locale';
import Ajax from './core/Ajax';
import ContextMenu from './core/ui/ContextMenu';
import Overlay from './core/ui/Overlay';
import StyleSheet from './core/StyleSheet';
import CuePoint from './player/CuePoint';
import Component from './player/Component';
import Scenario from './player/component/Scenario';
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
            .addListener('.componentadd', this.onComponentAdd.bind(this))
            .addDelegate('.metaScore-component.controller .buttons button', 'click', this.onControllerButtonClick.bind(this))
            .addDelegate('.metaScore-component.element.Cursor', 'time', this.onCursorElementTime.bind(this))
            .addDelegate('.metaScore-component.element.Text', 'play', this.onTextElementPlay.bind(this))
            .addDelegate('.metaScore-component.element.Text', 'page', this.onTextElementPage.bind(this))
            .addDelegate('.metaScore-component.element.Text', 'block_visibility', this.onTextElementBlockVisibility.bind(this))
            .appendTo(this.configs.container);

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
                    const block = this.getBlockByName(params.block);
                    if(block){
                        block.setActivePage(params.index);
                    }
                }
                break;

            case 'showBlock':
            case 'hideBlock':
            case 'toggleBlock':{
                const block = this.getBlockByName(params.name);

                if(block){
                const state = method.replace('Block', '');
                const show = state === 'toggle' ? void 0 : method !== 'hide';
                    block.toggleVisibility(show);
                }
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
        this.addClass('playing').removeClass('media-waiting');
    }

    /**
     * Media play event callback
     *
     * @private
     */
    onRendererPlay(){
        this.addClass('playing').removeClass('media-waiting');
    }

    /**
     * Media pause event callback
     *
     * @private
     */
    onRendererPause(){
        this.removeClass('playing').removeClass('media-waiting');
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

    onComponentAdd(evt){
        const component = evt.detail.component;

        if(component.instanceOf('BlockToggler')){
            this.updateBlockToggler(component);
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
        const block = this.getBlockByName(evt.detail.block);
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
        const block = this.getBlockByName(evt.detail.block);

        if(block){
            const state = evt.detail.action;
            const show = state === 'toggle' ? void 0 : state !== 'hide';
            block.toggleVisibility(show);
        }
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
                this.find(`.block-toggler .button[data-component=${component.getId()}]`)
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

        // Set media
        this.setSource(this.data.media);

        // Add components
        this.data.components.forEach((component) => {
            switch(component.type){
                case 'Scenario':
                    this.addScenario(component);
                    break;
            }
        });

        // Add keyboard listener
        if(this.configs.keyboard){
            this.addListener('keydown', this.onKeydown.bind(this));
        }

        // Set active scenario
        let scenario = null;
        const scenarios = this.getScenarios();
        if(scenarios.length > 0){
            scenario = scenarios[0];
        }
        else{
            // Add a default scenario if none exist
            const default_scenario_name = Locale.t('Player.defaultScenarioName', 'Scenario 1');
            scenario = this.addScenario(default_scenario_name);
        }
        this.setActiveScenario(scenario.getName());

        this.updateBlockTogglers();

        this.removeClass('loading');

        this.loaded = true;

        this.triggerEvent('load', {'player': this, 'data': this.data}, true, false);
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
     * Create and add a Media instance
     *
     * @param {Object} configs The configurations to send to the Media class
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event or not
     * @return {Media} The Media instance
     */
    addScenario(configs, supressEvent){
        let component = configs;
        const existing = component instanceof Component;

        if(existing){
            component.appendTo(this);
        }
        else{
            component = new Scenario(component)
                .appendTo(this)
                .init();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': component, 'new': !existing}, true, false);
        }

        return component;
    }

    /**
     * Get the a scenario by name
     *
     * @return {String} The scenario
     */
    getScenario(name){
        return this.getScenarios().find((scenario) => {
            return scenario.getName() === name;
        });
    }

    /**
     * Get the list of scenarios
     *
     * @return {Array} The scenarios
     */
    getScenarios(){
        const scenarios = [];

        this.children('.metaScore-component.scenario').forEach((dom) => {
            scenarios.push(dom._metaScore);
        });

        return scenarios;
    }

    /**
     * Get the active scenario
     *
     * @return {String} The scenario
     */
    getActiveScenario(){
        const scenario = this.child('.scenario.active');
        return scenario.count() > 0 ? scenario.get(0)._metaScore : null;
    }

    /**
     * Set the current scenario
     *
     * @param {String} name The scenario's name
     * @param {Boolean} [supressEvent=false] Whether to supress the scenariochange event or not
     * @return {this}
     */
    setActiveScenario(name, supressEvent){
        const scenario = this.getScenario(name);

        if(scenario){
            if(!scenario.isActive()){
                const previous_scenario = this.getActiveScenario();

                if(previous_scenario){
                    previous_scenario.deactivate();
                }

                scenario.activate();

                if(supressEvent !== true){
                    this.triggerEvent('scenariochange', {'player': this, 'scenario': scenario, 'previous': previous_scenario}, true, false);
                }
            }
        }
        else{
            console.error(`scenario "${name}" does not exist`);
        }

        return this;
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
     * Update a block toggler
     *
     * @return {this}
     */
    updateBlockToggler(block_toggler) {
        const ids = block_toggler.getPropertyValue('blocks');
        const scenario = block_toggler.getParent();
        const components = scenario.getChildren().filter((component) => {
            return ids.includes(component.getId());
        });

        block_toggler.update(components);

        return this;
    }

    /**
     * Update all block togglers
     *
     * @return {this}
     */
    updateBlockTogglers() {
        const scenario = this.getActiveScenario();

        if(scenario){
            scenario.getChildren()
                .filter((component) => {
                    return component.instanceOf('BlockToggler');
                }).forEach((block_toggler) => {
                    this.updateBlockToggler(block_toggler);
                });
        }

        return this;
    }

    /**
     * Get a block by name
     *
     * @param {String} name The block's name
     * @param {Scenario} [scenario] The scenario to which the block belongs
     * @return {Component} The block, or null if not found
     */
    getBlockByName(name, scenario){
        const _scenario = scenario ? scenario : this.getActiveScenario();
        if(_scenario){
            return _scenario.getChildren().find((child) => {
                return child.getName() === name;
            });
        }

        return null;
    }

}
