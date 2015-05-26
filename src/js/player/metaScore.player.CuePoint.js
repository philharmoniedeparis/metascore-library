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
    'onSeekOut': null
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
      if((curTime >= this.configs.inTime) && ((this.configs.outTime === null) || (curTime < this.configs.outTime))){
        this.launch();
      }
    }
    else{
      if((curTime < this.configs.inTime) || ((this.configs.outTime !== null) && (curTime >= this.configs.outTime))){
        this.stop();
      }

      if(this.configs.onUpdate){
        this.configs.onUpdate(this, curTime);
      }
    }
    
    if(this.configs.onSeekOut){
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
    
    if(this.configs.onSeekOut){
      curTime = this.configs.media.getTime();
    
      if((curTime < this.configs.inTime) || (curTime > this.configs.outTime)){
        this.configs.onSeekOut(this);
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
   * @method getInTime
   * @return MemberExpression
   */
  CuePoint.prototype.getInTime = function(){
    return this.configs.inTime;
  };

  /**
   * Description
   * @method getOutTime
   * @return MemberExpression
   */
  CuePoint.prototype.getOutTime = function(){
    return this.configs.outTime;
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
    if(launchCallback !== false && this.configs.onEnd){
      this.configs.onEnd(this);
    
      if(this.configs.onSeekOut){
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