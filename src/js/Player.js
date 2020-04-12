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
export class Player extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [url=''] The URL of the guide's JSON data to load
     * @property {Mixed} [container='body'] The HTMLElement, Dom instance, or CSS selector to which the player should be appended
     * @property {Object} [xhr={}] Custom options to send with each XHR request. See {@link Ajax.send} for available options
     * @property {Boolean} [autoload=true] Whether to automatically call the load function
     * @property {Boolean} [keyboard=true] Whether to activate keyboard shortcuts or not
     * @property {Boolean} [responsive=false] Whether to auto-scale the player to fit the available space
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

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

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
            'responsive': false,
            'api': false,
            'lang': 'en',
            'websiteUrl':  `${window.location.protocol}//${window.location.host}`
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
        // Set the banner for ContextMenus
        ContextMenu.setBannerText(Locale.t('Player.contextmenu.banner', 'metaScore Player v.!version r.!revision', {'!version': this.constructor.getVersion(), '!revision': this.constructor.getRevision()}));

        /**
         * The context menu
         * @type {ContextMenu}
         */
        this.contextmenu = new ContextMenu({'target': this, 'items': {
                'header': {
                    'class': 'header',
                    'text': Locale.t('Player.contextmenu.header', 'Created using')
                },
                'logo': {
                    'class': 'logo',
                    'callback': () => {
                        if (this.configs.websiteUrl) {
                            window.open(this.configs.websiteUrl, '_blank');
                        }
                    }
                }
            }})
            .appendTo(this);

        this
            .addListener('childremove', this.onChildRemove.bind(this))
            .addListener('.componentadd', this.onComponentAdd.bind(this))
            .addDelegate('.metaScore-component.controller .buttons button', 'click', this.onControllerButtonClick.bind(this))
            .addDelegate('.metaScore-component.element.Cursor', 'time', this.onCursorElementTime.bind(this))
            .addDelegate('.metaScore-component.element.Content a, .metaScore-component.element.Content a *', 'click', this.onContentElementLinkClick.bind(this))
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
        const params = 'params' in data ? data.params : {};

        switch(method){
            case 'play':
                this.play(params.inTime, params.outTime, params.scenario);
                break;

            case 'pause':
                this.getRenderer().pause();
                break;

            case 'stop':
                this.getRenderer().stop();
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

            case 'toggleBlock':{
                const block = this.getBlockByName(params.name);
                const show = params.value === 'toggle' ? void 0 : params.value !== 'hide';

                if(block){
                    block.toggleVisibility(show);
                }
                break;
            }

            case 'scenario':{
                const scenario = this.getScenarios().find((s) => s.getId() === params.value);
                if(scenario){
                    this.setActiveScenario(scenario);
                }
                break;
            }

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
     * Renderer sourceset event callback
     *
     * @private
     */
    onRendererSourceSet(evt){
        MasterClock.setRenderer(evt.detail.renderer);
    }

    /**
     * Renderer waiting event callback
     *
     * @private
     */
    onRendererWaiting(){
        this.addClass('media-waiting');
    }

    /**
     * Renderer seeking event callback
     *
     * @private
     */
    onRendererSeeking(){
        this.addClass('media-waiting');
    }

    /**
     * Renderer seeked event callback
     *
     * @private
     */
    onRendererSeeked(){
        this.removeClass('media-waiting');
    }

    /**
     * Renderer playing event callback
     *
     * @private
     */
    onRendererPlaying(){
        this.addClass('playing').removeClass('media-waiting');
    }

    /**
     * Renderer play event callback
     *
     * @private
     */
    onRendererPlay(){
        this.addClass('playing').removeClass('media-waiting');
    }

    /**
     * Renderer pause event callback
     *
     * @private
     */
    onRendererPause(){
        this.removeClass('playing').removeClass('media-waiting');
    }

    /**
     * Renderer suspend event callback
     *
     * @private
     */
    onRendererSuspend(){
        this.removeClass('media-waiting');
    }

    /**
     * Renderer suspend event callback
     *
     * @private
     */
    onRendererStalled(){
        this.removeClass('media-waiting');
    }

    /**
     * Renderer error event callback
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
                'text': message,
                'buttons': {
                    'ok': Locale.t('player.onRendererError.ok', 'OK'),
                },
                'parent': this
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
            this.triggerEvent('componentremove', {'player': this, 'component': component}, true, false);
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
     * Content element link click event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onContentElementLinkClick(evt) {
        let link = evt.target;

        if(!Dom.is(link, 'a')){
            link = Dom.closest(link, 'a');
        }

        const href = Dom.attr(link, 'href');

        if((/^#/.test(href))){
            let matches = null;
            // play link.
            if((matches = link.hash.match(/^#play$/))){
                this.play();
                evt.preventDefault();
            }
            // play excerpt link.
            if((matches = link.hash.match(/^#play=(\d*\.?\d+)?,(\d*\.?\d+)?,(.+)$/))){
                const inTime = matches[1];
                const outTime = matches[2];
                const scenario = decodeURIComponent(matches[3]);
                this.play(inTime, outTime, scenario);
                evt.preventDefault();
            }
            // pause link.
            else if((matches = link.hash.match(/^#pause$/))){
                this.getRenderer().pause();
                evt.preventDefault();
            }
            // stop link.
            else if((matches = link.hash.match(/^#stop$/))){
                this.getRenderer().stop();
                evt.preventDefault();
            }
            // seek link.
            else if((matches = link.hash.match(/^#seek=(\d*\.?\d+)$/))){
                const seconds = parseFloat(matches[1]);
                this.getRenderer().setTime(seconds);
                evt.preventDefault();
            }
            // page link.
            else if((matches = link.hash.match(/^#page=([^,]*),(\d+)$/))){
                const block = this.getBlockByName(decodeURIComponent(matches[1]));
                const index = parseInt(matches[2], 10)-1;
                block.setActivePage(index);
                evt.preventDefault();
            }
            // show/hide/toggleBlock link.
            else if((matches = link.hash.match(/^#(show|hide|toggle)Block=(.*)$/))){
                const action = matches[1];
                const block = this.getBlockByName(decodeURIComponent(matches[2]));
                if(block){
                    const show = action === 'toggle' ? void 0 : action !== 'hide';
                    block.toggleVisibility(show);
                }
                evt.preventDefault();
            }
            // scenario link.
            else if((matches = link.hash.match(/^#scenario=(.+)$/))){
                const scenario_id = decodeURIComponent(matches[1]);
                const scenario = this.getScenarios().find((s) => s.getId() === scenario_id);
                if(scenario){
                    this.setActiveScenario(scenario);
                }
                evt.preventDefault();
            }
            // fullscreen link.
            else if((matches = link.hash.match(/^#(enter|exit|toggle)Fullscreen$/))){
                const action = matches[1];
                const enter = action === 'toggle' ? !document.fullscreenElement : action !== 'exit';
                if (enter) {
                    document.documentElement.requestFullscreen();
                }
                else {
                    document.exitFullscreen();
                }
                evt.preventDefault();
            }
        }
        else{
            window.open(link.href, '_blank');
            evt.preventDefault();
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
        this.stylesheet = new StyleSheet()
            .setInternalValue(this.data.css)
            .appendTo(document.head);

        // Set width & height.
        this.setDimentions(this.data.width, this.data.height);

        // Set media.
        this.setSource(this.data.media);

        this.addDelegate('.metaScore-component', 'propchange', this.onComponentPropChange.bind(this));

        // Add components.
        if(this.data.components){
            this.data.components.forEach((component) => {
                switch(component.type){
                    case 'Scenario':
                        this.addScenario(component);
                        break;
                }
            });
        }

        // Set active scenario.
        let scenario = null;
        const scenarios = this.getScenarios();
        if(scenarios.length > 0){
            scenario = scenarios[0];
        }
        else{
            // Add a default scenario if none exist.
            scenario = this.addScenario({
                'name': Locale.t('Player.defaultScenarioName', 'Scenario 1')
            });
        }
        this.setActiveScenario(scenario);

        this.updateBlockTogglers();

        // Make the player rescale to fit available space.
        if(this.configs.responsive){
            this.adaptScale = this.adaptScale.bind(this);
            Dom.addListener(window, 'resize', this.adaptScale);
            Dom.addListener(window, 'orientationchange', this.adaptScale);
            this.adaptScale();
        }

        // Add keyboard listener.
        if(this.configs.keyboard){
            this.addListener('keydown', this.onKeydown.bind(this));
        }

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
     * Get the data of the loaded guide
     *
     * @param {String} [key] An optional data key
     * @return {Object} The value corresponding to the key, or the entire JSON data
     */
    getGuideData(key){
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
    getGuideId() {
        return this.getGuideData('id');
    }

    /**
     * Get the revision id of the loaded guide
     *
     * @return {String} The revision id
     */
    getGuideRevision() {
        return this.getGuideData('vid');
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
     * Get the width and height
     *
     * @return {Object} Object with width and height keys.
     */
    getDimentions(){
        return {
            'width': this.getGuideData('width'),
            'height': this.getGuideData('height')
        };
    }

    /**
     * Set the width and height
     *
     * @param {Number} width The width
     * @param {Number} height The height
     * @param {Boolean} [supressEvent=false] Whether to supress the dimentionsset event
     * @return {this}
     */
    setDimentions(width, height, supressEvent){
        // Update values in data object.
        this.data.width = width;
        this.data.height = height;

        // Update style.
        this.css('width', `${width}px`);
        this.css('height', `${height}px`);

        // Trigger event.
        if(supressEvent !== true){
            this.triggerEvent('dimentionsset', {'player': this, 'width': width, 'height': height});
        }

        return this;
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
     * Add a Scenario component
     *
     * @param {Object} configs The configurations to send to the Scenario class
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event or not
     * @return {Scenario} The component
     */
    addScenario(configs, supressEvent){
        let component = configs;
        const existing = component instanceof Component;

        if(existing){
            component.appendTo(this);
        }
        else{
            if(!('id' in component)){
                // Generate a user-freindly ID.
                let next_id = 1;
                this.getScenarios().forEach((s) => {
                    const id = parseInt(s.getId().replace('scenario-', ''), 10);
                    if(!isNaN(id)){
                        next_id = Math.max(next_id, id + 1);
                    }
                });

                component.id = `scenario-${next_id}`;
            }

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
     * @param {Scenario} scenario The scenario
     * @param {Boolean} [supressEvent=false] Whether to supress the scenariochange event or not
     * @return {this}
     */
    setActiveScenario(scenario, supressEvent){
        const previous_scenario = this.getActiveScenario();

        if(scenario !== previous_scenario){
            if(previous_scenario){
                previous_scenario.deactivate();
            }

            if(scenario){
                scenario.activate();
                this.updateBlockTogglers();
            }

            if(supressEvent !== true){
                this.triggerEvent('scenariochange', {'player': this, 'scenario': scenario, 'previous': previous_scenario}, true, false);
            }
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
        this.stylesheet.setInternalValue(value);

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
     * @param {String} [scenarioId] The id of the scenario to go to while playing
     * @return {this}
     */
    play(inTime, outTime, scenarioId){
        const renderer = this.getRenderer();

        if(this.cuepoint){
            this.cuepoint.deactivate();
        }

        const _inTime = parseFloat(inTime);
        const _outTime = parseFloat(outTime);

        if(isNaN(_inTime) && isNaN(outTime)){
            renderer.play();
        }
        else{
            /**
             * The active time link's cuepoint
             * @type {CuePoint}
             */
            this.cuepoint = new CuePoint({
                'inTime': !isNaN(_inTime) ? _inTime : null,
                'outTime': !isNaN(_outTime) ? _outTime : null,
                'considerError': true
            })
            .addListener('seekout', () => {
                this.cuepoint.deactivate();
                delete this.cuepoint;
            })
            .addListener('stop', () => {
                renderer.pause();
            });

            if(scenarioId){
                const scenario = this.getScenarios().find((s) => s.getId() === scenarioId);

                if(scenario){
                    const previous_scenario = this.getActiveScenario();
                    if(scenario !== previous_scenario){
                        this.cuepoint
                            .addListener('start', () => {
                                this.setActiveScenario(scenario);
                            })
                            .addListener('seekout', () => {
                                this.setActiveScenario(previous_scenario);
                            });
                    }
                }
            }

            this.cuepoint.activate();

            if (!isNaN(_inTime)) {
                renderer.setTime(_inTime);
            }

            renderer.play();
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

    /**
     * Adapt the player's scale to fit the available space
     */
    adaptScale(){
        // Calculate the scale factor.
        const {width, height} = this.getDimentions();
        const container_el = this.parents().get(0);
        const container_width = container_el.clientWidth;
        const container_height = container_el.clientHeight;
        const scale = Math.min(1, container_width/width, container_height/height);

        // Apply scale.
        this.css('width', `${width * scale}px`);
        this.css('height', `${height * scale}px`);
        this.css('transform', `scale(${scale})`);
    }

}
