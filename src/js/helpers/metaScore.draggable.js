/**
 * Dom
 *
 * @requires ../metaScore.class.js
 * @requires metaScore.dom.js
 */
 
metaScore.Draggable = (function () {

  function Draggable(configs) {
    this.configs = this.getConfigs(configs);
    
    this.configs.container = this.configs.container || new metaScore.Dom('body');
      
    // fix event handlers scope
    this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
    this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
    this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);
    
    this.configs.handle.addListener('mousedown', this.onMouseDown);
    
    this.enable();
  }
  
  metaScore.Class.extend(Draggable);
  
  Draggable.prototype.onMouseDown = function(evt){  
    this.start_state = {
      'left': parseInt(this.configs.target.css('left'), 10) - evt.clientX,
      'top': parseInt(this.configs.target.css('top'), 10) - evt.clientY
    };
    
    this.configs.container
      .addListener('mouseup', this.onMouseUp)
      .addListener('mousemove', this.onMouseMove);
    
    this.configs.target
      .addClass('dragging')
      .triggerEvent('dragstart', null, false, true);
    
    evt.stopPropagation();    
  };
  
  Draggable.prototype.onMouseMove = function(evt){  
    var left = evt.clientX + this.start_state.left,
      top = evt.clientY + this.start_state.top;
    
    this.configs.target
      .css('left', left + 'px')
      .css('top', top + 'px')
      .triggerEvent('drag', null, false, true);
    
    evt.stopPropagation();      
  };
  
  Draggable.prototype.onMouseUp = function(evt){
    this.configs.container
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);
    
    this.configs.target
      .removeClass('dragging')
      .triggerEvent('dragend', null, false, true);
    
    evt.stopPropagation();    
  };
  
  Draggable.prototype.enable = function(){
    this.configs.target.addClass('draggable');
    
    return this;  
  };
  
  Draggable.prototype.disable = function(){  
    this.configs.target.removeClass('draggable');
    
    return this;  
  };
  
  Draggable.prototype.destroy = function(){
    this.disable();
    
    this.configs.handle.removeListener('mousedown', this.onMouseDown);
    
    return this;    
  };
    
  return Draggable;
  
})();