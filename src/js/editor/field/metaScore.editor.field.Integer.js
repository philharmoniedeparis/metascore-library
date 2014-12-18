/**
 * IntegerField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field').Integer = (function () {
  
  function IntegerField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    IntegerField.parent.call(this, this.configs);
    
    this.addClass('integerfield');
  }
  
  IntegerField.defaults = {
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
  
  metaScore.editor.Field.extend(IntegerField);
  
  IntegerField.prototype.setupUI = function(){  
    this.input = new metaScore.Dom('<input/>', {'type': 'number'})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);    
  };
    
  return IntegerField;
  
})();