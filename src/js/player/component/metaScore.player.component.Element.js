/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('player.component').Element = (function () {

  function Element(configs) {
    // call parent constructor
    Element.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Element);

  Element.defaults = {
    'properties': {
      'name': {
        'type': 'Text',
        'label': metaScore.Locale.t('player.component.Element.name', 'Name'),
        'getter': function(skipDefault){
          return this.data('name');
        },
        'setter': function(value){
          this.data('name', value);
        }
      },
      'type': {
        'editable':false,
        'getter': function(skipDefault){
          return this.data('type');
        },
        'setter': function(value){
          this.data('type', value);
        }
      },
      'x': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.x', 'X'),
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.y', 'Y'),
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        'setter': function(value){
          this.css('top', value +'px');
        }
      },
      'width': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.width', 'Width'),
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.height', 'Height'),
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'r-index': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.r-index', 'Reading index'),
        'configs': {
          'min': 0
        },
        'getter': function(skipDefault){
          var value = this.data('r-index');
          return value !== null ? parseInt(value, 10) : null;
        },
        'setter': function(value){
          this.data('r-index', value);
        }
      },
      'z-index': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index'),
        'getter': function(skipDefault){
          var value = this.css('z-index', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        'setter': function(value){
          this.css('z-index', value);
        }
      },
      'background-color': {
        'type': 'Color',
        'label': metaScore.Locale.t('player.component.Element.background-color', 'Background color'),
        'getter': function(skipDefault){
          return this.contents.css('background-color', undefined, skipDefault);
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.contents.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type': 'Image',
        'label': metaScore.Locale.t('player.component.Element.background-image', 'Background image'),
        'getter': function(skipDefault){
          var value = this.contents.css('background-image', undefined, skipDefault);

          if(value === 'none' || !metaScore.Var.is(value, "string")){
            return null;
          }

          return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(value){
          value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
          this.contents.css('background-image', value);
        }
      },
      'border-width': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.border-width', 'Border width'),
        'getter': function(skipDefault){
          var value = this.contents.css('border-width', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        'setter': function(value){
          this.contents.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': 'Color',
        'label': metaScore.Locale.t('player.component.Element.border-color', 'Border color'),
        'getter': function(skipDefault){
          return this.contents.css('border-color', undefined, skipDefault);
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.contents.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'label': metaScore.Locale.t('player.component.Element.border-radius', 'Border radius'),
        'getter': function(skipDefault){
          return this.contents.css('border-radius', undefined, skipDefault);
        },
        'setter': function(value){
          this.contents.css('border-radius', value);
        }
      },
      'opacity': {
        'type': 'Number',
        'label': metaScore.Locale.t('player.component.Element.opacity', 'Opacity'),
        'configs': {
          'min': 0,
          'max': 1,
          'step': 0.1
        },
        'getter': function(skipDefault){
          return this.contents.css('opacity', undefined, skipDefault);
        },
        'setter': function(value){
          this.contents.css('opacity', value);
        }
      },
      'start-time': {
        'type': 'Time',
        'label': metaScore.Locale.t('player.component.Element.start-time', 'Start time'),
        'configs': {
          'checkbox': true,
          'inButton': true,
          'outButton': true
        },
        'getter': function(skipDefault){
          var value = parseFloat(this.data('start-time'));
          return isNaN(value) ? null : value;
        },
        'setter': function(value){
          this.data('start-time', isNaN(value) ? null : value);
        }
      },
      'end-time': {
        'type': 'Time',
        'label': metaScore.Locale.t('player.component.Element.end-time', 'End time'),
        'configs': {
          'checkbox': true,
          'inButton': true,
          'outButton': true
        },
        'getter': function(skipDefault){
          var value = parseFloat(this.data('end-time'));
          return isNaN(value) ? null : value;
        },
        'setter': function(value){
          this.data('end-time', isNaN(value) ? null : value);
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

  Element.prototype.onCuePointStart = function(cuepoint){
    this.addClass('active');
  };

  Element.prototype.onCuePointEnd = function(cuepoint){
    this.removeClass('active');
  };

  return Element;

})();