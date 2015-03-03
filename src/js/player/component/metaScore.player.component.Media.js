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
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.x', 'X')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.y', 'Y')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        'setter': function(value){
          this.css('top', value +'px');
        },
      },
      'width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.width', 'Width')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.height', 'Height')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.border-radius', 'Border radius')
        },
        'getter': function(skipDefault){
          return this.css('border-radius', undefined, skipDefault);
        },
        'setter': function(value){
          this.css('border-radius', value);
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

    this
      .addMediaListener('play', metaScore.Function.proxy(this.onPlay, this))
      .addMediaListener('pause', metaScore.Function.proxy(this.onPause, this))
      .addMediaListener('timeupdate', metaScore.Function.proxy(this.onTimeUpdate, this));
  };

  Media.prototype.getName = function(){
    return '[media]';
  };

  Media.prototype.onPlay = function(evt) {
    this.playing = true;
    
    if(this.configs.useFrameAnimation){
      this.triggerTimeUpdate();
    }
  };

  Media.prototype.onPause = function(evt) {
    this.playing = false;
  };

  Media.prototype.onTimeUpdate = function(evt){
    if(!(evt instanceof CustomEvent)){
      evt.stopImmediatePropagation();
    }

    if(!this.configs.useFrameAnimation){
      this.triggerTimeUpdate(false);
    }
  };

  Media.prototype.isPlaying = function() {
    return this.playing;
  };

  Media.prototype.reset = function(supressEvent) {
    this.setTime(0);
    
    return this;
  };

  Media.prototype.play = function(supressEvent) {
    this.dom.play();
    
    return this;
  };

  Media.prototype.pause = function(supressEvent) {
    this.dom.pause();
    
    return this;
  };

  Media.prototype.triggerTimeUpdate = function(loop) {
    if(loop !== false && this.isPlaying()){
      window.requestAnimationFrame(metaScore.Function.proxy(this.triggerTimeUpdate, this));
    }

    this.el.triggerEvent('timeupdate', {'media': this});
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

  Media.prototype.addMediaListener = function(type, callback, useCapture) {
    this.el.addListener(type, callback, useCapture);
    
    return this;
  };

  Media.prototype.removeMediaListener = function(type, callback, useCapture) {
    this.el.removeListener(type, callback, useCapture);
    
    return this;
  };

  return Media;

})();