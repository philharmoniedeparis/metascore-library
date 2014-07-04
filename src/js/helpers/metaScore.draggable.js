/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.dom.js
 */
metaScore.Draggable = metaScore.Base.extend(function(){

  var _target, _handle, _container,
    _startState;

  this.constructor = function(target, handle, container) {
  
    _target = target;
    _handle = handle;
    
    _container = container || new metaScore.Dom('body');
    
    this.enable();
  
  };
  
  this.onMouseDown = function(evt){
  
    _startState = {
      'left': parseInt(_target.css('left'), 10) - evt.clientX,
      'top': parseInt(_target.css('top'), 10) - evt.clientY
    };
    
    _container
      .addListener('mouseup', this.onMouseUp)
      .addListener('mousemove', this.onMouseMove);
    
    _target
      .addClass('dragging')
      .triggerEvent('dragstart', null, false, true);
    
    evt.stopPropagation();
    
  };
  
  this.onMouseMove = function(evt){
  
    var left = evt.clientX + _startState.left,
      top = evt.clientY + _startState.top;
    
    _target
      .css('left', left + 'px')
      .css('top', top + 'px')
      .triggerEvent('drag', null, false, true);
    
    evt.stopPropagation();
      
  };
  
  this.onMouseUp = function(evt){  
  
    _container
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);
    
    _target
      .removeClass('dragging')
      .triggerEvent('dragend', null, false, true);
    
    evt.stopPropagation();
    
  };
  
  this.enable = function(){
  
    _target.addClass('draggable');
    
    _handle.addListener('mousedown', this.onMouseDown);
    
    return this;
  
  };
  
  this.disable = function(){
  
    _target.removeClass('draggable');
    
    _handle.removeListener('mousedown', this.onMouseDown);
    
    return this;
  
  };
  
  this.destroy = function(){
    
    this.disable();
    
    return this;
    
  };
});