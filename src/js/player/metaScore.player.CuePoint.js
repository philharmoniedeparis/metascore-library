/**
* Description
* @class CuePoint
* @namespace metaScore.player
* @extends metaScore.Evented
*/

metaScore.namespace('player').CuePoint = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function CuePoint(configs) {
    this.configs = this.getConfigs(configs);

    this.id = metaScore.String.uuid();

    this.running = false;
    this.inTimer = null;
    this.outTimer = null;

    this.launch = metaScore.Function.proxy(this.launch, this);
    this.stop = metaScore.Function.proxy(this.stop, this);
    this.onMediaTimeUpdate = metaScore.Function.proxy(this.onMediaTimeUpdate, this);
    this.onMediaSeeked = metaScore.Function.proxy(this.onMediaSeeked, this);

    this.configs.media.addMediaListener('timeupdate', this.onMediaTimeUpdate);
  }

  metaScore.Evented.extend(CuePoint);

  CuePoint.defaults = {
    'media': null,
    'inTime': null,
    'outTime': null,
    'onStart': null,
    'onUpdate': null,
    'onEnd': null,
    'onOut': null,
    'errorMargin': 10 // the number of milliseconds estimated as the error margin for time update events
  };

  /**
   * Description
   * @method onMediaTimeUpdate
   * @param {} evt
   * @return 
   */
  CuePoint.prototype.onMediaTimeUpdate = function(evt){
    var curTime = this.configs.media.getTime();

    if(!this.running){
      if((!this.inTimer) && (curTime >= this.configs.inTime - this.configs.errorMargin) && ((this.configs.outTime === null) || (curTime <= this.configs.outTime))){
        this.inTimer = setTimeout(this.launch, Math.max(0, this.configs.inTime - curTime));
      }
    }
    else{
      if((!this.outTimer) && (this.configs.outTime !== null) && (curTime >= this.configs.outTime - this.configs.errorMargin)){
        this.outTimer = setTimeout(this.stop, Math.max(0, this.configs.outTime - curTime));
      }

      if(this.configs.onUpdate){
        this.configs.onUpdate(this, curTime);
      }
    }
    
    if(this.configs.onOut){
      this.configs.media.addMediaListener('seeking', this.onMediaSeeked);
    }
  };

  /**
   * Description
   * @method onMediaSeeked
   * @param {} evt
   * @return 
   */
  CuePoint.prototype.onMediaSeeked = function(evt){
    var curTime;
    
    this.configs.media.removeMediaListener('play', this.onMediaSeeked);
    
    if(this.configs.onOut){
      curTime = this.configs.media.getTime();
    
      if((curTime < this.configs.inTime) || (curTime > this.configs.outTime)){
        this.configs.onOut(this);
      }
    }
  };

  /**
   * Description
   * @method getMedia
   * @return MemberExpression
   */
  CuePoint.prototype.getMedia = function(){
    return this.configs.media;
  };

  /**
   * Description
   * @method launch
   * @return 
   */
  CuePoint.prototype.launch = function(){
    if(this.running){
      return;
    }

    if(this.inTimer){
      clearTimeout(this.inTimer);
      this.inTimer = null;
    }

    if(this.configs.onStart){
      this.configs.onStart(this);
    }

    // stop the cuepoint if it doesn't have an outTime or doesn't have onUpdate and onEnd callbacks
    if((this.configs.outTime === null) || (!this.configs.onUpdate && !this.configs.onEnd)){
      this.stop();
    }
    else{
      this.running = true;
    }
  };

  /**
   * Description
   * @method stop
   * @param {} launchCallback
   * @return 
   */
  CuePoint.prototype.stop = function(launchCallback){
    if(this.inTimer){
      clearTimeout(this.inTimer);
      this.inTimer = null;
    }

    if(this.outTimer){
      clearTimeout(this.outTimer);
      this.outTimer = null;
    }

    if(launchCallback !== false && this.configs.onEnd){
      this.configs.onEnd(this);
    
      if(this.configs.onOut){
        this.configs.media.addMediaListener('play', this.onMediaSeeked);
      }
    }

    this.running = false;
  };

  /**
   * Description
   * @method destroy
   * @return 
   */
  CuePoint.prototype.destroy = function(){
    this.stop(false);
    
    this.configs.media
      .removeMediaListener('timeupdate', this.onMediaTimeUpdate)
      .removeMediaListener('seeking', this.onMediaSeeked)
      .removeMediaListener('play', this.onMediaSeeked);
  };

  return CuePoint;

})();