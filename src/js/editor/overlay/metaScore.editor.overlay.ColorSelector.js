/**
* Description
* @class ColorSelector
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').ColorSelector = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function ColorSelector(configs) {
    this.configs = this.getConfigs(configs);

    // fix event handlers scope
    this.onGradientMousemove = metaScore.Function.proxy(this.onGradientMousemove, this);
    this.onAlphaMousemove = metaScore.Function.proxy(this.onAlphaMousemove, this);

    // call parent constructor
    ColorSelector.parent.call(this, this.configs);

    this.addClass('color-selector');
  }

  ColorSelector.defaults = {

    /**
    * The parent element in which the overlay will be appended
    */
    parent: '.metaScore-editor',

    /**
    * True to make this draggable
    */
    draggable: false
  };

  metaScore.editor.Overlay.extend(ColorSelector);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  ColorSelector.prototype.setupDOM = function(){
    // call parent method
    ColorSelector.parent.prototype.setupDOM.call(this);

    this.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(this.contents);
    this.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
      .addListener('click', metaScore.Function.proxy(this.onGradientClick, this))
      .addListener('mousedown', metaScore.Function.proxy(this.onGradientMousedown, this))
      .addListener('mouseup', metaScore.Function.proxy(this.onGradientMouseup, this))
      .appendTo(this.gradient);
    this.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.gradient);

    this.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(this.contents);
    this.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
      .addListener('click', metaScore.Function.proxy(this.onAlphaClick, this))
      .addListener('mousedown', metaScore.Function.proxy(this.onAlphaMousedown, this))
      .addListener('mouseup', metaScore.Function.proxy(this.onAlphaMouseup, this))
      .appendTo(this.alpha);
    this.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.alpha);

    this.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(this.contents);

    this.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(this.controls.r)
      .appendTo(this.controls);

    this.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(this.controls.g)
      .appendTo(this.controls);

    this.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(this.controls.b)
      .appendTo(this.controls);

    this.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(this.controls.a)
      .appendTo(this.controls);

    this.controls.current = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
      .append(this.controls.current)
      .appendTo(this.controls);

    this.controls.previous = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
      .append(this.controls.previous)
      .appendTo(this.controls);

    this.controls.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(this.controls);

    this.controls.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(this.controls);

    this.fillGradient();

  };

  /**
   * Description
   * @method setValue
   * @param {} val
   * @return ThisExpression
   */
  ColorSelector.prototype.setValue = function(val){
    this.previous_value = val;

    this.fillPrevious();

    this.updateValue(val);

    return this;
  };

  /**
   * Description
   * @method updateValue
   * @param {} val
   * @param {} refillAlpha
   * @param {} updatePositions
   * @param {} updateInputs
   * @return 
   */
  ColorSelector.prototype.updateValue = function(val, refillAlpha, updatePositions, updateInputs){

    var hsv;

    this.value = this.value || {};

    if(!metaScore.Var.is(val, 'object')){
      val = metaScore.Color.parse(val);
    }

    if('r' in val){
      this.value.r = parseInt(val.r, 10);
    }
    if('g' in val){
      this.value.g = parseInt(val.g, 10);
    }
    if('b' in val){
      this.value.b = parseInt(val.b, 10);
    }
    if('a' in val){
      this.value.a = parseFloat(val.a);
    }

    if(refillAlpha !== false){
      this.fillAlpha();
    }

    if(updateInputs !== false){
      this.controls.r.val(this.value.r);
      this.controls.g.val(this.value.g);
      this.controls.b.val(this.value.b);
      this.controls.a.val(this.value.a);
    }

    if(updatePositions !== false){
      hsv = metaScore.Color.rgb2hsv(this.value);

      this.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
      this.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');

      this.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
    }

    this.fillCurrent();

  };

  /**
   * Description
   * @method fillPrevious
   * @return 
   */
  ColorSelector.prototype.fillPrevious = function(){
    var context = this.controls.previous.get(0).getContext('2d');

    context.fillStyle = "rgba("+ this.previous_value.r +","+ this.previous_value.g +","+ this.previous_value.b +","+ this.previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

  /**
   * Description
   * @method fillCurrent
   * @return 
   */
  ColorSelector.prototype.fillCurrent = function(){
    var context = this.controls.current.get(0).getContext('2d');

    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  };

  /**
   * Description
   * @method fillGradient
   * @return 
   */
  ColorSelector.prototype.fillGradient = function(){
    var context = this.gradient.canvas.get(0).getContext('2d'),
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

  /**
   * Description
   * @method fillAlpha
   * @return 
   */
  ColorSelector.prototype.fillAlpha = function(){
    var context = this.alpha.canvas.get(0).getContext('2d'),
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

  /**
   * Description
   * @method onControlInput
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onControlInput = function(evt){
    var rgba, hsv;

    this.updateValue({
      'r': this.controls.r.val(),
      'g': this.controls.g.val(),
      'b': this.controls.b.val(),
      'a': this.controls.a.val()
    }, true, true, false);
  };

  /**
   * Description
   * @method onGradientMousedown
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onGradientMousedown = function(evt){
    this.gradient.canvas.addListener('mousemove', this.onGradientMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onGradientMouseup
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onGradientMouseup = function(evt){
    this.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onGradientClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onGradientClick = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorX = evt.pageX - offset.left,
      colorY = evt.pageY - offset.top,
      context = this.gradient.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(colorX, colorY, 1, 1),
      value = this.value;

    this.gradient.position.css('left', colorX +'px');
    this.gradient.position.css('top', colorY +'px');

    value.r = imageData.data[0];
    value.g = imageData.data[1];
    value.b =  imageData.data[2];
    
    if(!value.a){
      value.a = 1;
      this.updateValue(value, true, true);
    }
    else{
      this.updateValue(value, true, false);
    }


    evt.stopPropagation();
  };

  ColorSelector.prototype.onGradientMousemove = ColorSelector.prototype.onGradientClick;

  /**
   * Description
   * @method onAlphaMousedown
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onAlphaMousedown = function(evt){
    this.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onAlphaMouseup
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onAlphaMouseup = function(evt){
    this.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onAlphaClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onAlphaClick = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorY = evt.pageY - offset.top,
      context = this.alpha.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(0, colorY, 1, 1),
      value = this.value;

    this.alpha.position.css('top', colorY +'px');

    value.a = Math.round(imageData.data[3] / 255 * 100) / 100;

    this.updateValue(value, false, false);

    evt.stopPropagation();
  };

  ColorSelector.prototype.onAlphaMousemove = ColorSelector.prototype.onAlphaClick;

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onApplyClick = function(evt){
    this.triggerEvent('select', {'overlay': this, 'value': this.value}, true, false);

    this.hide();
  };

  /**
   * Description
   * @method onCancelClick
   * @param {} evt
   * @return 
   */
  ColorSelector.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return ColorSelector;

})();