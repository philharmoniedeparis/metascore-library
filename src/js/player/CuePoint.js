import EventEmitter from '../core/EventEmitter';
import {uuid} from '../core/utils/String';

/**
 * A class for managing media cuepoints to execute actions at specific media times
 *
 * @emits {start} Fired when the cuepoint starts
 * @emits {update} Fired when the cuepoint is active (between the start and end times) and the media time is updated
 * @emits {stop} Fired when the cuepoint stops
 * @emits {seekout} Fired when the media is seeked outside of the cuepoint's time
 */
export default class CuePoint extends EventEmitter{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Media} media The media component to which the cuepoint is attached
     * @property {Number} [inTime] The time at which the cuepoint starts
     * @property {Number} [outTime] The time at which the cuepoint stops
     * @property {Boolean} [considerError] Whether to estimate and use the error margin in timed events
     */
    constructor(configs) {
        // call parent constructor
        super();

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The cuepoint's unique id
         * @type {String}
         */
        this.id = uuid();

        /**
         * Whether the cuepoint is currently running
         * @type {Boolean}
         */
        this.running = false;

        /**
         * The current max error margin in timed events
         * @type {Number}
         */
        this.max_error = 0;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.onMediaTimeUpdate = this.onMediaTimeUpdate.bind(this);
        this.onMediaSeeking = this.onMediaSeeking.bind(this);
        this.onMediaSeeked = this.onMediaSeeked.bind(this);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
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
     * @private
     */
    onMediaTimeUpdate(){
        this.update();
    }

    /**
     * The media's seeked event handler
     *
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

            /**
             * The previous media time
             * @type {Number}
             */
            this.previous_time = cur_time;
        }

        if((Math.ceil(cur_time) < this.configs.inTime) || (Math.floor(cur_time) > this.configs.outTime)){
            this.triggerEvent('seekout');
            this.stop();
        }
        else{
            this.update();
        }
    }

    /**
     * Get the media component on which this cuepoint is attached
     *
     * @return {player.component.Media} The media component
     */
    getMedia() {
        return this.configs.media;
    }

    /**
     * Activate the cuepoint
     *
     * @return {this}
     */
    activate() {
        if((this.configs.inTime !== null) || (this.configs.outTime !== null)){
            this.active = true;

            this.getMedia().addListener('timeupdate', this.onMediaTimeUpdate);
            this.update();
        }

        return this;
    }

    /**
     * Deactivate the cuepoint
     *
     * @return {this}
     */
    deactivate() {
        delete this.active;

        this.getMedia().removeListener('timeupdate', this.onMediaTimeUpdate);

        this.stop();

        return this;
    }

    /**
     * Start executing the cuepoint
     *
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    start(supressEvent){
        if(this.running){
            return;
        }

        if(supressEvent !== true){
            this.triggerEvent('start');
        }

        this.running = true;
        this.getMedia().addListener('seeking', this.onMediaSeeking);

        this.triggerEvent('update');
    }

    /**
     * Update the cuepoint
     *
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    update(supressEvent){
        if(!this.active){
            return;
        }

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
                this.triggerEvent('update');
            }

            if((this.configs.outTime !== null) && (Math.floor(cur_time + this.max_error) >= this.configs.outTime)){
                this.stop();
            }
        }
    }

    /**
     * Stop executing the cuepoint
     *
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    stop(supressEvent){
        if(!this.running){
            return;
        }

        this.getMedia().removeListener('seeking', this.onMediaSeeking);

        if(supressEvent !== true){
            this.triggerEvent('stop');
        }

        if(this.configs.considerError){
            this.max_error = 0;
            delete this.previous_time;
        }

        this.running = false;
    }

}
