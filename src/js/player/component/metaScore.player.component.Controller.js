/**
* Description
* @class Controller
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Controller = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Controller(configs) {
    // call parent constructor
    Controller.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Controller);

  Controller.defaults = {
    'properties': {
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Controller.locked', 'Locked ?')
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
          'label': metaScore.Locale.t('player.component.Controller.x', 'X')
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
          'label': metaScore.Locale.t('player.component.Controller.y', 'Y')
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
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Controller.border-radius', 'Border radius')
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
  Controller.prototype.setupDOM = function(){
    // call parent function
    Controller.parent.prototype.setupDOM.call(this);

    this.addClass('controller');

    this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
      .appendTo(this);

    this.rewind_btn = new metaScore.Dom('<button/>')
      .data('action', 'rewind');

    this.play_btn = new metaScore.Dom('<button/>')
      .data('action', 'play');

    new metaScore.Dom('<div/>', {'class': 'buttons'})
      .append(this.rewind_btn)
      .append(this.play_btn)
      .appendTo(this);
  };

  /**
   * Description
   * @method getName
   * @return Literal
   */
  Controller.prototype.getName = function(){
    return '[controller]';
  };

  /**
   * Description
   * @method updateTime
   * @param {} time
   * @return 
   */
  Controller.prototype.updateTime = function(time){
    var centiseconds = metaScore.String.pad(parseInt((time / 10) % 100, 10), 2, '0', 'left'),
      seconds = metaScore.String.pad(parseInt((time / 1000) % 60, 10), 2, '0', 'left'),
      minutes = metaScore.String.pad(parseInt((time / 60000), 10), 2, '0', 'left');

    this.timer.text(minutes +':'+ seconds +'.'+ centiseconds);
  };

  return Controller;

})();