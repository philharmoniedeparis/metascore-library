/**
* Description
* @class Page
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Page = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Page(configs) {
    // call parent constructor
    Page.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Page);

  Page.defaults = {
    'properties': {
      'background-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.background-color', 'Background color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('background-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type': 'Image',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.background-image', 'Background image')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          var value = this.css('background-image', undefined, skipDefault);

          if(value === 'none' || !metaScore.Var.is(value, "string")){
            return null;
          }

          return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
          this.css('background-image', value);
        }
      },
      'start-time': {
        'type': 'Time',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.start-time', 'Start time'),
          'checkbox': false,
          'inButton': true,
          'outButton': true
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = parseFloat(this.data('start-time'));
          return isNaN(value) ? null : value;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('start-time', isNaN(value) ? null : value);
        }
      },
      'end-time': {
        'type': 'Time',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.end-time', 'End time'),
          'checkbox': false,
          'inButton': true,
          'outButton': true
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = parseFloat(this.data('end-time'));
          return isNaN(value) ? null : value;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('end-time', isNaN(value) ? null : value);
        }
      },
      'elements': {
        'editable': false,
        /**
         * Description
         * @param {} skipDefault
         * @return elements
         */
        'getter': function(skipDefault){
          var elements = [];

          this.getElements().each(function(index, element){
            elements.push(element._metaScore.getProperties(skipDefault));
          }, this);

          return elements;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          metaScore.Array.each(value, function(index, configs){
            this.addElement(configs);
          }, this);
        }
      }
    }
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Page.prototype.setupDOM = function(){
    // call parent function
    Page.parent.prototype.setupDOM.call(this);

    this.addClass('page');
  };

  /**
   * Description
   * @method addElement
   * @param {} configs
   * @return element
   */
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

  /**
   * Description
   * @method getElements
   * @return CallExpression
   */
  Page.prototype.getElements = function(){
    return this.children('.element');
  };

  /**
   * Description
   * @method onCuePointStart
   * @param {} cuepoint
   * @return 
   */
  Page.prototype.onCuePointStart = function(cuepoint){
    this.triggerEvent('cuepointstart');
  };

  /**
   * Description
   * @method onCuePointEnd
   * @param {} cuepoint
   * @return 
   */
  Page.prototype.onCuePointEnd = function(cuepoint){
    this.triggerEvent('cuepointend');
  };

  return Page;

})();