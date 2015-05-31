/**
* Description
* @class Media
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Media = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Media(configs){
    // call parent constructor
    Media.parent.call(this, configs);

    this.playing = false;
  }

  metaScore.player.Component.extend(Media);

  Media.defaults = {
    'type': 'audio',
    'duration': null,
    'sources': [],
    'useFrameAnimation': true,
    'properties': {
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.locked', 'Locked ?')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return BinaryExpression
         */
        'getter': function(skipDefault){
          return this.data('locked') === "true";
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('locked', value ? "true" : null);
        }
      },
      'x': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.x', 'X')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.y', 'Y')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('top', value +'px');
        },
      },
      'width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.width', 'Width')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.height', 'Height')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.border-radius', 'Border radius')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('border-radius', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('border-radius', value);
        }
      }
    }
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
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

  /**
   * Description
   * @method getName
   * @return Literal
   */
  Media.prototype.getName = function(){
    return '[media]';
  };

  /**
   * Description
   * @method onPlay
   * @param {} evt
   * @return 
   */
  Media.prototype.onPlay = function(evt) {
    this.playing = true;
    
    if(this.configs.useFrameAnimation){
      this.triggerTimeUpdate();
    }
  };

  /**
   * Description
   * @method onPause
   * @param {} evt
   * @return 
   */
  Media.prototype.onPause = function(evt) {
    this.playing = false;
  };

  /**
   * Description
   * @method onTimeUpdate
   * @param {} evt
   * @return 
   */
  Media.prototype.onTimeUpdate = function(evt){
    if(!(evt instanceof CustomEvent)){
      evt.stopImmediatePropagation();
    }

    if(!this.configs.useFrameAnimation){
      this.triggerTimeUpdate(false);
    }
  };

  /**
   * Description
   * @method isPlaying
   * @return MemberExpression
   */
  Media.prototype.isPlaying = function() {
    return this.playing;
  };

  /**
   * Description
   * @method reset
   * @param {} supressEvent
   * @return ThisExpression
   */
  Media.prototype.reset = function(supressEvent) {
    this.setTime(0);
    
    return this;
  };

  /**
   * Description
   * @method play
   * @param {} supressEvent
   * @return ThisExpression
   */
  Media.prototype.play = function(supressEvent) {
    this.dom.play();
    
    return this;
  };

  /**
   * Description
   * @method pause
   * @param {} supressEvent
   * @return ThisExpression
   */
  Media.prototype.pause = function(supressEvent) {
    this.dom.pause();
    
    return this;
  };

  /**
   * Description
   * @method triggerTimeUpdate
   * @param {} loop
   * @return 
   */
  Media.prototype.triggerTimeUpdate = function(loop) {
    if(loop !== false && this.isPlaying()){
      window.requestAnimationFrame(metaScore.Function.proxy(this.triggerTimeUpdate, this));
    }

    this.el.triggerEvent('timeupdate', {'media': this});
  };

  /**
   * Description
   * @method setTime
   * @param {} time
   * @return ThisExpression
   */
  Media.prototype.setTime = function(time) {
    this.dom.currentTime = parseFloat(time) / 100;

    this.triggerTimeUpdate(false);
    
    return this;
  };

  /**
   * Description
   * @method getTime
   * @return BinaryExpression
   */
  Media.prototype.getTime = function() {
    return parseFloat(this.dom.currentTime) * 100;
  };

  /**
   * Description
   * @method getDuration
   * @return BinaryExpression
   */
  Media.prototype.getDuration = function() {
    return parseFloat(this.dom.duration) * 100;
  };

  /**
   * Description
   * @method addMediaListener
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return ThisExpression
   */
  Media.prototype.addMediaListener = function(type, callback, useCapture) {
    this.el.addListener(type, callback, useCapture);
    
    return this;
  };

  /**
   * Description
   * @method removeMediaListener
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return ThisExpression
   */
  Media.prototype.removeMediaListener = function(type, callback, useCapture) {
    this.el.removeListener(type, callback, useCapture);
    
    return this;
  };

  /**
   * Description
   * @method setDraggable
   * @param {} draggable
   * @return MemberExpression
   */
  Media.prototype.setDraggable = function(draggable){
    
    draggable = draggable !== false;
  
    if(this.getProperty('locked')){
      return false;
    }

    if(draggable && !this._draggable){    
      this._draggable = new metaScore.Draggable({
        'target': this,
        'handle': this.child('video'),
        'container': this.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      });
    }
    else if(!draggable && this._draggable){
      this._draggable.destroy();
      delete this._draggable;
    }
    
    return this._draggable;
  
  };

  return Media;

})();