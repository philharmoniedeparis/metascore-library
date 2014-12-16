/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player.component');

metaScore.player.component.Element = (function () {

  function Element(configs) {
    // call parent constructor
    Element.parent.call(this, configs);
  }
  
  metaScore.player.Component.extend(Element);
  
  Element.defaults = {
    'properties': {
      'id': {
        'editable':false,
        'getter': function(){
          return this.data('id');
        },
        'setter': function(value){
          this.data('id', value);
        }
      },
      'name': {
        'type': 'Text',
        'label': metaScore.String.t('Name'),
        'getter': function(){
          return this.data('name');
        },
        'setter': function(value){
          this.data('name', value);
        }
      },
      'type': {
        'editable':false,
        'getter': function(){
          return this.data('type');
        },
        'setter': function(value){
          this.data('type', value);
        }
      },
      'x': {
        'type': 'Integer',
        'label': metaScore.String.t('X'),
        'getter': function(){
          return parseInt(this.css('left'), 10);
        },
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Integer',
        'label': metaScore.String.t('Y'),
        'getter': function(){
          return parseInt(this.css('top'), 10);
        },
        'setter': function(value){
          this.css('top', value +'px');
        }
      },
      'width': {
        'type': 'Integer',
        'label': metaScore.String.t('Width'),
        'getter': function(){
          return parseInt(this.css('width'), 10);
        },
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Integer',
        'label': metaScore.String.t('Height'),
        'getter': function(){
          return parseInt(this.css('height'), 10);
        },
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'r-index': {
        'type': 'Integer',
        'label': metaScore.String.t('Reading index'),
        'configs': {
          'min': 0
        },
        'getter': function(){
          return parseInt(this.data('r-index'), 10);
        },
        'setter': function(value){
          this.data('r-index', value);
        }
      },
      'z-index': {
        'type': 'Integer',
        'label': metaScore.String.t('Display index'),
        'getter': function(){
          return parseInt(this.css('z-index'), 10);
        },
        'setter': function(value){
          this.css('z-index', value);
        }
      },
      'background-color': {
        'type': 'Color',
        'label': metaScore.String.t('Background color'),
        'getter': function(){
          return this.css('background-color');
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type': 'Image',
        'label': metaScore.String.t('Background image'),
        'getter': function(){
          return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(value){
          if(metaScore.Var.is(value, "string")){
           value = 'url('+ value +')';
          }        
          this.css('background-image', value);
        }
      },
      'border-width': {
        'type': 'Integer',
        'label': metaScore.String.t('Border width'),
        'getter': function(){
          return parseInt(this.css('border-width'), 10);
        },
        'setter': function(value){
          this.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': 'Color',
        'label': metaScore.String.t('Border color'),
        'getter': function(){
          return this.css('border-color');
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'label': metaScore.String.t('Border radius'),
        'getter': function(){
          return this.css('border-radius');
        },
        'setter': function(value){
          this.css('border-radius', value);
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
    }
  };
  
  Element.prototype.setupDOM = function(){
    // call parent function
    Element.parent.prototype.setupDOM.call(this);
    
    this.addClass('element');
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
  };
  
  Element.prototype.setCuePoint = function(configs){
    if(this.cuepoint){
      this.cuepoint.stop(false);
    }
  
    this.cuepoint = new metaScore.player.CuePoint(metaScore.Object.extend({}, configs, {
      'inTime': this.getProperty('start-time'),
      'outTime': this.getProperty('end-time'),
      'onStart': metaScore.Function.proxy(this.onCuePointStart, this),
      'onEnd': metaScore.Function.proxy(this.onCuePointEnd, this)
    }));
    
    return this.cuepoint;
  };
  
  Element.prototype.onCuePointStart = function(cuepoint){
    this.addClass('active');
  };
  
  Element.prototype.onCuePointEnd = function(cuepoint){
    this.removeClass('active');
  };
    
  return Element;
  
})();