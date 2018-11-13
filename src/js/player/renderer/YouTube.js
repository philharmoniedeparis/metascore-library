import HTML5 from './HTML5';
import Dom from '../../core/Dom';
import {toCentiseconds, toSeconds} from '../../core/utils/Media';

/**
 * YouTube renderer
 *
 * @emits {ready} Fired when the renderer is ready
 * @param {Object} renderer The renderer instance
 * @emits {sourceset} Fired when the source is set
 * @param {Object} renderer The renderer instance
 */
export default class YouTube extends HTML5 {

    /**
     * Check whether the renderer supports a given mime type
     *
     * @param {String} mime The mime type
     * @return {Boolean} Whether the renderer supports the given mime type
     */
    static canPlayType(mime){
        const supported = [
            'video/youtube'
        ];

        return supported.includes(mime.toLowerCase());
    }

    /**
     * Get the YouTube ID from a URL
     *
     * @param {String} url The video's URL
     * @return {String} The parsed YouTube ID
     */
    static getVideoIDFromURL(url){
        const parsed = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);

        if(typeof parsed[2] !== "undefined"){
            return parsed[2].split(/[^0-9a-z_-]/i)[0];
        }

        return parsed[0];
    }

    /**
     * Initialize
     */
    init(){
        this.addClass('youtube');

        const script = document.createElement("script")
        script.type = "text/javascript";

        window.onYouTubeIframeAPIReady = () => {
            delete window.onYouTubeIframeAPIReady;
            this.triggerEvent('ready', {'renderer': this}, false, false);
        };

        script.addEventListener('load', () => {
            script.remove();
        });

        script.addEventListener('error', () => {
            script.remove();
        });

        script.async = true;
        script.src = '//www.youtube.com/player_api';

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
        const video_id = this.constructor.getVideoIDFromURL(source.url);
        const wrapper = new Dom('<div/>', {'class': 'iframe-wrapper'})
            .appendTo(this);

        /**
         * A poster to hide the large red play button
         * @type {Dom}
         */
        this.poster = new Dom('<div/>', {'class': 'poster'})
            .css('background-image', `url('//img.youtube.com/vi/${video_id}/sddefault.jpg')`)
            .appendTo(this);

        /**
         * The YouTube player instance
         * @type {YT.Player}
         */
        this.dom = new window.YT.Player(wrapper.get(0), {
            'videoId': video_id,
            'width': '100%',
            'height': '100%',
            'playerVars': {
                'controls': 0,
                'disablekb': 1,
                'rel': 0,
                'showinfo': 0,
                'modestbranding': 1
            },
            'events': {
                'onReady': this.onLoadedMetadata.bind(this),
                'onStateChange': this.onStateChange.bind(this)
            }
        });
        //this.dom.on('seeking', this.onSeeking.bind(this));
        //this.dom.on('seeked', this.onSeeked.bind(this));

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
     * The statechange event handler
     *
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onStateChange(evt){
        switch (evt.data) {
            case window.YT.PlayerState.PLAYING:
                this.onPlay(evt);
                break;

            case window.YT.PlayerState.PAUSED:
                this.onPause(evt);
                break;
        }
    }

    /**
     * The play event handler
     *
     * @private
     */
    onPlay(...args) {
        if(this.poster){
            // remove the poster as it is no longer needed
            this.poster.remove();
            delete this.poster;
        }

        super.onPlay(...args);
    }

    /**
     * Check whether the media is playing
     *
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
        return this.dom.getPlayerState() === window.YT.PlayerState.PLAYING;
    }

    /**
     * Play the media
     *
     * @return {this}
     */
    play() {
        this.dom.playVideo();

        return this;
    }

    /**
     * Pause the media
     *
     * @return {this}
     */
    pause() {
        this.dom.pauseVideo();

        return this;
    }

    /**
     * Set the media time
     *
     * @param {Number} time The time in centiseconds
     * @return {this}
     */
    setTime(time) {
        this.dom.seekTo(toSeconds(time));

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
        return toCentiseconds(this.dom.getCurrentTime());
    }

    /**
     * Get the media's duration
     *
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return toCentiseconds(this.dom.getDuration());
    }

}
