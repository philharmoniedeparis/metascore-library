/**
* A helper class for event handling
* @class Evented
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Evented = (function () {

  /**
   * Description
   * @constructor
   */
  function Evented() {
    // call parent constructor
    Evented.parent.call(this);

    this.listeners = {};
  }

  metaScore.Class.extend(Evented);

  /**
   * Description
   * @method addListener
   * @param {} type
   * @param {} listener
   * @return ThisExpression
   */
  Evented.prototype.addListener = function(type, listener){
    if (typeof this.listeners[type] === "undefined"){
      this.listeners[type] = [];
    }

    this.listeners[type].push(listener);

    return this;
  };

  /**
   * Description
   * @method removeListener
   * @param {} type
   * @param {} listener
   * @return ThisExpression
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
   * Description
   * @method triggerEvent
   * @param {} type
   * @param {} data
   * @param {} bubbling
   * @param {} cancelable
   * @return ThisExpression
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