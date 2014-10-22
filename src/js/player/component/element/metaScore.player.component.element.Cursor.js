/**
 * Cursor
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.component.element');

metaScore.player.component.element.Cursor = (function () {

  function Cursor(configs) {
    // call parent constructor
    Cursor.parent.call(this, configs);
  }
  
  metaScore.player.component.Element.extend(Cursor);
  
  Cursor.defaults = {
    'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
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
        },
        'getter': function(){
          return this.data('direction');
        },
        'setter': function(value){
          this.data('direction', value);
        }
      },
      'acceleration': {
        'type': 'Integer',
        'label': metaScore.String.t('Acceleration'),
        'getter': function(){
          return this.data('accel');
        },
        'setter': function(value){
          this.data('accel', value);
        }
      },
      'cursor-width': {
        'type': 'Integer',
        'label': metaScore.String.t('Cursor width'),
        'getter': function(){
          return this.cursor.css('width');
        },
        'setter': function(value){
          this.cursor.css('width', value +'px');
        }
      },
      'cursor-color': {
        'type': 'Color',
        'label': metaScore.String.t('Cursor color'),
        'getter': function(){
           return this.cursor.css('background-color');
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.cursor.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'start-time': {
        'type': 'Time',
        'label': metaScore.String.t('Start time'),
        'getter': function(){
          return parseInt(this.data('start-time'), 10);
        },
        'setter': function(value){
          this.data('start-time', value);
        }
      },
      'end-time': {
        'type': 'Time',
        'label': metaScore.String.t('End time'),
        'getter': function(){
          return parseInt(this.data('end-time'), 10);
        },
        'setter': function(value){
          this.data('end-time', value);
        }
      }
    })
  };
  
  Cursor.prototype.setupDOM = function(){
    // call parent function
    Cursor.parent.prototype.setupDOM.call(this);
  
    this.data('type', 'cursor');
    
    this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
      .appendTo(this.contents);
      
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  };
  
  Cursor.prototype.onClick = function(evt){
    console.log('Cursor.prototype.onClick');
  
    var pos, time,    
      inTime = this.getProperty('start-time'),
      outTime = this.getProperty('end-time'),
      direction = this.getProperty('direction'),
      acceleration = this.getProperty('acceleration'),    
      rect = evt.target.getBoundingClientRect();

    switch(direction){
      case 'left':
        pos = (rect.right - evt.clientX) / this.getProperty('width');
        break;
        
      case 'bottom':
        pos = (evt.clientY - rect.top) / this.getProperty('height');
        break;
        
      case 'top':
        pos = (rect.bottom - evt.clientY) / this.getProperty('height');
        break;
        
      default:
        pos = (evt.clientX - rect.left) / this.getProperty('width');
    }
    
    if(!acceleration || acceleration === 1){
        time = inTime + ((outTime - inTime) * pos);
    }
    else{
        time = inTime + ((outTime - inTime) * Math.pow(pos, 1/acceleration));
    }
    
    this.triggerEvent('time', {'element': this, 'value': time});
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
    var width,
      inTime, outTime, curX,
      direction = this.getProperty('direction'),
      acceleration = this.getProperty('acceleration');
    
    width = this.getProperty('width');
    inTime = this.getProperty('start-time');
    outTime = this.getProperty('end-time');
        
    if(!acceleration || acceleration === 1){
      curX = width * (curTime - inTime)  / (outTime - inTime);
    }
    else{
      curX = width * Math.pow((curTime - inTime) / (outTime - inTime), acceleration);
    }
    
    curX = Math.min(curX, width);

    switch(direction){
      case 'left':
        this.cursor.css('right', curX +'px');
        break;
        
      case 'bottom':
        this.cursor.css('top', curX +'px');
        break;
        
      case 'top':
        this.cursor.css('bottom', curX +'px');
        break;
        
      default:
        this.cursor.css('left', curX +'px');
    }
  };
  
  Cursor.prototype.onCuePointEnd = function(cuepoint){
    this.removeClass('active');
  };
    
  return Cursor;
  
})();