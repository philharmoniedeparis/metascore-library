/**
 * ColorField
 *
 * @requires ../metaScore.editor.field.js
 * @requires ../../helpers/metaScore.object.js
 */

metaScore.namespace('editor.field').Color = (function () {

  function ColorField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    ColorField.parent.call(this, this.configs);

    this.addClass('colorfield');
  }

  ColorField.defaults = {
    /**
    * Defines the default value
    */
    value: {
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }
  };

  metaScore.editor.Field.extend(ColorField);

  ColorField.prototype.setupUI = function(){
    ColorField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this.input_wrapper);

    this.overlay = new metaScore.editor.overlay.ColorSelector()
      .addListener('select', metaScore.Function.proxy(this.onColorSelect, this));
  };

  ColorField.prototype.setValue = function(value, supressEvent){
    var rgba;
  
    this.value = value ? metaScore.Color.parse(value) : null;
    
    rgba = this.value ? 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')' : null;

    this.input
      .attr('title', rgba)
      .css('background-color', rgba);

    if(supressEvent !== true){
      this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
    }

  };

  ColorField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }

    this.overlay
      .setValue(metaScore.Object.copy(this.value))
      .show();
  };

  ColorField.prototype.onColorSelect = function(evt){
    var value = evt.detail.value,
      overlay = evt.detail.overlay;

    this.setValue(value);
  };

  ColorField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };

  return ColorField;

})();