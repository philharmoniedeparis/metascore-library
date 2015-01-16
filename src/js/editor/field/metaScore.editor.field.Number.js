/**
 * NumberField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field').Number = (function () {
  
  function NumberField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    NumberField.parent.call(this, this.configs);
    
    this.addClass('numberfield');
  }
  
  NumberField.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines the minimum value allowed
    */
    min: null,
    
    /**
    * Defines the maximum value allowed
    */
    max: null
  };
  
  metaScore.editor.Field.extend(NumberField);
  
  NumberField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);
  
    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
    
    this.input = new metaScore.Dom('<input/>', {'type': 'number', 'id': uid, 'min': this.configs.min, 'max': this.configs.max, 'step': this.configs.step})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
  };
    
  return NumberField;
  
})();