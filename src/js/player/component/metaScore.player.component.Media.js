/**
 * Media
 *
 * @requires metaScore.player.js
 * @requires ../metaScore.dom.js
 */
 
metaScore.namespace('player.component').Media = (function () {
  
  function Media(configs){
    // call parent constructor
    Media.parent.call(this, configs);
    
    this.playing = false;
  }
  
  metaScore.player.Component.extend(Media);

  Media.defaults = {
    'type': 'audio',
    'sources': [],
    'useFrameAnimation': true,
    'properties': {
      'x': {
        'type': 'Number',
        'label': metaScore.String.t('X'),
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'label': metaScore.String.t('Y'),
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        'setter': function(value){
          this.css('top', value +'px');
        },
      },
      'width': {
        'type': 'Number',
        'label': metaScore.String.t('Width'),
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'label': metaScore.String.t('Height'),
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        'setter': function(value){
          this.css('height', value +'px');
        }
      }
    }
  };
  
  Media.prototype.setupDOM = function(){
    var sources = '';
    
    // call parent function
    Media.parent.prototype.setupDOM.call(this);
    
    this.addClass('media '+ this.configs.type);
    
    metaScore.Array.each(this.configs.sources, function(index, source) {
      sources += '<source src="'+ source.url +'" type="'+ source.mime +'"></source>';
    });
    
    this.el = new metaScore.Dom('<'+ this.configs.type +'>'+ sources +'</'+ this.configs.type +'>', {'preload': 'auto'})
      .appendTo(this);
      
    this.dom = this.el.get(0);
    
    this.el
      .addListener('canplay', metaScore.Function.proxy(this.onCanPlay, this))
      .addListener('play', metaScore.Function.proxy(this.onPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onPause, this))
      .addListener('timeupdate', metaScore.Function.proxy(this.onTimeUpdate, this))
      .addListener('volumechange', metaScore.Function.proxy(this.onVolumeChange, this))
      .addListener('ended', metaScore.Function.proxy(this.onEnded, this));
      
    if(this.configs.useFrameAnimation){
      this.el.addListener('play', metaScore.Function.proxy(this.triggerTimeUpdate, this));
    } 
  };
  
  Media.prototype.onCanPlay = function() {
    this.triggerEvent('canplay');
  };
  
  Media.prototype.onPlay = function(evt) {
    this.playing = true;
    
    this.triggerEvent('play');
  };
  
  Media.prototype.onPause = function(evt) {
    this.playing = false;
    
    this.triggerEvent('pause');
  };
  
  Media.prototype.onTimeUpdate = function(evt){
    if(!(evt instanceof CustomEvent)){
      evt.stopPropagation();
    }
    
    if(!this.configs.useFrameAnimation){
      this.triggerTimeUpdate(false);
    }
  };
  
  Media.prototype.onVolumeChange = function(evt) {
    this.triggerEvent('volumechange');
  };
  
  Media.prototype.onEnded = function(evt) {
    this.triggerEvent('ended');
  };
  
  Media.prototype.isPlaying = function() {
    return this.playing;
  };

  Media.prototype.reset = function(supressEvent) {
    this.setTime(0);
    
    if(supressEvent !== true){
      this.triggerEvent('reset');
    }
  };

  Media.prototype.play = function(supressEvent) {
    this.dom.play();
    
    if(supressEvent !== true){
      this.triggerEvent('play');
    }
  };
  
  Media.prototype.pause = function(supressEvent) {
    this.dom.pause();
    
    if(supressEvent !== true){
      this.triggerEvent('pause');
    }
  };
  
  Media.prototype.stop = function(supressEvent) {
    this.setTime(0);
    this.pause(true);
    
    this.triggerTimeUpdate(false);
    
    if(supressEvent !== true){
      this.triggerEvent('stop');
    }
  };
  
  Media.prototype.triggerTimeUpdate = function(loop) {
    if(loop !== false && this.isPlaying()){
      window.requestAnimationFrame(metaScore.Function.proxy(this.triggerTimeUpdate, this));
    }
    
    this.triggerEvent('timeupdate', {'media': this});
  };
  
  Media.prototype.setTime = function(time) {    
    this.dom.currentTime = parseFloat(time) / 1000;
    
    this.triggerTimeUpdate(false);
  };
  
  Media.prototype.getTime = function() {
    return parseFloat(this.dom.currentTime) * 1000;
  };
  
  Media.prototype.getDuration = function() {
    return parseFloat(this.dom.duration) * 1000;
  };
  
  return Media;
  
})();