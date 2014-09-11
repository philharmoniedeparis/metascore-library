/**
 * CornerField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Corner = (function () {
  
  function CornerField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    CornerField.parent.call(this, this.configs);
  }
  
  CornerField.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  metaScore.editor.Field.extend(CornerField);
    
  return CornerField;
  
})();