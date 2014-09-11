/**
 * Evented
 *
 * @requires metaScore.class.js
 */
 
metaScore.Evented = (function () {
  
  function Evented() {
    this.listeners = {};
  }
  
  metaScore.Class.extend(Evented);
  
  Evented.prototype.addListener = function(type, listener){
    if (typeof this.listeners[type] === "undefined"){
      this.listeners[type] = [];
    }

    this.listeners[type].push(listener);
    
    return this;
  };

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