import HTML5 from './HTML5';
import VimeoPlayer from '@vimeo/player';

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
 * Vimeo renderer
 */
export default class Vimeo extends HTML5 {

    static supportedTypes(){
        return [
            'video/vimeo'
        ];
    }

    setup(){
        this.addClass('vimeo');

        this.ready = true;
        this.triggerEvent(EVT_READY, {'renderer': this});
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
        this.embed = new VimeoPlayer(this.get(0), {
            'url': source.url,
            'width': '100%',
            'height': '100%'
        });

        this.embed.on('loaded', this.onLoadedMetadata.bind(this));
        this.embed.on('play', this.onPlay.bind(this));
        this.embed.on('pause', this.onPause.bind(this));
        this.embed.on('timeupdate', this.onTimeUpdate.bind(this));
        this.embed.on('seeking', this.onSeeking.bind(this));
        this.embed.on('seeked', this.onSeeked.bind(this));

        if(supressEvent !== true){
            this.triggerEvent(EVT_SOURCESET, {'renderer': this});
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
        return this.playing;
    }

    /**
     * Play the media
     *
     * @method play
     * @chainable
     */
    play() {
        this.embed.play();

        return this;
    }

    /**
     * Pause the media
     *
     * @method pause
     * @chainable
     */
    pause() {
        this.embed.pause();

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
        this.embed.setCurrentTime(time);

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
        this.embed.getCurrentTime().then((value) => {
            this.currentTime = value;
        });

        return this.currentTime;
    }

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return 0;
    }

}
