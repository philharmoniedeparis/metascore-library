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
    
    this.addClass('cornerfield');
  }
  
  metaScore.editor.Field.extend(CornerField);
    
  return CornerField;
  
})();