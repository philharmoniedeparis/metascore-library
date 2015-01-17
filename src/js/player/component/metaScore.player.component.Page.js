/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */

metaScore.namespace('player.component').Page = (function () {

  function Page(configs) {
    // call parent constructor
    Page.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Page);

  Page.defaults = {
    'properties': {
      'background-color': {
        'type': 'Color',
        'label': metaScore.Locale.t('player.component.Page.background-color', 'Background color'),
        'getter': function(skipDefault){
          return this.css('background-color', undefined, skipDefault);
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type': 'Image',
        'label': metaScore.Locale.t('player.component.Page.background-image', 'Background image'),
        'getter': function(skipDefault){
          var value = this.css('background-image', undefined, skipDefault);

          if(value === 'none' || !metaScore.Var.is(value, "string")){
            return null;
          }

          return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(value){
          value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
          this.css('background-image', value);
        }
      },
      'start-time': {
        'type': 'Time',
        'label': metaScore.Locale.t('player.component.Page.start-time', 'Start time'),
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
        'label': metaScore.Locale.t('player.component.Page.end-time', 'End time'),
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
      },
      'elements': {
        'editable': false,
        'getter': function(skipDefault){
          var elements = [];

          this.getElements().each(function(index, element){
            elements.push(element._metaScore.getProperties(skipDefault));
          }, this);

          return elements;
        },
        'setter': function(value){
          metaScore.Array.each(value, function(index, configs){
            this.addElement(configs);
          }, this);
        }
      }
    }
  };

  Page.prototype.setupDOM = function(){
    // call parent function
    Page.parent.prototype.setupDOM.call(this);

    this.addClass('page');
  };

  Page.prototype.addElement = function(configs){
    var element;

    if(configs instanceof metaScore.player.component.Element){
      element = configs;
      element.appendTo(this);
    }
    else{
      element = new metaScore.player.component.element[configs.type](metaScore.Object.extend({}, configs, {
        'container': this
      }));
    }

    return element;
  };

  Page.prototype.getElements = function(){
    return this.children('.element');
  };

  Page.prototype.onCuePointStart = function(cuepoint){
    this.triggerEvent('cuepointstart');
  };

  Page.prototype.onCuePointEnd = function(cuepoint){
    this.triggerEvent('cuepointend');
  };

  return Page;

})();