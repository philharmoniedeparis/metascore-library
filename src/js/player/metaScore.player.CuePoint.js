/**
 * CuePoints
 *
 * @requires metaScore.player.media.js
 * @requires ../metaScore.base.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.var.js
 */
 
metaScore.namespace('player').CuePoint = (function () {
  
  function CuePoint(configs) {
    this.configs = this.getConfigs(configs);
    
    this.id = metaScore.String.uuid();
    
    this.running = false;
    this.inTimer = null;
    this.outTimer = null;
    
    this.launch = metaScore.Function.proxy(this.launch, this);
    this.stop = metaScore.Function.proxy(this.stop, this);
    this.onMediaTimeUpdate = metaScore.Function.proxy(this.onMediaTimeUpdate, this);
    
    this.configs.media.addListener('timeupdate', this.onMediaTimeUpdate);
  }
  
  metaScore.Evented.extend(CuePoint);
  
  CuePoint.defaults = {
    'media': null,
    'inTime': null,
    'outTime': null,
    'onStart': null,
    'onUpdate': null,
    'onEnd': null
  };
  
  CuePoint.prototype.onMediaTimeUpdate = function(evt){
    var curTime = this.configs.media.getTime();
     
    if(!this.running){
      if((!this.inTimer) && (curTime >= this.configs.inTime - 0.5) && ((this.configs.outTime === null) || (curTime <= this.configs.outTime))){
        this.inTimer = setTimeout(this.launch, Math.max(0, this.configs.inTime - curTime));
      }
    }
    else{
      if((!this.outTimer) && (this.configs.outTime !== null) && (curTime >= this.configs.outTime - 0.5)){
        this.outTimer = setTimeout(this.stop, Math.max(0, this.configs.outTime - curTime));
      }
      
      if(metaScore.Var.is(this.configs.onUpdate, 'function')){
        this.configs.onUpdate(this, curTime);
      }
    }
  };
  
  CuePoint.prototype.launch = function(){
    if(this.running){
      return;
    }
  
    if(this.inTimer){
      clearTimeout(this.inTimer);
      this.inTimer = null;
    }
    
    if(metaScore.Var.is(this.configs.onStart, 'function')){
      this.configs.onStart(this);
    }
    
    // stop the cuepoint if it doesn't have an outTime or doesn't have onUpdate and onEnd callbacks
    if((this.configs.outTime === null) || (!(this.configs.onUpdate) && !(this.configs.onEnd))){
      this.stop();
    }
    else{
      this.running = true;
    }
  };
  
  CuePoint.prototype.stop = function(launchCallback){
    if(this.inTimer){
      clearTimeout(this.inTimer);
      this.inTimer = null;
    }
    
    if(this.outTimer){
      clearTimeout(this.outTimer);
      this.outTimer = null;
    }
    
    if(launchCallback !== false && metaScore.Var.is(this.configs.onEnd, 'function')){
      this.configs.onEnd(this);
    }
    
    this.running = false;
  };
  
  CuePoint.prototype.destroy = function(){
    this.stop(false);
    this.configs.media.removeListener('timeupdate', this.onMediaTimeUpdate);
  };
    
  return CuePoint;
  
})();