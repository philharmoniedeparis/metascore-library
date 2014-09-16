/**
 * Media
 *
 * @requires metaScore.player.js
 * @requires ../metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Media = (function () {
  
  function Media(configs){
    var sources = '';
  
    this.configs = this.getConfigs(configs);
    
    this.playing = false;
    
    metaScore.Array.each(this.configs.sources, function(index, source) {
      sources += '<source src="'+ source.url +'" type="'+ source.mime +'"></source>';
    });
    
    // call parent constructor
    Media.parent.call(this, '<'+ this.configs.type +'>'+ sources +'</'+ this.configs.type +'>', {'preload': 'auto'});
    
    this
      .addListener('play', metaScore.Function.proxy(this.onPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onPause, this));

    this.el = this.get(0);
  }

  Media.defaults = {
    'type': 'audio',
    'sources': []
  };
  
  metaScore.Dom.extend(Media);
  
  Media.prototype.onPlay = function(evt) {
    this.playing = true;
  };
  
  Media.prototype.onPause = function(evt) {
    this.playing = false;
  };
  
  Media.prototype.isPlaying = function() {
    return this.playing;
  };

  Media.prototype.reset = function(supressEvent) {
    this.setCurrentTime(0);
    
    if(supressEvent !== true){
      this.triggerEvent('reset');
    }
  };

  Media.prototype.play = function(supressEvent) {
    this.el.play();
    
    if(supressEvent !== true){
      this.triggerEvent('play');
    }
  };
  
  Media.prototype.pause = function(supressEvent) {
    this.el.pause();
    
    if(supressEvent !== true){
      this.triggerEvent('pause');
    }
  };
  
  Media.prototype.stop = function(supressEvent) {
    this.setCurrentTime(0);
    this.pause(true);
    
    if(supressEvent !== true){
      this.triggerEvent('stop');
    }
  };
  
  Media.prototype.setCurrentTime = function(time) {
    this.el.currentTime = time;
  };
  
  Media.prototype.getCurrentTime = function() {
    return this.el.currentTime;
  };
  
  Media.prototype.getDuration = function() {
    return this.el.duration;
  };
    
  return Media;
  
})();