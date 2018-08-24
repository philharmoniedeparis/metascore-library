import HTML5 from './HTML5';
import Dom from '../../core/Dom';

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
 * YouTube renderer
 */
export default class YouTube extends HTML5 {

    static canPlayType(mime){
        const supported = [
            'video/youtube'
        ];

        return supported.includes(mime.toLowerCase());
    }

    static getVideoIDFromURL(url){
        const parsed = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);

        if(parsed[2] !== undefined){
            return parsed[2].split(/[^0-9a-z_-]/i)[0];
        }

        return parsed[0];
    }

    init(){
        this.addClass('youtube');

        const script = document.createElement("script")
        script.type = "text/javascript";

        window.onYouTubeIframeAPIReady = () => {
            delete window.onYouTubeIframeAPIReady;
            this.ready = true;
            this.triggerEvent(EVT_READY, {'renderer': this}, false, false);
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

    setSource(source, supressEvent){
        const video_id = this.constructor.getVideoIDFromURL(source.url);
        const wrapper = new Dom('<div/>', {'class': 'iframe-wrapper'})
            .appendTo(this);

        // add a poster to hide the large red play button
        this.poster = new Dom('<div/>', {'class': 'poster'})
            .css('background-image', `url('//img.youtube.com/vi/${video_id}/sddefault.jpg')`)
            .appendTo(this);

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
            this.triggerEvent(EVT_SOURCESET, {'renderer': this});
        }

        return this;
    }

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
     * @method onPlay
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
     * @method isPlaying
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
        return this.dom.getPlayerState() === window.YT.PlayerState.PLAYING;
    }

    /**
     * Play the media
     *
     * @method play
     * @chainable
     */
    play() {
        this.dom.playVideo();

        return this;
    }

    /**
     * Pause the media
     *
     * @method pause
     * @chainable
     */
    pause() {
        this.dom.pauseVideo();

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
        this.dom.seekTo(time);

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
        return this.dom.getCurrentTime();
    }

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return this.dom.getDuration();
    }

}
