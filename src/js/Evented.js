import {_Object} from './core/utils/Object';

export default class Evented extends Class{

    /**
     * A base class for event handling
     *
     * @class Evented
     * @extends Class
     * @constructor
     */
    constructor() {
        // call parent constructor
        super();

        this.listeners = {};
    }

    /**
     * Add an event listener
     *
     * @method addListener
     * @param {String} type The event type to listen to
     * @param {Function} listener The callback function to associate to this listener
     * @chainable
     */
    addListener(type, listener){
        if (typeof this.listeners[type] === "undefined"){
            this.listeners[type] = [];
        }

        this.listeners[type].push(listener);

        return this;
    };

    /**
     * Remove an event listener
     *
     * @method removeListener
     * @param {String} type The event type to stop listen to
     * @param {Function} listener The callback function associated to this listener
     * @chainable
     */
    removeListener(type, listener){
        if(this.listeners[type] instanceof Array){
            var listeners = this.listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }

        return this;
    };

    /**
     * Check if a listener is attached to a given event type
     *
     * @method hasListener
     * @param {String} type The event type
     * @return {Boolean} Whether a listener is attached
     */
    hasListener(type){
        if(this.listeners[type] instanceof Array){
            return this.listeners[type].length > 0;
        }

        return false;
    };

    /**
     * Trigger an event
     *
     * @method triggerEvent
     * @param {String} type The event type
     * @param {Mixed} data Data to attach to the event via the detail propoerty
     * @param {Boolean} bubbling Whether the event bubbles up through the DOM or not
     * @param {Boolean} cancelable Whether the event is cancelable or not
     * @chainable
     */
    triggerEvent(type, data, bubbling, cancelable){
        var listeners, event;

        if (this.listeners[type] instanceof Array){
            listeners = this.listeners[type];

            event = {
                'target': this,
                'type': type,
                'detail': data,
                'bubbles': bubbling !== false,
                'cancelable': cancelable !== false
            };

            _Object.each(listeners, function(index, listener){
                listener.call(this, event);
            }, this);
        }

        return this;
    };

}