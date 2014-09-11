/**
 * CuePoints
 *
 * @requires metaScore.player.media.js
 * @requires ../metaScore.base.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.var.js
 */
 
metaScore.namespace('player');

metaScore.player.CuePoints = (function () {
  
  function CuePoints(media) {  
    this.media = media;
    
    this.cuepoints = [];
    
    this.media.addEventListener('timeupdate', this.onMediaTimeUpdate);
  }
  
  metaScore.Class.extend(CuePoints);
  
  CuePoints.prototype.onMediaTimeUpdate = function(e){
    var curTime;
    
    curTime = parseFloat(this.media.currentTime);
    
    metaScore.Object.each(this.cuepoints, function (index, cuepoint) {
      if (!cuepoint.timer && curTime >= cuepoint.inTime - 0.5 && curTime < cuepoint.inTime) {
        this.setupTimer(cuepoint, (cuepoint.inTime - curTime) * 1000);
      }
    });
  };
  
  CuePoints.prototype.add = function(cuepoint){
    return this.cuepoints.push(cuepoint) - 1;
  };
  
  CuePoints.prototype.remove = function(index){
    var cuepoint = this.cuepoints[index];
  
    this.stop(cuepoint, false);
    
    this.cuepoints.splice(index, 1);
  };
  
  CuePoints.prototype.setupTimer = function(cuepoint, delay){
    cuepoint.timer = setTimeout(metaScore.Function.proxy(this.launch, this, cuepoint), delay);
  };
  
  CuePoints.prototype.launch = function(cuepoint){
    if(cuepoint.hasOwnProperty('onStart') && metaScore.Var.is(cuepoint.onStart, 'function')){
      cuepoint.onStart(this.media);
    }    
  };
  
  CuePoints.prototype.stop = function(cuepoint, launchHandler){    
    if(cuepoint.hasOwnProperty('timer')){
      clearTimeout(cuepoint.timer);
      delete cuepoint.timer;
    }
    
    if(cuepoint.hasOwnProperty('interval')){
      clearInterval(cuepoint.interval);
      delete cuepoint.interval;
    }
    
    if(launchHandler !== false && cuepoint.hasOwnProperty('onEnd') && metaScore.Var.is(cuepoint.onEnd, 'function')){
      cuepoint.onEnd(this.media);
    }
  };
    
  return CuePoints;
  
})();