/*global metaScore console*/

metaScore.Editor.Field.ColorField = metaScore.Editor.Field.extend(function(){

  // private vars
  var overlay;
  
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
    
    overlay = new metaScore.Editor.Overlay({
      'parent': '.metaScore-editor',
      'modal': false
    }).addClass('colorfield-overlay');
    
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
    
    overlay.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'});
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(overlay.controls.r)
      .appendTo(overlay.controls);
      
    overlay.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'});
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(overlay.controls.g)
      .appendTo(overlay.controls);
      
    overlay.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'});
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(overlay.controls.b)
      .appendTo(overlay.controls);
      
    overlay.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'a'});
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(overlay.controls.a)
      .appendTo(overlay.controls);
      
    overlay.controls.current = new metaScore.Dom('<canvas/>', {'width': '100', 'height': '50'})
      .appendTo(overlay.controls);
    
    overlay.controls.previous = new metaScore.Dom('<canvas/>', {'width': '100', 'height': '25'})
      .appendTo(overlay.controls);
      
    overlay.controls.cancel = new metaScore.Editor.Button({'label': 'Cancel'})
      .appendTo(overlay.controls);
      
    overlay.controls.apply = new metaScore.Editor.Button({'label': 'Apply'})
      .appendTo(overlay.controls);
      
    
    this.super(configs);
    
    this.fillGradient();
    
    this.addListener('click', this.onClick);
    
  };
  
  this.setValue = function(val, refillAlpha){
  
    this.value = val;
    
    overlay.controls.r.val(this.value.r);
    overlay.controls.g.val(this.value.g);
    overlay.controls.b.val(this.value.b);
    overlay.controls.a.val(this.value.a);
    
    if(refillAlpha !== false){
      this.fillAlpha();
    }
    
    this.fillCurrent();
  
  };
  
  this.onClick = function(evt){
  
    this.previous_value = this.value;
    
    this.fillPrevious();
  
    overlay.show();
  
  };
  
  this.fillPrevious = function(){
  
    var context = overlay.controls.previous.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ this.previous_value.r +","+ this.previous_value.g +","+ this.previous_value.b +","+ this.previous_value.a +")";
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
    
    this.setValue(value);
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
    
    this.setValue(value, false);
  };
});