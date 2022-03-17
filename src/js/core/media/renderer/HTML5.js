import Dom from '../../Dom';
import Locale from '../../Locale';
import {isFunction} from '../../utils/Var';
import {escapeHTML} from '../../utils/String';
import Ajax from '../../Ajax';
import WaveformData from 'waveform-data';

/**
 * An HTML5 media renderer
 *
 * @emits {ready} Fired when the renderer is ready
 * @param {Object} renderer The renderer instance
 *
 * @emits {sourceset} Fired when the source is set
 * @param {Object} renderer The renderer instance
 *
 * @emits {loadedmetadata} Fired when the metadata has loaded
 * @param {Object} renderer The renderer instance
 *
 * @emits {play} Fired when the renderer starts playing
 * @param {Object} renderer The renderer instance
 *
 * @emits {pause} Fired when the renderer is paused
 * @param {Object} renderer The renderer instance
 *
 * @emits {seeking} Fired when a seek operation begins
 * @param {Object} renderer The renderer instance
 *
 * @emits {seeked} Fired when a seek operation completes
 * @param {Object} renderer The renderer instance
 *
 * @emits {progress} Fired as the resource loads
 * @param {Object} renderer The renderer instance
 *
 * @emits {waveformdataloaded} Fired when the waveform data has finished loading
 * @param {Object} renderer The renderer instance
 * @param {Mixed} data The waveformdata instance, or null
 */
export default class HTML5 extends Dom {

    static defaults = {
        'tag': 'audio'
    };

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
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        /**
         * The current source
         * @type {Object}
         */
        this.source = null;

        /**
         * Whether the loadeddata event has fired
         * @type {Boolean}
         */
        this.data_loaded = false;

        /**
         * Whether the renderer is playing
         * @type {Boolean}
         */
        this.playing = false;
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
            const message = Locale.t(
                'core.media.renderer.HTML5.getDurationFromURI.error',
                'An error occured while attempting to load the media: !url',
                {'!url': escapeHTML(url)}
            );
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
        this.el = new Dom(`<${this.configs.tag}></${this.configs.tag}/>`, {'preload': 'auto'})
            .addListener('error', this.onError.bind(this), true)
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('loadeddata', this.onLoadedData.bind(this))
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

    getDom(){
        return this.dom;
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
        this.source = source;
        this.data_loaded = false;

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
                            const options = {
                                audio_context: new AudioContext(),
                                array_buffer: response,
                            };
                            WaveformData.createFromAudio(options, (err, waveform) => {
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
                message = Locale.t('core.media.renderer.HTML5.onError.aborted.msg', 'You aborted the media playback.');
                break;

            case error.MEDIA_ERR_NETWORK:
                message = Locale.t('core.media.renderer.HTML5.onError.network.msg', 'A network error caused the media download to fail.');
                break;

            case error.MEDIA_ERR_DECODE:
                message = Locale.t('core.media.renderer.HTML5.onError.decode.msg', 'The media playback was aborted due to a format problem.');
                break;

            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                message = Locale.t('core.media.renderer.HTML5.onError.not-supported.msg', 'The media could not be loaded, either because the server or network failed or because the format is not supported.');
                break;

            default:
                message = Locale.t('core.media.renderer.HTML5.onError.default.msg', 'An unknown error occurred.');
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
     * The loadeddata event handler
     *
     * @private
     */
    onLoadedData() {
        this.data_loaded = true;
    }

    /**
     * The play event handler
     *
     * @private
     */
    onPlay(evt) {
        this.playing = true;

        this.triggerEvent('play', {'renderer': this});

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
    play(set_loaded_flag = true) {
        if (set_loaded_flag && !this.data_loaded) {
            /**
             * Flag used for the iOS workaround in setTime.
             * @type {Boolean}
             */
            this._play_after_loadeddata = true;
        }

        const promise = this.dom.play();

        if (typeof promise !== "undefined") {
            promise
                .then(() => {
                    delete this._play_after_loadeddata;
                })
                .catch((error) => {
                    console.error(error);
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

        delete this._play_after_loadeddata;

        return this;
    }

    /**
     * Stop the media
     *
     * @return {this}
     */
    stop() {
        this.pause().setTime(0);

        return this;
    }

    /**
     * Set the media time
     *
     * @param {Number} time The time in seconds
     * @return {this}
     */
    setTime(time) {
        if (time > 0 && !this.data_loaded) {
            // Some iOS devices don't allow seeking
            // before data has loaded.
            this.el.addOneTimeListener('loadeddata', () => {
                this.dom.currentTime = time;

                if (this._play_after_loadeddata !== true) {
                    this.pause();
                }

                delete this._play_after_loadeddata;
            });

            // Force loading.
            this.play(false);
        } else {
            this.dom.currentTime = time;
        }

        return this;
    }

    /**
     * Get the current media time
     *
     * @return {Number} The time in seconds
     */
    getTime() {
        return this.dom.currentTime;
    }

    /**
     * Get the media's duration
     *
     * @return {Number} The duration in seconds
     */
    getDuration() {
        return this.dom.duration;
    }

    /**
     * Get the media's buffered time ranges
     *
     * @return {Array} An array of arrays, each containing a time range
     */
    getBuffered() {
        const buffered = [];

        for(let i = 0; i < this.dom.buffered.length; i++){
            const start_x = this.dom.buffered.start(i);
            const end_x = this.dom.buffered.end(i);

            buffered.push([start_x, end_x]);
        }

        return buffered;
    }

}
