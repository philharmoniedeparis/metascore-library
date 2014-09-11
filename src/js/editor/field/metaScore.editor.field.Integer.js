/**
 * IntegerField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Integer = (function () {
  
  function IntegerField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    IntegerField.parent.call(this, this.configs);
  }
  
  IntegerField.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the minimum value allowed
    */
    min: null,
    
    /**
    * Defines the maximum value allowed
    */
    max: null,
    
    attributes: {
      'type': 'number',
      'class': 'field integerfield'
    }
  };
  
  metaScore.editor.Field.extend(IntegerField);
    
  return IntegerField;
  
})();