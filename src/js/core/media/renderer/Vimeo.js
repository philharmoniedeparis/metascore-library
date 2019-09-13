import HTML5 from './HTML5';
import Dom from '../../Dom';
import Ajax from '../../Ajax';
import {toCentiseconds, toSeconds} from '../../utils/Media';

/**
 * Vimeo renderer
 *
 * @emits {ready} Fired when the renderer is ready
 * @param {Object} renderer The renderer instance
 * @emits {sourceset} Fired when the source is set
 * @param {Object} renderer The renderer instance
 * @emits {timeupdate} Fired when the renderer's time changed
 * @param {Object} renderer The renderer instance
 */
export default class Vimeo extends HTML5 {

    /**
     * Check whether the renderer supports a given mime type
     *
     * @param {String} mime The mime type
     * @return {Boolean} Whether the renderer supports the given mime type
     */
    static canPlayType(mime){
        const supported = [
            'video/vimeo'
        ];

        return supported.includes(mime.toLowerCase());
    }

    /**
     * Get the Vimeo ID from a URL
     *
     * @param {String} url The video's URL
     * @return {String} The parsed Vimeo ID
     */
    static getVideoIDFromURL(url){
        const parsed = url.match(/https?:\/\/(?:[\w]+\.)*vimeo\.com(?:[/\w]*\/?)?\/([0-9]+)[^\s]*/);

        return parsed[1];
    }

    /**
     * Get the duration of a media file from its URI
     *
     * @param {String} url The file's URL
     * @param {Function} callback The callback to invoke with a potential error and the duration
     */
    static getDurationFromURI(url, callback){
        const video_id = this.getVideoIDFromURL(url);

        Ajax.GET(`https://api.vimeo.com/videos/${video_id}`, {
            'responseType': 'json',
            'onSuccess': (evt) => {
                const data = evt.target.getResponse();
                callback(null, data.duration);
            },
            'onError': () => {
                callback(new Error(`An error occured while fetching video data from vimeo for: ${video_id}`));
            }
        });
    }

    /**
     * Initialize
     */
    init(){
        this.addClass('vimeo');

        const script = document.createElement("script")
        script.type = "text/javascript";

        script.addEventListener('load', () => {
            script.remove();
            this.triggerEvent('ready', {'renderer': this}, false, false);
        });

        script.addEventListener('error', () => {
            script.remove();
        });

        script.async = true;
        script.src = '//player.vimeo.com/api/player.js';

        document.head.appendChild(script);

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
        const wrapper = new Dom('<div/>', {'class': 'iframe-wrapper'})
            .appendTo(this);

        /**
         * The Vimeo player instance
         * @type {Vimeo.Player}
         */
        this.dom = new window.Vimeo.Player(wrapper.get(0), {
            'url': source.url,
            'width': '100%',
            'height': '100%',
            'portrait': false,
            'byline': false,
            'title': false
        });

        this.dom.on('loaded', this.onLoadedMetadata.bind(this));
        this.dom.on('play', this.onPlay.bind(this));
        this.dom.on('pause', this.onPause.bind(this));
        this.dom.on('seeking', this.onSeeking.bind(this));
        this.dom.on('seeked', this.onSeeked.bind(this));

        if(supressEvent !== true){
            this.triggerEvent('sourceset', {'renderer': this});
        }

        return this;
    }

   /**
   * Get the WaveformData assiciated with the media file
   *
   * @param {Function} callback The callback to invoke
   */
    getWaveformData(callback){
        callback(null);
    }

    /**
     * The loadedmetadata event handler
     *
     * @private
     */
    onLoadedMetadata(...args){
        this.dom.getDuration().then((duration) => {
            /**
             * The video's duration in seconds
             * @type {Number}
             */
            this.duration = duration;
        });

        super.onLoadedMetadata(...args);
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
     * Set the media time
     *
     * @param {Number} time The time in centiseconds
     * @return {this}
     */
    setTime(time) {
        this.dom.setCurrentTime(toSeconds(time));

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
        return toCentiseconds(this.current_time);
    }

    /**
     * Get the media's duration
     *
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return toCentiseconds(this.duration);
    }

    /**
     * Trigger the timeupdate event
     *
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @return {this}
     */
    triggerTimeUpdate(loop) {
        this.dom.getCurrentTime().then((seconds) => {
            if(loop !== false && this.isPlaying()){
                this.triggerTimeUpdate(loop);
            }

            /**
             * The video's current time in seconds
             * @type {Number}
             */
            this.current_time = seconds;
            this.triggerEvent('timeupdate', {'renderer': this, 'time': this.getTime()});
        });

        return this;
    }

}
