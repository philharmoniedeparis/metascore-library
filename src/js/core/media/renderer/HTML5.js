import Dom from '../../Dom';
import Locale from '../../Locale';
import {isFunction} from '../../utils/Var';
import {toCentiseconds, toSeconds} from '../../utils/Media';
import Ajax from '../../Ajax';
import WaveformData from 'waveform-data/waveform-data';
import WebAudioBuilder from 'waveform-data/webaudio';

/**
 * An HTML5 media renderer
 *
 * @emits {ready} Fired when the renderer is ready
 * @param {Object} renderer The renderer instance
 * @emits {sourceset} Fired when the source is set
 * @param {Object} renderer The renderer instance
 * @emits {loadedmetadata} Fired when the metadata has loaded
 * @param {Object} renderer The renderer instance
 * @emits {play} Fired when the renderer starts playing
 * @param {Object} renderer The renderer instance
 * @emits {pause} Fired when the renderer is paused
 * @param {Object} renderer The renderer instance
 * @emits {seeking} Fired when a seek operation begins
 * @param {Object} renderer The renderer instance
 * @emits {seeked} Fired when a seek operation completes
 * @param {Object} renderer The renderer instance
 * @emits {progress} Fired as the resource loads
 * @param {Object} renderer The renderer instance
 * @emits {timeupdate} Fired when the renderer's time changed
 * @param {Object} renderer The renderer instance
 * @emits {waveformdataloaded} Fired when the waveform data has finished loading
 * @param {Object} renderer The renderer instance
 * @param {Mixed} data The waveformdata instance, or null
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

        // @todo: replace with promises to eliminate the propability of both an error and a success being called

        audio.addEventListener('error', () => {
            const message = Locale.t('player.renderer.HTML5.getDurationFromURI.error', 'An error occured while attempting to load the media: !url', {'!url': url});
            callback(new Error(message));
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
        this
            .setupUI()
            .addClass('html5')
            .triggerEvent('ready', {'renderer': this}, false, false);

        return this;
    }

    /**
     * Setup the renderer's UI
     *
     * @private
     * @return {this}
     */
    setupUI() {
        /**
         * The <video> or <audio> element
         * @type {Dom}
         */
        this.el = new Dom(`<${this.configs.type}></${this.configs.type}/>`, {'preload': 'auto'})
            .addListener('error', this.onError.bind(this), true)
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('play', this.onPlay.bind(this))
            .addListener('pause', this.onPause.bind(this))
            .addListener('seeking', this.onSeeking.bind(this))
            .addListener('seeked', this.onSeeked.bind(this))
            .addListener('progress', this.onProgress.bind(this))
            .appendTo(this);

        /**
         * The HTMLVideoElement or HTMLAudioElement
         * @type {HTMLVideoElement|HTMLAudioElement}
         */
        this.dom = this.el.get(0);

        return this;
    }

    /**
    * Set the media source
    *
    * @param {Object} source The source to set
    * @property {String} url The source's url
    * @property {String} mime The source's mime type
    * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
    * @return {this}
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

        this.el.attr('src', this.source.url);

        this.dom.load();

        if(supressEvent !== true){
            this.triggerEvent('sourceset', {'renderer': this});
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
                            this.triggerEvent('waveformdataloaded', {'renderer': this, 'data': this.waveformdata});
                            delete this._waveformdata_ajax;
                            return;
                        }

                        if(from_web_audio){
                            const context = new AudioContext();
                            WebAudioBuilder(context, response, (err, waveform) => {
                                this.waveformdata = err ? null : waveform;
                                this.triggerEvent('waveformdataloaded', {'renderer': this, 'data': this.waveformdata});
                                delete this._waveformdata_ajax;
                            });
                        }
                        else{
                            this.waveformdata = WaveformData.create(response);
                            this.triggerEvent('waveformdataloaded', {'renderer': this, 'data': this.waveformdata});
                            delete this._waveformdata_ajax;
                        }
                    },
                    'onError': () => {
                        this.waveformdata = null;
                        this.triggerEvent('waveformdataloaded', {'renderer': this, 'data': this.waveformdata});
                        delete this._waveformdata_ajax;
                    }
                });
            }
        }

        if(this._waveformdata_ajax){
            this.addOneTimeListener('waveformdataloaded', (evt) => {
                callback(evt.detail.data);
            });
        }
        else{
            callback(null);
        }
    }

    /**
     * The error event handler
     *
     * @private
     */
    onError(evt) {
        const error = evt.target.error;
        let message = '';

        switch(error.code) {
            case error.MEDIA_ERR_ABORTED:
                message = Locale.t('player.renderer.HTML5.onError.aborted.msg', 'You aborted the media playback.');
                break;

            case error.MEDIA_ERR_NETWORK:
                message = Locale.t('player.renderer.HTML5.onError.network.msg', 'A network error caused the media download to fail.');
                break;

            case error.MEDIA_ERR_DECODE:
                message = Locale.t('player.renderer.HTML5.onError.decode.msg', 'The media playback was aborted due to a format problem.');
                break;

            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                message = Locale.t('player.renderer.HTML5.onError.not-supported.msg', 'The media could not be loaded, either because the server or network failed or because the format is not supported.');
                break;

            default:
                message = Locale.t('player.renderer.HTML5.onError.default.msg', 'An unknown error occurred.');
                break;
        }

        this.triggerEvent('error', {'renderer': this, 'message': message});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The loadedmetadata event handler
     *
     * @private
     */
    onLoadedMetadata(evt) {
        this.triggerEvent('loadedmetadata', {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The play event handler
     *
     * @private
     */
    onPlay(evt) {
        this.playing = true;

        this.triggerEvent('play', {'renderer': this});

        this.triggerTimeUpdate();

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The pause event handler
     *
     * @private
     */
    onPause(evt) {
        this.playing = false;

        this.triggerEvent('pause', {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The seeking event handler
     *
     * @private
     */
    onSeeking(evt){
        this.triggerEvent('seeking', {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The seeked event handler
     *
     * @private
     */
    onSeeked(evt){
        this.triggerEvent('seeked', {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * The progress event handler
     *
     * @private
     */
    onProgress(evt){
        this.triggerEvent('progress', {'renderer': this});

        if(isFunction(evt.stopPropagation)){
            evt.stopPropagation();
        }
    }

    /**
     * Check whether the media is playing
     *
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
        return this.playing;
    }

    /**
     * Play the media
     *
     * @return {this}
     */
    play() {
        const promise = this.dom.play();

        if (typeof promise !== "undefined") {
          promise.catch(() => {
            console.warn('Play was prevented by the browser. If using the metaScore API, make sure to add allow="autoplay" to the player\'s iframe. See https://github.com/w3c/webappsec-feature-policy/blob/master/features.md for more information.');
          });
        }

        return this;
    }

    /**
     * Pause the media
     *
     * @return {this}
     */
    pause() {
        this.dom.pause();

        return this;
    }

    /**
     * Trigger the timeupdate event
     *
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @return {this}
     */
    triggerTimeUpdate(loop) {
        if(loop !== false && this.isPlaying()){
            window.requestAnimationFrame(this.triggerTimeUpdate.bind(this));
        }

        this.triggerEvent('timeupdate', {'renderer': this, 'time': this.getTime()});

        return this;
    }

    /**
     * Set the media time
     *
     * @param {Number} time The time in centiseconds
     * @return {this}
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
     * @return {Number} The time in centiseconds
     */
    getTime() {
        return toCentiseconds(this.dom.currentTime);
    }

    /**
     * Get the media's duration
     *
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return toCentiseconds(this.dom.duration);
    }

    /**
     * Get the media's buffered time ranges
     *
     * @return {Array} An array of arrays, each containing a time range
     */
    getBuffered() {
        const buffered = [];

        for(let i = 0; i < this.dom.buffered.length; i++){
            const start_x = toCentiseconds(this.dom.buffered.start(i));
            const end_x = toCentiseconds(this.dom.buffered.end(i));

            buffered.push([start_x, end_x]);
        }

        return buffered;
    }

}
