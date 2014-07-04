/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.dom.js
 */
metaScore.Resizable = metaScore.Base.extend(function(){

  var _target, _container, _handles,
    _startState;

  this.constructor = function(target, container) {
  
    _target = target;
    
    _container = container || new metaScore.Dom('body');
    
    _handles = {};
    
    _handles.top_left = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'top-left')
      .appendTo(_target);
      
    _handles.top_right = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'top-right')
      .appendTo(_target);
      
    _handles.bottom_left = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'bottom-left')
      .appendTo(_target);
      
    _handles.bottom_right = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'bottom-right')
      .appendTo(_target);
      
    this.enable();
  
  };
  
  this.onMouseDown = function(evt){
  
    _startState = {
      'handle': evt.target,
      'x': evt.clientX,
      'y': evt.clientY,
      'left': parseInt(_target.css('left'), 10),
      'top': parseInt(_target.css('top'), 10),
      'w': parseInt(_target.css('width'), 10),
      'h': parseInt(_target.css('height'), 10)
    };
    
    _container
      .addListener('mousemove', this.onMouseMove)
      .addListener('mouseup', this.onMouseUp);
    
    _target
      .addClass('resizing')
      .triggerEvent('resizestart', null, false, true);
    
    evt.stopPropagation();
      
  };

  this.onMouseMove = function(evt){
  
    var handle = new metaScore.Dom(_startState.handle),
      w, h, top, left;
    
    switch(handle.data('direction')){
      case 'top-left':
        w = _startState.w - evt.clientX + _startState.x;
        h = _startState.h - evt.clientY + _startState.y;
        top = _startState.top + evt.clientY  - _startState.y;
        left = _startState.left + evt.clientX - _startState.x;
        break;
      case 'top-right':
        w = _startState.w + evt.clientX - _startState.x;
        h = _startState.h - evt.clientY + _startState.y;
        top = _startState.top + evt.clientY - _startState.y;
        break;
      case 'bottom-left':
        w = _startState.w - evt.clientX + _startState.x;
        h = _startState.h + evt.clientY - _startState.y;
        left = _startState.left + evt.clientX - _startState.x;
        break;
      case 'bottom-right':
        w = _startState.w + evt.clientX - _startState.x;
        h = _startState.h + evt.clientY - _startState.y;
        break;
    }
      
    if(top !== undefined){
      _target.css('top', top +'px');
    }
    if(left !== undefined){
      _target.css('left', left +'px');
    }
    
    _target
      .css('width', w +'px')
      .css('height', h +'px')
      .triggerEvent('resize', null, false, true);
    
    evt.stopPropagation();
    
  };

  this.onMouseUp = function(evt){
  
    _container
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);
    
    _target
      .removeClass('resizing')
      .triggerEvent('resizeend', null, false, true);
    
    evt.stopPropagation();
  };
  
  this.enable = function(){
  
    metaScore.Object.each(_handles, function(index, handle){
      handle.addListener('mousedown', this.onMouseDown);
    }, this);
  
    _target.addClass('resizable');
    
    return this;
  
  };
  
  this.disable = function(){
  
    metaScore.Object.each(_handles, function(index, handle){
      handle.removeListener('mousedown', this.onMouseDown);
    }, this);
  
    _target.removeClass('resizable');
    
    return this;
  
  };
  
  this.destroy = function(){
  
    this.disable();
  
    metaScore.Object.each(_handles, function(index, handle){
      handle.remove();
    }, this);
    
    return this;
  
  };
});