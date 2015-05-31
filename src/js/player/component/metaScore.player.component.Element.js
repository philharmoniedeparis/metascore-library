/**
* Description
* @class Element
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Element = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Element(configs) {
    // call parent constructor
    Element.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Element);

  Element.defaults = {
    'properties': {
      'name': {
        'type': 'Text',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.name', 'Name')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.data('name');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('name', value);
        }
      },
      'type': {
        'editable':false,
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.data('type');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('type', value);
        }
      },
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.locked', 'Locked ?')
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
          'label': metaScore.Locale.t('player.component.Element.x', 'X')
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
          'label': metaScore.Locale.t('player.component.Element.y', 'Y')
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
        }
      },
      'width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.width', 'Width'),
          'min': 10
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
          'label': metaScore.Locale.t('player.component.Element.height', 'Height'),
          'min': 10
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
      'r-index': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.r-index', 'Reading index'),
          'min': 0
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.data('r-index');
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('r-index', value);
        }
      },
      'z-index': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.css('z-index', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('z-index', value);
        }
      },
      'background-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.background-color', 'Background color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('background-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.contents.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type': 'Image',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.background-image', 'Background image')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          var value = this.contents.css('background-image', undefined, skipDefault);

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
          this.contents.css('background-image', value);
        }
      },
      'border-width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.border-width', 'Border width')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.contents.css('border-width', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.border-color', 'Border color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('border-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.contents.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.border-radius', 'Border radius')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('border-radius', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.css('border-radius', value);
        }
      },
      'opacity': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.opacity', 'Opacity'),
          'min': 0,
          'max': 1,
          'step': 0.1
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('opacity', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.css('opacity', value);
        }
      },
      'start-time': {
        'type': 'Time',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.start-time', 'Start time'),
          'checkbox': true,
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
          'label': metaScore.Locale.t('player.component.Element.end-time', 'End time'),
          'checkbox': true,
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
      }
    }
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Element.prototype.setupDOM = function(){
    // call parent function
    Element.parent.prototype.setupDOM.call(this);

    this.addClass('element');

    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
  };

  /**
   * Description
   * @method getBlock
   * @return CallExpression
   */
  Element.prototype.getPage = function(){
    var dom = this.parents().get(0),
      page;
    
    if(dom){
      page = dom._metaScore;
    
    }
    return page;
  };

  /**
   * Description
   * @method onCuePointStart
   * @param {} cuepoint
   * @return 
   */
  Element.prototype.onCuePointStart = function(cuepoint){
    this.addClass('active');
  };

  /**
   * Description
   * @method onCuePointEnd
   * @param {} cuepoint
   * @return 
   */
  Element.prototype.onCuePointEnd = function(cuepoint){
    this.removeClass('active');
  };

  /**
   * Description
   * @method setDraggable
   * @param {} draggable
   * @return MemberExpression
   */
  Element.prototype.setDraggable = function(draggable){
  
    if(this.getProperty('locked')){
      return false;
    }
    
    draggable = draggable !== false;

    if(draggable && !this._draggable){
      this._draggable = new metaScore.Draggable({
        'target': this,
        'handle': this,
        'container': this.parents()
      });
    }
    else if(!draggable && this._draggable){
      this._draggable.destroy();
      delete this._draggable;
    }
    
    return this._draggable;
  
  };

  /**
   * Description
   * @method setResizable
   * @param {} resizable
   * @return MemberExpression
   */
  Element.prototype.setResizable = function(resizable){
    
    resizable = resizable !== false;
  
    if(resizable && !this._resizable){
      this._resizable = new metaScore.Resizable({
        'target': this,
        'container': this.parents()
      });
    }
    else if(!resizable && this._resizable){
      this._resizable.destroy();
      delete this._resizable;
    }
    
    return this._resizable;
  
  };

  return Element;

})();