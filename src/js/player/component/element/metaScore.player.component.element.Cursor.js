/**
 * Cursor
 *
 * @requires ../metaScore.player.element.js
 */

metaScore.namespace('player.component.element').Cursor = (function () {

  function Cursor(configs) {
    // call parent constructor
    Cursor.parent.call(this, configs);
  }

  metaScore.player.component.Element.extend(Cursor);

  Cursor.defaults = {
    'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
      'direction': {
        'type': 'Select',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.direction', 'Direction'),
          'options': {
            'right': metaScore.Locale.t('player.component.element.Cursor.direction.right', 'Left > Right'),
            'left': metaScore.Locale.t('player.component.element.Cursor.direction.left', 'Right > Left'),
            'bottom': metaScore.Locale.t('player.component.element.Cursor.direction.bottom', 'Top > Bottom'),
            'top': metaScore.Locale.t('player.component.element.Cursor.direction.top', 'Bottom > Top'),
          }
        },
        'getter': function(skipDefault){
          return this.data('direction');
        },
        'setter': function(value){
          this.data('direction', value);
        }
      },
      'acceleration': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.acceleration', 'Acceleration')
        },
        'getter': function(skipDefault){
          return this.data('accel');
        },
        'setter': function(value){
          this.data('accel', value);
        }
      },
      'cursor-width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.cursor-width', 'Cursor width')
        },
        'getter': function(skipDefault){
          var value = this.cursor.css('width', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        'setter': function(value){
          this.cursor.css('width', value +'px');
        }
      },
      'cursor-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.cursor-color', 'Cursor color')
        },
        'getter': function(skipDefault){
           return this.cursor.css('background-color', undefined, skipDefault);
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.cursor.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
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

    this
      .addListener('click', metaScore.Function.proxy(this.onClick, this))
      .addListener('dblclick', metaScore.Function.proxy(this.onClick, this));
  };

  Cursor.prototype.onClick = function(evt){
    var pos, time,
      inTime, outTime,
      direction, acceleration,
      rect;

    if(metaScore.editing && evt.type !== 'dblclick'){
      return;
    }

    inTime = this.getProperty('start-time');
    outTime = this.getProperty('end-time');
    direction = this.getProperty('direction');
    acceleration = this.getProperty('acceleration');
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

  Cursor.prototype.onCuePointUpdate = function(cuepoint, curTime){
    var width, height,
      inTime, outTime, pos,
      direction = this.getProperty('direction'),
      acceleration = this.getProperty('acceleration');

    inTime = this.getProperty('start-time');
    outTime = this.getProperty('end-time');

    if(!acceleration || acceleration === 1){
      pos = (curTime - inTime)  / (outTime - inTime);
    }
    else{
      pos = Math.pow((curTime - inTime) / (outTime - inTime), acceleration);
    }

    switch(direction){
      case 'left':
        width = this.getProperty('width');
        pos = Math.min(width * pos, width);
        this.cursor.css('right', pos +'px');
        break;

      case 'bottom':
        height = this.getProperty('height');
        pos = Math.min(height * pos, height);
        this.cursor.css('top', pos +'px');
        break;

      case 'top':
        height = this.getProperty('height');
        pos = Math.min(height * pos, height);
        this.cursor.css('bottom', pos +'px');
        break;

      default:
        width = this.getProperty('width');
        pos = Math.min(width * pos, width);
        this.cursor.css('left', pos +'px');
    }
  };

  return Cursor;

})();