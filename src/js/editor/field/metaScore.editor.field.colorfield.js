/**
 * ColorField
 *
 * @requires ../metaScore.editor.field.js
 * @requires ../../helpers/metaScore.object.js
 */
metaScore.Editor.Field.ColorField = metaScore.Editor.Field.extend(function(){

  // private vars
  var _button, _overlay,
    previous_value;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: {
      r: 255,
      g: 255,
      b: 255,
      a: 1
    },
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.tag = '<div/>';
  
  this.attributes = {
    'class': 'field colorfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    _button = new metaScore.Editor.Button()
      .addListener('click', this.onClick);
    
    _overlay = new metaScore.Editor.Overlay()
      .addClass('colorfield-overlay');
    
    _overlay.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(_overlay);
    _overlay.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
      .addListener('click', this.onGradientClick)
      .addListener('mousedown', this.onGradientMousedown)
      .addListener('mouseup', this.onGradientMouseup)
      .appendTo(_overlay.gradient);
    _overlay.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(_overlay.gradient);
        
    _overlay.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(_overlay);
    _overlay.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
      .addListener('click', this.onAlphaClick)
      .addListener('mousedown', this.onAlphaMousedown)
      .addListener('mouseup', this.onAlphaMouseup)
      .appendTo(_overlay.alpha);
    _overlay.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(_overlay.alpha);
    
    _overlay.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(_overlay);
    
    _overlay.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(_overlay.controls.r)
      .appendTo(_overlay.controls);
      
    _overlay.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(_overlay.controls.g)
      .appendTo(_overlay.controls);
      
    _overlay.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(_overlay.controls.b)
      .appendTo(_overlay.controls);
      
    _overlay.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(_overlay.controls.a)
      .appendTo(_overlay.controls);
      
    _overlay.controls.current = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
      .append(_overlay.controls.current)
      .appendTo(_overlay.controls);
    
    _overlay.controls.previous = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
      .append(_overlay.controls.previous)
      .appendTo(_overlay.controls);
      
    _overlay.controls.cancel = new metaScore.Editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', this.onCancelClick)
      .appendTo(_overlay.controls);
      
    _overlay.controls.apply = new metaScore.Editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', this.onApplyClick)
      .appendTo(_overlay.controls);
          
    _overlay.mask.addListener('click', this.onApplyClick);
    
    this.super(configs);
    
    new metaScore.Dom('<div/>', {'class': 'icon'})
      .appendTo(this);
    
    _button.appendTo(this);
    
    this.fillGradient();
    
  };
  
  this.setValue = function(val, refillAlpha, updatePositions, updateInputs){
  
    var hsv;
  
    if(!this.hasOwnProperty('value')){
      this.value = {};
    }
    
    if(!metaScore.Var.is(val, 'object')){
      val = this.parseColor(val);
    }
  
    if(val.hasOwnProperty('r')){
      this.value.r = parseInt(val.r, 10);
    }
    if(val.hasOwnProperty('g')){
      this.value.g = parseInt(val.g, 10);
    }
    if(val.hasOwnProperty('b')){
      this.value.b = parseInt(val.b, 10);
    }
    if(val.hasOwnProperty('a')){
      this.value.a = parseFloat(val.a);
    }
    
    if(refillAlpha !== false){
      this.fillAlpha();
    }
    
    if(updateInputs !== false){
      _overlay.controls.r.val(this.value.r);
      _overlay.controls.g.val(this.value.g);
      _overlay.controls.b.val(this.value.b);
      _overlay.controls.a.val(this.value.a);
    }
    
    if(updatePositions !== false){
      hsv = this.rgb2hsv(this.value);
      
      _overlay.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
      _overlay.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');
      
      _overlay.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
    }
    
    this.fillCurrent();
    
    _button.css('background-color', 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')');
  
  };
  
  this.onClick = function(evt){
  
    if(this.disabled){
      return;
    }
  
    previous_value = metaScore.Object.copy(this.value);
    
    this.fillPrevious();
  
    _overlay.show();
  
  };
  
  this.onControlInput = function(evt){
  
    var rgba, hsv;
    
    this.setValue({
      'r': _overlay.controls.r.val(),
      'g': _overlay.controls.g.val(),
      'b': _overlay.controls.b.val(),
      'a': _overlay.controls.a.val()
    }, true, true, false);
  
  };
  
  this.onCancelClick = function(evt){
  
    this.setValue(previous_value);
    _overlay.hide();
  
    evt.stopPropagation();
  };
  
  this.onApplyClick = function(evt){
  
    _overlay.hide();
    
    this.triggerEvent('change', {'field': this, 'value': this.value}, true, false);
  
    evt.stopPropagation();
  };
  
  this.fillPrevious = function(){
  
    var context = _overlay.controls.previous.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ previous_value.r +","+ previous_value.g +","+ previous_value.b +","+ previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillCurrent = function(){
  
    var context = _overlay.controls.current.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillGradient = function(){
  
    var context = _overlay.gradient.canvas.get(0).getContext('2d'),
      fill;
      
    // Create color gradient
    fill = context.createLinearGradient(0, 0, context.canvas.width, 0);
    fill.addColorStop(0, "rgb(255, 0, 0)");
    fill.addColorStop(0.15, "rgb(255, 0, 255)");
    fill.addColorStop(0.33, "rgb(0, 0, 255)");
    fill.addColorStop(0.49, "rgb(0, 255, 255)");
    fill.addColorStop(0.67, "rgb(0, 255, 0)");
    fill.addColorStop(0.84, "rgb(255, 255, 0)");
    fill.addColorStop(1, "rgb(255, 0, 0)");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    
    // Create semi transparent gradient (white -> trans. -> black)
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgba(255, 255, 255, 1)");
    fill.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    fill.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    fill.addColorStop(1, "rgba(0, 0, 0, 1)");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillAlpha = function(){
  
    var context = _overlay.alpha.canvas.get(0).getContext('2d'),
      fill;
      
    // Create color gradient
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgb("+ this.value.r +","+ this.value.g +","+ this.value.b +")");
    fill.addColorStop(1, "transparent");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    
  };
  
  this.onGradientMousedown = function(evt){   
    _overlay.gradient.canvas.addListener('mousemove', this.onGradientMousemove);
    
    evt.stopPropagation();
  };
  
  this.onGradientMouseup = function(evt){
    _overlay.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);
    
    evt.stopPropagation();
  };
  
  this.onGradientClick = this.onGradientMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorX = evt.pageX - offset.left,
      colorY = evt.pageY - offset.top,
      context = _overlay.gradient.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(colorX, colorY, 1, 1),
      value = this.value;
      
    _overlay.gradient.position.css('left', colorX +'px');
    _overlay.gradient.position.css('top', colorY +'px');
    
    value.r = imageData.data[0];
    value.g = imageData.data[1];
    value.b =  imageData.data[2];
    
    this.setValue(value, true, false);
    
    evt.stopPropagation();
  };
  
  this.onAlphaMousedown = function(evt){   
    _overlay.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);
    
    evt.stopPropagation();
  };
  
  this.onAlphaMouseup = function(evt){
    _overlay.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);
    
    evt.stopPropagation();
  };
  
  this.onAlphaClick = this.onAlphaMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorY = evt.pageY - offset.top,
      context = _overlay.alpha.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(0, colorY, 1, 1),
      value = this.value;
      
    _overlay.alpha.position.css('top', colorY +'px');
    
    value.a = Math.round(imageData.data[3] / 255 * 100) / 100;
    
    this.setValue(value, false, false);
    
    evt.stopPropagation();
  };
  
  this.rgb2hsv = function (rgb){
    
    var r = rgb.r, g = rgb.g, b = rgb.b,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      h, s, v;
      
    s = max === 0 ? 0 : d / max;
    v = max;

    if(max === min) {
      h = 0; // achromatic
    }
    else {
      switch(max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
          
        case g:
          h = (b - r) / d + 2;
          break;
          
        case b:
          h = (r - g) / d + 4;
          break;
      }
      
      h /= 6;
    }
    
    return {
      'h': h,
      's': s,
      'v': v
    };
  };
  
  this.parseColor = function(color){
 
    var rgba = {}, matches;
      
    color = color.replace(/\s\s*/g,''); // Remove all spaces
    
    // Checks for 6 digit hex and converts string to integer
    if (matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)){
      rgba.r = parseInt(matches[1], 16);
      rgba.g = parseInt(matches[2], 16);
      rgba.b = parseInt(matches[3], 16);
      rgba.a = 1;
    }
        
    // Checks for 3 digit hex and converts string to integer
    else if (matches = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)){
      rgba.r = parseInt(matches[1], 16) * 17;
      rgba.g = parseInt(matches[2], 16) * 17;
      rgba.b = parseInt(matches[3], 16) * 17;
      rgba.a = 1;
    }
        
    // Checks for rgba and converts string to
    // integer/float using unary + operator to save bytes
    else if (matches = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)){
      rgba.r = +matches[1];
      rgba.g = +matches[2];
      rgba.b = +matches[3];
      rgba.a = +matches[4];
    }
        
    // Checks for rgb and converts string to
    // integer/float using unary + operator to save bytes
    else if (matches = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)){
      rgba.r = +matches[1];
      rgba.g = +matches[2];
      rgba.b = +matches[3];
      rgba.a = 1;
    }
    
    return rgba;
  };
});