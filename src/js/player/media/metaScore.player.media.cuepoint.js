/**
 * Media CuePoints
 *
 * @requires metaScore.player.media.js
 * @requires ../metaScore.base.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.var.js
 */
metaScore.Player.Media.CuePoint = metaScore.Base.extend(function(){

  var _media, _triggers;
  
  this.constructor = function(media){
    
    _triggers = [];
  
    _media = media;
    
    _media.addEventListener('timeupdate', this.onMediaTimeUpdate);
    
  };
  
  this.onMediaTimeUpdate = function(e){
    var media, curTime;
    
    media = e.target;
    curTime = parseFloat(media.currentTime);
    
    metaScore.Object.each(_triggers, function (index, trigger) {
      if (!trigger.timer && curTime >= trigger.inTime - 0.5 && curTime < trigger.inTime) {
        this.setupTriggerTimer(trigger, (trigger.inTime - curTime) * 1000);
      }
    });
  };
  
  this.addTrigger = function(trigger){
    return _triggers.push(trigger) - 1;
  };
  
  this.removeTrigger = function(index){
    var trigger = _triggers[index];
  
    this.stopTrigger(trigger, false);
    _triggers.splice(index, 1);
  };
  
  this.setupTriggerTimer = function(trigger, delay){
    trigger.timer = setTimeout(metaScore.Function.proxy(this.launchTrigger, this, trigger), delay);
  };
  
  this.launchTrigger = function(trigger){
    if(trigger.hasOwnProperty('onStart') && metaScore.Var.is(trigger.onStart, 'function')){
      trigger.onStart(_media);
    }    
  };
  
  this.stopTrigger = function(trigger, launchHandler){    
    if(trigger.hasOwnProperty('timer')){
      clearTimeout(trigger.timer);
      delete trigger.timer;
    }
    
    if(trigger.hasOwnProperty('interval')){
      clearInterval(trigger.interval);
      delete trigger.interval;
    }
    
    if(launchHandler !== false && trigger.hasOwnProperty('onEnd') && metaScore.Var.is(trigger.onEnd, 'function')){
      trigger.onEnd(_media);
    }
  };
});