/**
 * Cursor
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Cursor = (function () {

  function Cursor(configs) {  
    // call parent constructor
    Cursor.parent.call(this, configs);
    
    this.data('type', 'cursor');
    
    this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
      .appendTo(this.contents);
  }
  
  metaScore.player.Element.extend(Cursor);
  
  Cursor.defaults = {
    'acceleration': 1,
    'properties': metaScore.Object.extend({}, metaScore.player.Element.defaults.properties, {    
      'direction': {
        'type': 'Select',
        'label': metaScore.String.t('Direction'),
        'configs': {
          'options': {
            'right': metaScore.String.t('Left > Right'),
            'left': metaScore.String.t('Right > Left'),
            'bottom': metaScore.String.t('Top > Bottom'),
            'top': metaScore.String.t('Bottom > Top'),
          }
        }
      },
      'cursor-width': {
        'type': 'Integer',
        'label': metaScore.String.t('Cursor width')
      },
      'cursor-color': {
        'type': 'Color',
        'label': metaScore.String.t('Cursor color')
      }
    })
  };
  
  Cursor.prototype.setCuePoint = function(configs){
    if(this.cuepoint){
      this.cuepoint.stop(false);
    }
  
    this.cuepoint = new metaScore.player.CuePoint(metaScore.Object.extend({}, configs, {
      'inTime': this.getProperty('start-time'),
      'outTime': this.getProperty('end-time'),
      'onStart': metaScore.Function.proxy(this.onCuePointStart, this),
      'onUpdate': metaScore.Function.proxy(this.onCuePointUpdate, this),
      'onEnd': metaScore.Function.proxy(this.onCuePointEnd, this)
    }));
    
    return this.cuepoint;
  };
  
  Cursor.prototype.onCuePointStart = function(cuepoint){
    this.addClass('active');
  };
  
  Cursor.prototype.onCuePointUpdate = function(cuepoint, curTime){
    var width, inTime, outTime,
      curX;
    
    width = this.getProperty('width');
    inTime = this.getProperty('start-time');
    outTime = this.getProperty('end-time');
        
    if(this.configs.acceleration === 1){
      curX = width * (curTime - inTime)  / (outTime - inTime);
    }
    else{
      curX = width * Math.pow((curTime - inTime) / (outTime - inTime), this.configs.acceleration);
    }
    
    curX = Math.min(curX, width);

    this.cursor.css('left', curX +'px');
  };
  
  Cursor.prototype.onCuePointEnd = function(cuepoint){
    this.removeClass('active');
  };
    
  return Cursor;
  
})();