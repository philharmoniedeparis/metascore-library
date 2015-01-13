/**
 * Player Controller
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player.component').Controller = (function () {

  function Controller(configs) {    
    // call parent constructor
    Controller.parent.call(this, configs);
  }
  
  metaScore.player.Component.extend(Controller);
  
  Controller.defaults = {
    'properties': {
      'x': {
        'type': 'Number',
        'label': metaScore.String.t('X'),
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'label': metaScore.String.t('Y'),
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        'setter': function(value){
          this.css('top', value +'px');
        }
      }
    }
  };
  
  Controller.prototype.setupDOM = function(){
    // call parent function
    Controller.parent.prototype.setupDOM.call(this);
    
    this.addClass('controller');
          
    this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00:00.00'})
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
  
  Controller.prototype.updateTime = function(time){
    var centiseconds = metaScore.String.pad(parseInt((time / 10) % 100, 10), 2, '0', 'left'),
      seconds = metaScore.String.pad(parseInt((time / 1000) % 60, 10), 2, '0', 'left'),
      minutes = metaScore.String.pad(parseInt((time / 60000) % 60, 10), 2, '0', 'left'),
      hours = metaScore.String.pad(parseInt((time / 3600000), 10), 2, '0', 'left');
  
    this.timer.text(hours +':'+ minutes +':'+ seconds +'.'+ centiseconds);
  };
    
  return Controller;
  
})();