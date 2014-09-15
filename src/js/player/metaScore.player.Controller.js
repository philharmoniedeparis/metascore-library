/**
 * Player Controller
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player');

metaScore.player.Controller = (function () {

  function Controller(configs) {
    var buttons;
  
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Controller.parent.call(this);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'metaScore-controller'});
    this.dom.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.dom.appendTo(this.configs.container);
    }
          
    this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
      .appendTo(this.dom);
      
    buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this.dom);
          
    this.rewind_btn = new metaScore.Dom('<button/>', {'data-action': 'rewind'})
      .appendTo(buttons);
          
    this.play_btn = new metaScore.Dom('<button/>', {'data-action': 'play'})
      .appendTo(buttons);
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  Controller.defaults = {
    'container': null
  };
  
  metaScore.Evented.extend(Controller);
  
  Controller.prototype.onClick = function(evt){
    this.triggerEvent('click');
    
    evt.stopPropagation();    
  };
  
  Controller.prototype.destroy = function(){
    this.dom.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Controller;
  
})();