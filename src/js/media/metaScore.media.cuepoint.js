/**
* Media CuePoints
*/
metaScore.Media = metaScore.Media || {};

metaScore.Media.CuePoint = metaScore.Base.extend(function(){
  this.triggers = [];
  
  this.constructor = function(media){
    this.media = media;
    
    this.media.addEventListener('timeupdate', this.onMediaTimeUpdate);
  };
  
  this.onMediaTimeUpdate = function(e){
    var media, curTime;
    
    media = e.target;
    curTime = parseFloat(media.currentTime);
    
    metaScore.Object.each(this.triggers, function (index, trigger) {
      if (!trigger.timer && curTime >= trigger.inTime - 0.5 && curTime < trigger.inTime) {
        this.setupTriggerTimer(trigger, (trigger.inTime - curTime) * 1000);
      }
    });
  };
  
  this.addTrigger = function(trigger){
    return this.triggers.push(trigger) - 1;
  };
  
  this.removeTrigger = function(index){
    var trigger = this.triggers[index];
  
    this.stopTrigger(trigger, false);
    this.triggers.splice(index, 1);
  };
  
  this.setupTriggerTimer = function(trigger, delay){
    trigger.timer = setTimeout(metaScore.Function.proxy(this.launchTrigger, this, trigger), delay);
  };
  
  this.launchTrigger = function(trigger){
    if(trigger.hasOwnProperty('onStart') && metaScore.Var.is(trigger.onStart, 'function')){
      trigger.onStart(this.media);
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
      trigger.onEnd(this.media);
    }
  };
});