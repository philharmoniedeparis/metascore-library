import Dom from '../../core/Dom';
import {isFunction} from '../../core/utils/Var';

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

export default class Renderer extends Dom {

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
        return {
            'useFrameAnimation': true
        };
    }

    static supportedTypes(){
        return [
            'audio/aac',
            'audio/mp4',
            'audio/mpeg',
            'audio/ogg',
            'audio/wav',
            'audio/webm',
            'video/mp4',
            'video/ogg',
            'video/webm'
        ];
    }

    static canPlayType(mime){
        return this.supportedTypes().includes(mime);
    }

    setup(){
        this.addClass('html5');

        this.el = new Dom(`<${this.configs.type}></${this.configs.type}/>`, {'preload': 'auto'})
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('play', this.onPlay.bind(this))
            .addListener('pause', this.onPause.bind(this))
            .addListener('timeupdate', this.onTimeUpdate.bind(this))
            .addListener('seeking', this.onSeeking.bind(this))
            .addListener('seeked', this.onSeeked.bind(this))
            .appendTo(this);

        this.dom = this.el.get(0);

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
       const source_tags = `<source src="${source.url}" type="${source.mime}"></source>`;

       this.el.text(source_tags);

       this.dom.load();

       if(supressEvent !== true){
           this.triggerEvent(EVT_SOURCESET, {'renderer': this});
       }

       return this;
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

        if(this.configs.useFrameAnimation){
            this.triggerTimeUpdate();
        }

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
     * The timeupdate event handler
     *
     * @method onTimeUpdate
     * @private
     */
    onTimeUpdate(evt){
        if(!this.configs.useFrameAnimation){
            this.triggerTimeUpdate(false);
        }

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

        this.triggerEvent(EVT_TIMEUPDATE, {'renderer': this});

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
        this.dom.currentTime = time;

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
        return this.dom.currentTime;
    }

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return this.dom.duration;
    }

    remove(){
        super.remove();
    }

}
