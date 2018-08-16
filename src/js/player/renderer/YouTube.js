import Renderer from '../Renderer';
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

let API_LOADED = false;

/**
 * YouTube renderer
 */
export default class YouTube extends Renderer {

    static supportedTypes(){
        return [
            'video/youtube'
        ];
    }

    static getVideoIDFromURL(url){
        const parsed = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);

        if(parsed[2] !== undefined){
            return parsed[2].split(/[^0-9a-z_-]/i)[0];
        }

        return parsed[0];
    }

    setup(){
        this.addClass('youtube');

        this.triggerEvent(EVT_READY, {'renderer': this});
    }

    setSource(source, supressEvent){
        if(!API_LOADED){
            const script = document.createElement("script")
            script.type = "text/javascript";

            window.onYouTubeIframeAPIReady = () => {
                API_LOADED = true;

                this.setSource(source, supressEvent);
            };

            script.addEventListener('load', () => {
                script.remove();
            });

            script.addEventListener('error', () => {
                script.remove();
            });

            script.async = true;
            script.src = 'https://www.youtube.com/player_api';

            document.head.appendChild(script);
        }
        else{
            /* global YT */
            const container = new Dom(`<div/>`)
                .appendTo(this);

            this.embed = new YT.Player(container.get(0), {
                'videoId': this.constructor.getVideoIDFromURL(source.url),
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
                    'onStateChange': (evt) => {
                        switch (evt.data) {
                            case YT.PlayerState.PLAYING:
                                this.onPlay(evt);
                                break;

                            case YT.PlayerState.PAUSED:
                                this.onPause(evt);
                                break;
                        }
                    }
                }
            });
            //this.embed.on('timeupdate', this.onTimeUpdate.bind(this));
            //this.embed.on('seeking', this.onSeeking.bind(this));
            //this.embed.on('seeked', this.onSeeked.bind(this));

            if(supressEvent !== true){
                this.triggerEvent(EVT_SOURCESET, {'renderer': this});
            }
        }

        return this;
    }

    /**
     * Check whether the media is playing
     *
     * @method isPlaying
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
        return API_LOADED && this.embed && this.embed.getPlayerState() === YT.PlayerState.PLAYING;
    }

    /**
     * Play the media
     *
     * @method play
     * @chainable
     */
    play() {
        this.embed.playVideo();

        return this;
    }

    /**
     * Pause the media
     *
     * @method pause
     * @chainable
     */
    pause() {
        this.embed.pauseVideo();

        return this;
    }

    /**
     * Set the media time
     *
     * @method setTime
     * @param {Number} time The time in centiseconds
     * @chainable
     */
    setTime() {
        //this.embed.seekTo(time);

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
        return this.embed.getCurrentTime();
    }

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return this.embed.getDuration();
    }

}
