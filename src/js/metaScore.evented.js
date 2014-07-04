/**
 * Undo
 *
 * @requires metaScore.base.js
 */
 
metaScore.Evented = metaScore.Base.extend(function(){

  var _listeners = {};
  
  this.addListener = function(type, listener){
    if (typeof _listeners[type] === "undefined"){
      _listeners[type] = [];
    }

    _listeners[type].push(listener);
    
    return this;
  };

  this.removeListener = function(type, listener){
    if(_listeners[type] instanceof Array){
      var listeners = _listeners[type];
      for (var i=0, len=listeners.length; i < len; i++){
        if (listeners[i] === listener){
          listeners.splice(i, 1);
          break;
        }
      }
    }
    
    return this;
  };

  this.triggerEvent = function(type, data, bubbling, cancelable){
    var listeners, event;

    if (_listeners[type] instanceof Array){
      listeners = _listeners[type];
      
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
});