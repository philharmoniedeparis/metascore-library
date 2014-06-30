/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.dom.js
 */
metaScore.Draggable = metaScore.Base.extend(function(){

  var _target, _handle, _container,
    _startState, _enabled;

  this.constructor = function(target, handle, container) {
  
    if(target._draggable){
      return target._draggable;
    }
  
    _target = target;
    _handle = handle;
    
    _container = container || new metaScore.Dom('body');
    
    _handle.addListener('mousedown', this.onMouseDown);
      
    _target.addClass('draggable');
    
    _target._draggable = this;
  
  };
  
  this.onMouseDown = function(evt){
  
    if(_enabled !== true){
      return;
    }
  
    _startState = {
      'left': parseInt(_target.css('left'), 10) - evt.clientX,
      'top': parseInt(_target.css('top'), 10) - evt.clientY
    };
    
    _container
      .addListener('mouseup', this.onMouseUp)
      .addListener('mousemove', this.onMouseMove);
    
    _target.addClass('dragging');
    
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
    
    _target.removeClass('dragging'); 
    
    evt.stopPropagation();
    
  };
  
  this.enable = function(){
  
    _enabled = true;
  
    _target.addClass('draggable');
    
    return this;
  
  };
  
  this.disable = function(){
  
    _enabled = false;
  
    _target.removeClass('draggable');
    
    return this;
  
  };
});