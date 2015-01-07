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
      
    // fix event handlers scope
    this.onColorSelect = metaScore.Function.proxy(this.onColorSelect, this);
  
    this.button = new metaScore.editor.Button()
      .addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    this.overlay = new metaScore.editor.overlay.ColorSelector({
      selectCallback: this.onColorSelect
    });
    
    this.button.appendTo(this);
  };
  
  ColorField.prototype.setValue = function(val, supressEvent){
    
    this.value = metaScore.Color.parse(val);
    
    this.button.css('background-color', 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')');
    
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
  
  ColorField.prototype.onColorSelect = function(value, overlay){
    this.setValue(value);
    overlay.hide();
  };
    
  return ColorField;
  
})();