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
    Controller.parent.call(this, '<div/>', {'class': 'metaScore-block controller'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
          
    this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
      .appendTo(this);
      
    buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
          
    this.rewind_btn = new metaScore.Dom('<button/>')
      .data('action', 'rewind')
      .appendTo(buttons);
          
    this.play_btn = new metaScore.Dom('<button/>')
      .data('action', 'play')
      .appendTo(buttons);
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  metaScore.Dom.extend(Controller);
  
  Controller.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'block': this});
    
      evt.stopPropagation();
    }
  };
  
  Controller.prototype.getProperty = function(prop){
    switch(prop){
      case 'x':
        return parseInt(this.css('left'), 10);
        
      case 'y':
        return parseInt(this.css('top'), 10);
    }
  };
  
  Controller.prototype.setProperty = function(prop, value){
    switch(prop){        
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
    }
  };
  
  Controller.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Controller;
  
})();