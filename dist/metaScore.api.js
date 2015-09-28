/*! metaScore - v0.0.2 - 2015-09-28 - Oussama Mubarak */
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
  api.prototype.play = function(inTime, outTime, rIndex){
    this.postMessage('play', {'inTime': inTime, 'outTime': outTime, 'rIndex': rIndex});

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
   * @method seek
   * @param {} seconds
   * @return 
   */
  api.prototype.seek = function(seconds){
    this.postMessage('seek', {'seconds': parseFloat(seconds)});

    return this;
  };

  /**
   * Description
   * @method page
   * @param {} callback
   * @return 
   */
  api.prototype.page = function(block, index){
    this.postMessage('page', {'block': block, 'index': parseInt(index)-1});

    return this;
  };

  /**
   * Description
   * @method rIndex
   * @param {} callback
   * @return 
   */
  api.prototype.rindex = function(index){
    this.postMessage('rindex', {'index': parseInt(index)});

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
    
    this.postMessage('paused', {'callback': callback_id});

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
    
    this.postMessage('time', {'callback': callback_id});

    return this;
  };
  
  // Process API links
  document.addEventListener("DOMContentLoaded", function(event){
    var links, link, ids = [], iframes, i, callback;
    
    links = document.querySelectorAll('a[rel="metascore"][data-guide]');
    
    for(i = 0; i < links.length; ++i){
      link = links[i];
      
      if(ids.indexOf(link.dataset.guide) < 0){
        ids.push(link.dataset.guide);
      }
    }
    
    if(ids.length > 0){
      iframes = document.querySelectorAll('iframe.metascore-embed#'+ ids.join(',iframe.metascore-embed#'));
    
      callback = function(api){
        var links, handler;
        links = document.querySelectorAll('a[rel="metascore"][data-guide="'+ api.target.id +'"]');
        
        handler = function(evt){
          var link = evt.target,
            actions = link.hash.replace(/^#/, '').split('&'),
            action;
            
          for(var i=0,length=actions.length; i<length; i++){
            action = actions[i].split('=');
            
            if(action[0] in api){
              api[action[0]].apply(api, action[1].split(','));
            }
          }
          
          evt.preventDefault();
        };
    
        for(var i = 0; i < links.length; ++i){
          links[i].addEventListener('click', handler);
        }
      };
      
      for(i = 0; i < iframes.length; ++i){
        new api(iframes[i], callback);
      }
    }
  });

  window.metaScoreAPI = api;

})();