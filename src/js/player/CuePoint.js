import EventEmitter from '../core/EventEmitter';
import {uuid} from '../core/utils/String';

/**
 * Fired when the cuepoint starts
 *
 * @event start
 */
const EVT_START = 'start';

/**
 * Fired when the cuepoint is active (between the start and end times) and the media time is updated
 *
 * @event update
 */
const EVT_UPDATE = 'update';

/**
 * Fired when the cuepoint stops
 *
 * @event stop
 */
const EVT_STOP = 'stop';

/**
 * Fired when the media is seeked outside of the cuepoint's time
 *
 * @event seekout
 */
const EVT_SEEKOUT = 'seekout';

export default class CuePoint extends EventEmitter{

    /**
     * A class for managing media cuepoints to execute actions at specific media times
     *
     * @class CuePoint
     * @namepsace player
     * @extends EventEmitter
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {player.component.Media} configs.media The media component to which the cuepoint is attached
     * @param {Number} [configs.inTime] The time at which the cuepoint starts
     * @param {Number} [configs.outTime] The time at which the cuepoint stops
     * @param {Boolean} [configs.considerError] Whether to estimate and use the error margin in timed events
     */
    constructor(configs) {
        // call parent constructor
        super();

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.id = uuid();

        this.running = false;
        this.max_error = 0;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.onMediaTimeUpdate = this.onMediaTimeUpdate.bind(this);
        this.onMediaSeeking = this.onMediaSeeking.bind(this);
        this.onMediaSeeked = this.onMediaSeeked.bind(this);
    }

    static getDefaults(){
        return {
            'media': null,
            'inTime': null,
            'outTime': null,
            'considerError': false
        };
    }

    /**
     * The media's timeupdate event handler
     *
     * @method onMediaTimeUpdate
     * @private
     */
    onMediaTimeUpdate(){
        this.update();
    }

    /**
     * The media's seeked event handler
     *
     * @method onMediaSeeked
     * @private
     */
    onMediaSeeking(){
        this.getMedia()
            .addListener('seeked', this.onMediaSeeked)
            .removeListener('timeupdate', this.onMediaTimeUpdate);
    }

    /**
     * The media's seeked event handler
     *
     * @method onMediaSeeked
     * @private
     */
    onMediaSeeked(){
        const cur_time = this.getMedia().getTime();

        this.getMedia()
            .addListener('timeupdate', this.onMediaTimeUpdate)
            .removeListener('seeked', this.onMediaSeeked);

        if(this.configs.considerError){
            // reset the max_error and the previous_time to prevent an abnormaly large max_error
            this.max_error = 0;
            this.previous_time = cur_time;
        }

        if((Math.ceil(cur_time) < this.configs.inTime) || (Math.floor(cur_time) > this.configs.outTime)){
            this.triggerEvent(EVT_SEEKOUT);
            this.stop();
        }
        else{
            this.update();
        }
    }

    /**
     * Get the media component on which this cuepoint is attached
     *
     * @method getMedia
     * @return {player.component.Media} The media component
     */
    getMedia() {
        return this.configs.media;
    }

    /**
     * Init the cuepoint
     *
     * @method init
     * @chainable
     */
    init() {
        if((this.configs.inTime !== null) || (this.configs.outTime !== null)){
            this.getMedia().addListener('timeupdate', this.onMediaTimeUpdate);
            this.update();
        }

        return this;
    }

    /**
     * Start executing the cuepoint
     *
     * @method start
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    start(supressEvent){
        if(this.running){
            return;
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_START);
        }

        this.running = true;
        this.getMedia().addListener('seeking', this.onMediaSeeking);

        this.triggerEvent(EVT_UPDATE);
    }

    /**
     * Update the cuepoint
     *
     * @method update
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    update(supressEvent){
        const cur_time = this.getMedia().getTime();

        if(!this.running){
            if(((this.configs.inTime === null) || (Math.floor(cur_time) >= this.configs.inTime)) && ((this.configs.outTime === null) || (Math.ceil(cur_time) < this.configs.outTime))){
                this.start();
            }
        }
        else{
            if(this.configs.considerError){
                if('previous_time' in this){
                    this.max_error = Math.max(this.max_error, Math.abs(cur_time - this.previous_time));
                }

                this.previous_time = cur_time;
            }

            if(supressEvent !== true){
                this.triggerEvent(EVT_UPDATE);
            }

            if((this.configs.outTime !== null) && (Math.floor(cur_time + this.max_error) >= this.configs.outTime)){
                this.stop();
            }
        }
    }

    /**
     * Stop executing the cuepoint
     *
     * @method stop
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    stop(supressEvent){
        if(!this.running){
            return;
        }

        this.getMedia().removeListener('seeking', this.onMediaSeeking);

        if(supressEvent !== true){
            this.triggerEvent(EVT_STOP);
        }

        if(this.configs.considerError){
            this.max_error = 0;
            delete this.previous_time;
        }

        this.running = false;
    }

    /**
     * Destroy the cuepoint
     *
     * @method destroy
     */
    destroy() {
        this.getMedia().removeListener('timeupdate', this.onMediaTimeUpdate);

        this.stop();
    }

}
