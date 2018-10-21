import Dom from '../../core/Dom';
import {isFunction} from '../../core/utils/Var';
import {toCentiseconds, toSeconds} from '../../core/utils/Media';
import Ajax from '../../core/Ajax';
import WaveformData from 'waveform-data/waveform-data';
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

/**
 * An HTML5 media renderer
 */
export default class HTML5 extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [type='audio'] The media type (audio or video)
     */
    constructor(configs){
        // call parent constructor
        super('<div/>', {'class': 'metaScore-renderer'});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * Whether the renderer is playing
         * @type {Boolean}
         */
        this.playing = false;
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'type': 'audio'
        };
    }

    /**
     * Check whether the renderer supports a given mime type
     *
     * @param {String} mime The mime type
     * @return {Boolean} Whether the renderer supports the given mime type
     */
    static canPlayType(mime){
        const audio = new Audio();
        return audio.canPlayType(mime);
    }

    /**
     * Get the duration of a media file from its URI
     *
     * @param {String} url The file's URL
     * @param {Function} callback The callback to invoke with a potential error and the duration
     */
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

    /**
     * Initialize
     */
    init(){
        this.addClass('html5');

        /**
         * The <video> or <audio> element
         * @type {Dom}
         */
        this.el = new Dom(`<${this.configs.type}></${this.configs.type}/>`, {'preload': 'auto'})
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('play', this.onPlay.bind(this))
            .addListener('pause', this.onPause.bind(this))
            .addListener('seeking', this.onSeeking.bind(this))
            .addListener('seeked', this.onSeeked.bind(this))
            .appendTo(this);

        /**
         * The HTMLVideoElement or HTMLAudioElement
         * @type {HTMLVideoElement|HTMLAudioElement}
         */
        this.dom = this.el.get(0);

        this.triggerEvent(EVT_READY, {'renderer': this}, false, false);

        return this;
    }

    /**
    * Set the media source
    *
    * @method setSource
    * @param {Object} source The source to set
    * @property {String} url The source's url
    * @property {String} mime The source's mime type
    * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
    * @chainable
    */
    setSource(source, supressEvent){
        /**
         * The current source
         * @type {Object}
         */
        this.source = source;

        delete this.waveformdata;
        if(this._waveformdata_ajax){
            this._waveformdata_ajax.abort();
            delete this._waveformdata_ajax;
        }

        const source_tags = `<source src="${this.source.url}" type="${this.source.mime}"></source>`;
        this.el.text(source_tags);

        this.dom.load();

        if(supressEvent !== true){
            this.triggerEvent(EVT_SOURCESET, {'renderer': this});
        }

        return this;
    }

    /**
    * Get the media source
    *
    * @return {Object} The source
    */
    getSource(){
        return this.source;
    }

   /**
   * Get the WaveformData assiciated with the media file
   *
   * @param {Function} callback The callback to invoke
   */
    getWaveformData(callback){
        if(this.waveformdata){
            callback(this.waveformdata);
            return;
        }

        if(!this._waveformdata_ajax){
            const source = this.getSource();

            if(source){
                const from_web_audio = !('audiowaveform' in source);

                /**
                 * The ajax instance used to load the waveform data
                 * @type {Ajax}
                 */
                this._waveformdata_ajax = Ajax.GET(from_web_audio ? source.url : source.audiowaveform, {
                    'responseType': 'arraybuffer',
                    'onSuccess': (evt) => {
                        const response = evt.target.getResponse();

                        if(!response){
                            /**
                             * The associated waveform data
                             * @type {WaveformData}
                             */
                            this.waveformdata = null;
                            this.triggerEvent(EVT_WAVEFORMDATALOADED, {'renderer': this, 'data': this.waveformdata});
                            delete this._waveformdata_ajax;
                            return;
                        }

                        if(from_web_audio){
                            const context = new AudioContext();
                            WebAudioBuilder(context, response, (err, waveform) => {
                                this.waveformdata = err ? null : waveform;
                                this.triggerEvent(EVT_WAVEFORMDATALOADED, {'renderer': this, 'data': this.waveformdata});
                                delete this._waveformdata_ajax;
                            });
                        }
                        else{
                            this.waveformdata = WaveformData.create(response);
                            this.triggerEvent(EVT_WAVEFORMDATALOADED, {'renderer': this, 'data': this.waveformdata});
                            delete this._waveformdata_ajax;
                        }
                    },
                    'onError': (evt) => {
                        console.error(evt.target.getStatusText());
                        this.waveformdata = null;
                        this.triggerEvent(EVT_WAVEFORMDATALOADED, {'renderer': this, 'data': this.waveformdata});
                        delete this._waveformdata_ajax;
                    }
                });
            }
        }

        if(this._waveformdata_ajax){
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

}
