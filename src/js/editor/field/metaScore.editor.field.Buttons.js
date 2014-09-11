/**
 * ButtonField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Button = (function () {
  
  function ButtonField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    ButtonField.parent.call(this, this.configs);
  }
  
  metaScore.editor.Field.extend(ButtonField);
    
  return ButtonField;
  
})();