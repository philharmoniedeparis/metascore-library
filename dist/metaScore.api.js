/*! metaScore - v0.0.2 - 2015-07-16 - Oussama Mubarak */
(function(){

  var origin_check = /^http?:\/\/metascore.philharmoniedeparis.fr/;


  /**
   * Description
   * @constructor
   * @param {} target
   * @param {} callback
   */
  function api(target, callback) {  
    if(typeof target === "string") {
      target = document.getElementById(target);
    }

    this.target = target;
    this.origin = '*';
    this.ready = false;
    
    this.callbacks = {};
    
    this.target.addEventListener('load', this.onLoad.bind(this, callback), false);
    
    window.addEventListener('message', this.onMessage.bind(this), false);    
  }

  /**
   * Description
   * @method postMessage
   * @param {} method
   * @param {} params
   * @return 
   */
  api.prototype.postMessage = function(method, params){  
    var data;
    
    if (!this.target.contentWindow.postMessage) {
      return false;
    }
    
    data = JSON.stringify({
      'method': method,
      'params': params
    });

    this.target.contentWindow.postMessage(data, this.origin);    
  };

  /**
   * Description
   * @method onLoad
   * @param {} callback
   * @return 
   */
  api.prototype.onLoad = function(callback){
    this.on('ready', function(){
      callback.call(null, this);
    });
  };

  /**
   * Description
   * @method onMessage
   * @param {} event
   * @return 
   */
  api.prototype.onMessage = function(event){  
    var data, callback, params;
    
    if(!(origin_check).test(event.origin)) {
      return false;
    }
    
    try {
      data = JSON.parse(event.data);
    }
    catch(e){
      return false;
    }
    
    if (!('callback' in data) || !(callback = this.callbacks[data.callback])) {
      return false;
    }
    
    params = 'params' in data ? data.params : null;
    
    callback.call(this, params);    
  };

  /**
   * Description
   * @method on
   * @param {} type
   * @param {} callback
   * @return 
   */
  api.prototype.on = function(type, callback){
    var callback_id = new Date().valueOf().toString() + Math.random();
  
    this.callbacks[callback_id] = callback;
    
    this.postMessage('addEventListener', {'type': type, 'callback': callback_id});

    return this;    
  };

  /**
   * Description
   * @method play
   * @return 
   */
  api.prototype.play = function(){
    this.postMessage('play');

    return this;
  };

  /**
   * Description
   * @method pause
   * @return 
   */
  api.prototype.pause = function(){
    this.postMessage('pause');

    return this;
  };

  /**
   * Description
   * @method paused
   * @param {} callback
   * @return 
   */
  api.prototype.paused = function(callback){
    var callback_id = new Date().valueOf().toString() + Math.random();
    
    this.callbacks[callback_id] = callback;
    
    this.postMessage('paused', callback_id);

    return this;
  };

  /**
   * Description
   * @method seek
   * @param {} seconds
   * @return 
   */
  api.prototype.seek = function(seconds){
    this.postMessage('seek', seconds);

    return this;
  };

  /**
   * Description
   * @method time
   * @param {} callback
   * @return 
   */
  api.prototype.time = function(callback){
    var callback_id = new Date().valueOf().toString() + Math.random();
    
    this.callbacks[callback_id] = callback;
    
    this.postMessage('time', callback_id);

    return this;
  };

  window.metaScoreAPI = api;

})();