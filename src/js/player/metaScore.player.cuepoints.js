/**
 * CuePoints
 *
 * @requires metaScore.player.media.js
 * @requires ../metaScore.base.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.var.js
 */
metaScore.Player.CuePoints = metaScore.Base.extend(function(){

  var _media, _cuepoints;
  
  this.constructor = function(media){
    
    _cuepoints = [];
  
    _media = media;
    
    _media.addEventListener('timeupdate', this.onMediaTimeUpdate);
    
  };
  
  this.onMediaTimeUpdate = function(e){
    var curTime;
    
    curTime = parseFloat(_media.currentTime);
    
    metaScore.Object.each(_cuepoints, function (index, cuepoint) {
      if (!cuepoint.timer && curTime >= cuepoint.inTime - 0.5 && curTime < cuepoint.inTime) {
        this.setupTimer(cuepoint, (cuepoint.inTime - curTime) * 1000);
      }
    });
  };
  
  this.add = function(cuepoint){
    return _cuepoints.push(cuepoint) - 1;
  };
  
  this.remove = function(index){
    var cuepoint = _cuepoints[index];
  
    this.stop(cuepoint, false);
    
    _cuepoints.splice(index, 1);
  };
  
  this.setupTimer = function(cuepoint, delay){
    cuepoint.timer = setTimeout(metaScore.Function.proxy(this.launch, this, cuepoint), delay);
  };
  
  this.launch = function(cuepoint){
    if(cuepoint.hasOwnProperty('onStart') && metaScore.Var.is(cuepoint.onStart, 'function')){
      cuepoint.onStart(_media);
    }    
  };
  
  this.stop = function(cuepoint, launchHandler){    
    if(cuepoint.hasOwnProperty('timer')){
      clearTimeout(cuepoint.timer);
      delete cuepoint.timer;
    }
    
    if(cuepoint.hasOwnProperty('interval')){
      clearInterval(cuepoint.interval);
      delete cuepoint.interval;
    }
    
    if(launchHandler !== false && cuepoint.hasOwnProperty('onEnd') && metaScore.Var.is(cuepoint.onEnd, 'function')){
      cuepoint.onEnd(_media);
    }
  };
});