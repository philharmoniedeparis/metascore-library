/**
* Color Field
*/
metaScore.Editor.Field.ColorField = metaScore.Editor.Field.extend(function(){

  // private vars
  var button, overlay,
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
  
    button = new metaScore.Editor.Button()
      .addListener('click', this.onClick);
    
    overlay = new metaScore.Editor.Overlay()
      .addClass('colorfield-overlay');
    
    overlay.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(overlay);
    overlay.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
      .addListener('click', this.onGradientClick)
      .addListener('mousedown', this.onGradientMousedown)
      .addListener('mouseup', this.onGradientMouseup)
      .appendTo(overlay.gradient);
    overlay.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(overlay.gradient);
        
    overlay.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(overlay);
    overlay.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
      .addListener('click', this.onAlphaClick)
      .addListener('mousedown', this.onAlphaMousedown)
      .addListener('mouseup', this.onAlphaMouseup)
      .appendTo(overlay.alpha);
    overlay.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(overlay.alpha);
    
    overlay.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(overlay);
    
    overlay.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(overlay.controls.r)
      .appendTo(overlay.controls);
      
    overlay.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(overlay.controls.g)
      .appendTo(overlay.controls);
      
    overlay.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(overlay.controls.b)
      .appendTo(overlay.controls);
      
    overlay.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(overlay.controls.a)
      .appendTo(overlay.controls);
      
    overlay.controls.current = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
      .append(overlay.controls.current)
      .appendTo(overlay.controls);
    
    overlay.controls.previous = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
      .append(overlay.controls.previous)
      .appendTo(overlay.controls);
      
    overlay.controls.cancel = new metaScore.Editor.Button({'label': 'Cancel'})
      .addListener('click', this.onCancelClick)
      .appendTo(overlay.controls);
      
    overlay.controls.apply = new metaScore.Editor.Button({'label': 'Apply'})
      .addListener('click', this.onApplyClick)
      .appendTo(overlay.controls);
          
    overlay.mask.addListener('click', this.onOverlayMaskClick);
    
    this.super(configs);
    
    new metaScore.Dom('<div/>', {'class': 'icon'})
      .appendTo(this);
    
    button.appendTo(this);
    
    this.fillGradient();
    
  };
  
  this.setValue = function(val, refillAlpha, updatePositions, updateInputs){
  
    var hsv;
  
    if(!this.hasOwnProperty('value')){
      this.value = {};
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
      overlay.controls.r.val(this.value.r);
      overlay.controls.g.val(this.value.g);
      overlay.controls.b.val(this.value.b);
      overlay.controls.a.val(this.value.a);
    }
    
    if(updatePositions !== false){
      hsv = this.rgb2hsv(this.value);
      
      overlay.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
      overlay.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');
      
      overlay.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
    }
    
    this.fillCurrent();
    
    button.css('background-color', 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')');
  
  };
  
  this.onClick = function(evt){
  
    previous_value = metaScore.Object.copy(this.value);
    
    this.fillPrevious();
  
    overlay.show();
  
  };
  
  this.onControlInput = function(evt){
  
    var rgba, hsv;
    
    this.setValue({
      'r': overlay.controls.r.val(),
      'g': overlay.controls.g.val(),
      'b': overlay.controls.b.val(),
      'a': overlay.controls.a.val()
    }, true, true, false);
  
  };
  
  this.onCancelClick = function(evt){
  
    this.setValue(previous_value);
    overlay.hide();
  
    evt.preventDefault();
  };
  
  this.onApplyClick = function(evt){
  
    overlay.hide();
  
    evt.preventDefault();
  };
  
  this.onOverlayMaskClick = function(evt){
  
    overlay.hide();
  
    evt.preventDefault();
  };
  
  this.fillPrevious = function(){
  
    var context = overlay.controls.previous.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ previous_value.r +","+ previous_value.g +","+ previous_value.b +","+ previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillCurrent = function(){
  
    var context = overlay.controls.current.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillGradient = function(){
  
    var context = overlay.gradient.canvas.get(0).getContext('2d'),
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
  
    var context = overlay.alpha.canvas.get(0).getContext('2d'),
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
    overlay.gradient.canvas.addListener('mousemove', this.onGradientMousemove);
  };
  
  this.onGradientMouseup = function(evt){
    overlay.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);
  };
  
  this.onGradientClick = this.onGradientMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorX = evt.pageX - offset.left,
      colorY = evt.pageY - offset.top,
      context = overlay.gradient.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(colorX, colorY, 1, 1),
      value = this.value;
      
    overlay.gradient.position.css('left', colorX +'px');
    overlay.gradient.position.css('top', colorY +'px');
    
    value.r = imageData.data[0];
    value.g = imageData.data[1];
    value.b =  imageData.data[2];
    
    this.setValue(value, true, false);
  };
  
  this.onAlphaMousedown = function(evt){   
    overlay.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);
  };
  
  this.onAlphaMouseup = function(evt){
    overlay.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);
  };
  
  this.onAlphaClick = this.onAlphaMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorY = evt.pageY - offset.top,
      context = overlay.alpha.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(0, colorY, 1, 1),
      value = this.value;
      
    overlay.alpha.position.css('top', colorY +'px');
    
    value.a = Math.round(imageData.data[3] / 255 * 100) / 100;
    
    this.setValue(value, false, false);
  };
  
  this.rgb2hsv = function (rgb){
    
    var r = rgb.r, g = rgb.g, b = rgb.b,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      h, s, v;
      
    s = max === 0 ? 0 : d / max,
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
});