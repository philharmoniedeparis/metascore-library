(function(){

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
  
  api.prototype.onLoad = function(callback){
    this.on('ready', function(){
      console.log('ready');
      callback.call(null, this);
    });
  };
  
  api.prototype.onMessage = function(event){
  
    var data, callback, params;
    
    /*if(!(/^http?:\/\/metascore.philharmoniedeparis.fr/).test(event.origin)) {
      return false;
    }*/
    
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
  
  api.prototype.on = function(type, callback){
    var callback_id = new Date().valueOf().toString() + Math.random();
  
    this.callbacks[callback_id] = callback;
    
    this.postMessage('addEventListener', {'type': type, 'callback': callback_id});

    return this;
    
  };
  
  api.prototype.play = function(){
    this.postMessage('play');

    return this;
  };
  
  api.prototype.pause = function(){
    this.postMessage('pause');

    return this;
  };
  
  api.prototype.paused = function(callback){
    var callback_id = new Date().valueOf().toString() + Math.random();
    
    this.callbacks[callback_id] = callback;
    
    this.postMessage('paused', callback_id);

    return this;
  };
  
  api.prototype.seek = function(seconds){
    this.postMessage('seek', seconds);

    return this;
  };
  
  api.prototype.time = function(callback){
    var callback_id = new Date().valueOf().toString() + Math.random();
    
    this.callbacks[callback_id] = callback;
    
    this.postMessage('time', callback_id);

    return this;
  };

  window.metaScoreAPI = api;

})();