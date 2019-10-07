/**
 * A synchronization clock class
 */
export default class Clock {

    static time = 0;

    static listeners = {};

    /**
     * Set the current time
     *
     * @param {Number} time The time in centiseconds
     * @param {Boolean} [supressEvent=false] Whether to supress the timeupdate event
     */
    static setTime(time, supressEvent) {
        this.time = time;

        if(supressEvent !== true){
            this.triggerTimeUpdate();
        }
    }

    /**
     * Get the current time
     *
     * @return {Number} The time in centiseconds
     */
    static getTime() {
        return this.time;
    }

    /**
     * Trigger the timeupdate event
     *
     * @private
     */
    static triggerTimeUpdate() {
        this.triggerEvent('timeupdate', {'time': this.getTime()});
    }

    /**
     * Add an event listener
     *
     * @param {String} type The event type to listen to
     * @param {Function} listener The callback function to associate to this listener
     * @return {this}
     */
    static addListener(type, listener){
        if (typeof this.listeners[type] === "undefined"){
            this.listeners[type] = [];
        }

        this.listeners[type].push(listener);

        return this;
    }

    /**
     * Remove an event listener
     *
     * @param {String} type The event type to stop listen to
     * @param {Function} listener The callback function associated to this listener
     * @return {this}
     */
    static removeListener(type, listener){
        if(this.listeners[type] instanceof Array){
            const listeners = this.listeners[type];
            for (let i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }

        return this;
    }

    /**
     * Check if a listener is attached to a given event type
     *
     * @param {String} type The event type
     * @return {Boolean} Whether a listener is attached
     */
    static hasListener(type){
        if(this.listeners[type] instanceof Array){
            return this.listeners[type].length > 0;
        }

        return false;
    }

    /**
     * Trigger an event
     *
     * @param {String} type The event type
     * @param {Mixed} data Data to attach to the event via the detail propoerty
     * @param {Boolean} bubbling Whether the event bubbles up through the DOM or not
     * @param {Boolean} cancelable Whether the event is cancelable or not
     * @return {this}
     */
    static triggerEvent(type, data, bubbling, cancelable){
        if (this.listeners[type] instanceof Array){
            const listeners = this.listeners[type];

            if(listeners){
                const event = {
                    'target': this,
                    'type': type,
                    'detail': data,
                    'bubbles': bubbling !== false,
                    'cancelable': cancelable !== false
                };

                Object.entries(listeners).forEach(([, listener]) => {
                    listener.call(this, event);
                });
            }
        }

        return this;
    }
}
