metaScore.Evented = (function(){

    /**
     * A base class for event handling
     *
     * @class Evented
     * @extends Class
     * @constructor
     */
    function Evented() {
        // call parent constructor
        Evented.parent.call(this);

        this.listeners = {};
    }

    metaScore.Class.extend(Evented);

    /**
     * Add an event listener
     *
     * @method addListener
     * @param {String} type The event type to listen to
     * @param {Function} listener The callback function to associate to this listener
     * @chainable
     */
    Evented.prototype.addListener = function(type, listener){
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
    Evented.prototype.removeListener = function(type, listener){
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
     * Trigger an event
     *
     * @method triggerEvent
     * @param {String} type The event type
     * @param {Mixed} data Data to attach to the event via the detail propoerty
     * @param {Boolean} bubbling Whether the event bubbles up through the DOM or not
     * @param {Boolean} cancelable Whether the event is cancelable or not
     * @chainable
     */
    Evented.prototype.triggerEvent = function(type, data, bubbling, cancelable){
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

            metaScore.Object.each(listeners, function(index, listener){
                listener.call(this, event);
            }, this);
        }

        return this;
    };

    return Evented;

})();