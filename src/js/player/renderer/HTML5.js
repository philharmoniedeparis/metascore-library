import Dom from '../../core/Dom';
import {isFunction} from '../../core/utils/Var';
import {toCentiseconds, toSeconds} from '../../core/utils/Media';
import Ajax from '../../core/Ajax';
import WebAudioBuilder from 'waveform-data/webaudio';

/**
 * Fired when the renderer is ready
 *
 * @event ready
 * @param {Object} renderer The renderer instance
 */
const EVT_READY = 'ready';

/**
* Fired when the source is set
*
* @event sourceset
* @param {Object} renderer The renderer instance
*/
const EVT_SOURCESET = 'sourceset';

/**
 * Fired when the metadata has loaded
 *
 * @event loadedmetadata
 * @param {Object} renderer The renderer instance
 */
const EVT_LOADEDMETADATA = 'loadedmetadata';

/**
 * Fired when the renderer starts playing
 *
 * @event play
 * @param {Object} renderer The renderer instance
 */
const EVT_PLAY = 'play';

/**
 * Fired when the renderer is paused
 *
 * @event pause
 * @param {Object} renderer The renderer instance
 */
const EVT_PAUSE = 'pause';

/**
 * Fired when a seek operation begins
 *
 * @event seeking
 * @param {Object} renderer The renderer instance
 */
const EVT_SEEKING = 'seeking';

/**
 * Fired when a seek operation completes
 *
 * @event seeked
 * @param {Object} renderer The renderer instance
 */
const EVT_SEEKED = 'seeked';

/**
 * Fired when the renderer's time changed
 *
 * @event timeupdate
 * @param {Object} renderer The renderer instance
 */
const EVT_TIMEUPDATE = 'timeupdate';

/**
 * Fired when the waveform data has finished loading
 *
 * @event waveformdataloaded
 * @param {Object} renderer The renderer instance
 * @param {Mixed} data The waveformdata instance, or null
 */
const EVT_WAVEFORMDATALOADED = 'waveformdataloaded';

export default class HTML5 extends Dom {

    /**
     * A media renderer
     *
     * @class Renderer
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    constructor(configs){
        // call parent constructor
        super('<div/>', {'class': 'metaScore-renderer'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.playing = false;
    }

    static getDefaults(){
        return {};
    }

    static canPlayType(mime){
        const audio = new Audio();
        return audio.canPlayType(mime);
    }

    static getDurationFromURI(url, callback){
        const audio = new Audio();

        audio.addEventListener('error', () => {
            callback(new Error(`An error occured while attempting to load the media: ${url}`));
        });

        audio.addEventListener('loadedmetadata', () => {
            callback(null, audio.duration);
        });

        audio.src = url;
    }

    init(){
        this.addClass('html5');

        this.el = new Dom(`<${this.configs.type}></${this.configs.type}/>`, {'preload': 'auto'})
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('play', this.onPlay.bind(this))
            .addListener('pause', this.onPause.bind(this))
            .addListener('seeking', this.onSeeking.bind(this))
            .addListener('seeked', this.onSeeked.bind(this))
            .appendTo(this);

        this.dom = this.el.get(0);

        this.triggerEvent(EVT_READY, {'renderer': this}, false, false);

        return this;
    }

    /**
    * Set the media source
    *
    * @method setSource
    * @param {Array} sources The list of sources as objects with 'url' and 'mime' keys
    * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
    * @chainable
    */
    setSource(source, supressEvent){
        const source_tags = `<source src="${source.url}" type="${source.mime}"></source>`;

        delete this.waveformdata;
        if(this.waveformdata_ajax){
            this.waveformdata_ajax.abort();
            delete this.waveformdata_ajax;
        }

        this.el.text(source_tags);

        this.dom.load();

        if(supressEvent !== true){
            this.triggerEvent(EVT_SOURCESET, {'renderer': this});
        }

        return this;
    }

    getSource(){
        if(this.dom){
            return this.dom.currentSrc;
        }

        return null;
    }

    getWaveformData(callback){
        if(this.waveformdata){
            callback(this.waveformdata);
            return;
        }

        if(!this.waveformdata_ajax){
            const src = this.getSource();

            if(src){
                this.waveformdata_ajax = Ajax.GET(src, {
                    'responseType': 'arraybuffer',
                    'onSuccess': (evt) => {
                        const context = new AudioContext();
                        const response = evt.target.getResponse();

                        WebAudioBuilder(context, response, (err, waveform) => {
                            this.waveformdata = err ? null : waveform;
                            this.triggerEvent(EVT_WAVEFORMDATALOADED, {'renderer': this, 'data': this.waveformdata});
                            delete this.waveformdata_ajax;
                        });
                    },
                    'onError': (evt) => {
                        console.error(evt.target.getStatusText());
                        this.waveformdata = null;
                        this.triggerEvent(EVT_WAVEFORMDATALOADED, {'renderer': this, 'data': this.waveformdata});
                        delete this.waveformdata_ajax;
                    }
                });
            }
        }

        if(this.waveformdata_ajax){
            this.addOneTimeListener(EVT_WAVEFORMDATALOADED, (evt) => {
                callback(evt.detail.data);
            });
        }
        else{
            callback(null);
        }
    }

    /**
     * The loadedmetadata event handler
     *
     * @method onLoadedMetadata
     * @private
     */
    onLoadedMetadata(evt) {
        this.triggerEvent(EVT_LOADEDMETADATA, {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The play event handler
     *
     * @method onPlay
     * @private
     */
    onPlay(evt) {
        this.playing = true;

        this.triggerEvent(EVT_PLAY, {'renderer': this});

        this.triggerTimeUpdate();

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The pause event handler
     *
     * @method onPause
     * @private
     */
    onPause(evt) {
        this.playing = false;

        this.triggerEvent(EVT_PAUSE, {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The seeking event handler
     *
     * @method onSeeking
     * @private
     */
    onSeeking(evt){
        this.triggerEvent(EVT_SEEKING, {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The seeked event handler
     *
     * @method onSeeked
     * @private
     */
    onSeeked(evt){
        this.triggerEvent(EVT_SEEKED, {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * Check whether the media is playing
     *
     * @method isPlaying
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
        return this.playing;
    }

    /**
     * Play the media
     *
     * @method play
     * @chainable
     */
    play() {
        this.dom.play();

        return this;
    }

    /**
     * Pause the media
     *
     * @method pause
     * @chainable
     */
    pause() {
        this.dom.pause();

        return this;
    }

    /**
     * Trigger the timeupdate event
     *
     * @method triggerTimeUpdate
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @chainable
     */
    triggerTimeUpdate(loop) {
        if(loop !== false && this.isPlaying()){
            window.requestAnimationFrame(this.triggerTimeUpdate.bind(this));
        }

        this.triggerEvent(EVT_TIMEUPDATE, {'renderer': this, 'time': this.getTime()});

        return this;
    }

    /**
     * Set the media time
     *
     * @method setTime
     * @param {Number} time The time in centiseconds
     * @chainable
     */
    setTime(time) {
        this.dom.currentTime = toSeconds(time);

        if(!this.isPlaying()){
            this.triggerTimeUpdate(false);
        }

        return this;
    }

    /**
     * Get the current media time
     *
     * @method getTime
     * @return {Number} The time in centiseconds
     */
    getTime() {
        return toCentiseconds(this.dom.currentTime);
    }

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return toCentiseconds(this.dom.duration);
    }

    remove(){
        super.remove();
    }

}
