/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.dom.js
 */
 
metaScore.Resizable = (function () {

  function Resizable(configs) {
    this.configs = this.getConfigs(configs);
    
    this.configs.container = this.configs.container || new metaScore.Dom('body');
    
    this.handles = {};
      
    // fix event handlers scope
    this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
    this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
    this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);
    
    metaScore.Array.each(this.configs.directions, function(index, direction){
      this.handles[direction] = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
        .data('direction', direction)
        .addListener('mousedown', this.onMouseDown)
        .appendTo(this.configs.target);
    }, this);
      
    this.enable();  
  }
  
  Resizable.defaults = {
    directions: [
      'top',
      'right',
      'bottom',
      'left',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ]
  };
  
  metaScore.Class.extend(Resizable);
  
  Resizable.prototype.onMouseDown = function(evt){
    if(!this.enabled){
      return;
    }
    
    this.start_state = {
      'handle': evt.target,
      'x': evt.clientX,
      'y': evt.clientY,
      'left': parseInt(this.configs.target.css('left'), 10),
      'top': parseInt(this.configs.target.css('top'), 10),
      'w': parseInt(this.configs.target.css('width'), 10),
      'h': parseInt(this.configs.target.css('height'), 10)
    };
    
    this.configs.container
      .addListener('mousemove', this.onMouseMove, this)
      .addListener('mouseup', this.onMouseUp, this);
    
    this.configs.target
      .addClass('resizing')
      .triggerEvent('resizestart', null, false, true);
    
    evt.stopPropagation();      
  };

  Resizable.prototype.onMouseMove = function(evt){  
    var handle = new metaScore.Dom(this.start_state.handle),
      w, h, top, left;
    
    switch(handle.data('direction')){
      case 'top':
        h = this.start_state.h - evt.clientY + this.start_state.y;
        top = this.start_state.top + evt.clientY  - this.start_state.y;
        break;
      case 'right':
        w = this.start_state.w + evt.clientX - this.start_state.x;
        break;
      case 'bottom':
        h = this.start_state.h + evt.clientY - this.start_state.y;
        break;
      case 'left':
        w = this.start_state.w - evt.clientX + this.start_state.x;
        left = this.start_state.left + evt.clientX - this.start_state.x;
        break;
      case 'top-left':
        w = this.start_state.w - evt.clientX + this.start_state.x;
        h = this.start_state.h - evt.clientY + this.start_state.y;
        top = this.start_state.top + evt.clientY  - this.start_state.y;
        left = this.start_state.left + evt.clientX - this.start_state.x;
        break;
      case 'top-right':
        w = this.start_state.w + evt.clientX - this.start_state.x;
        h = this.start_state.h - evt.clientY + this.start_state.y;
        top = this.start_state.top + evt.clientY - this.start_state.y;
        break;
      case 'bottom-left':
        w = this.start_state.w - evt.clientX + this.start_state.x;
        h = this.start_state.h + evt.clientY - this.start_state.y;
        left = this.start_state.left + evt.clientX - this.start_state.x;
        break;
      case 'bottom-right':
        w = this.start_state.w + evt.clientX - this.start_state.x;
        h = this.start_state.h + evt.clientY - this.start_state.y;
        break;
    }
      
    if(top !== undefined){
      this.configs.target.css('top', top +'px');
    }
    if(left !== undefined){
      this.configs.target.css('left', left +'px');
    }
    
    this.configs.target
      .css('width', w +'px')
      .css('height', h +'px')
      .triggerEvent('resize', null, false, true);
    
    evt.stopPropagation();    
  };

  Resizable.prototype.onMouseUp = function(evt){  
    this.configs.container
      .removeListener('mousemove', this.onMouseMove, this)
      .removeListener('mouseup', this.onMouseUp, this);
    
    this.configs.target
      .removeClass('resizing')
      .triggerEvent('resizeend', null, false, true);
    
    evt.stopPropagation();
  };
  
  Resizable.prototype.enable = function(){  
    this.configs.target.addClass('resizable');
    
    this.enabled = true;
    
    return this;
  };
  
  Resizable.prototype.disable = function(){  
    this.configs.target.removeClass('resizable');
    
    this.enabled = false;
    
    return this;  
  };
  
  Resizable.prototype.destroy = function(){  
    this.disable();
  
    metaScore.Object.each(this.handles, function(index, handle){
      handle.remove();
    }, this);
    
    return this;  
  };
    
  return Resizable;
  
})();