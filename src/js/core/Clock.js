import EventEmitter from './EventEmitter';

/**
 * A synchronization clock class
 */
export default class Clock extends EventEmitter{

    constructor(){
        super();

        /**
         * @type {Numebr}
         */
        this.time = 0;
    }

    /**
     * Set the current time
     *
     * @param {Number} time The time in seconds
     * @param {Boolean} [supressEvent=false] Whether to supress the timeupdate event
     */
    setTime(time, supressEvent) {
        this.time = time;

        if(supressEvent !== true){
            this.triggerTimeUpdate();
        }
    }

    /**
     * Get the current time
     *
     * @return {Number} The time in seconds
     */
    getTime() {
        return this.time;
    }

    /**
     * Trigger the timeupdate event
     *
     * @private
     */
    triggerTimeUpdate() {
        this.triggerEvent('timeupdate', {'time': this.getTime()});
    }
}
