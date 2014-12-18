/**
 * BorderRadiusrField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field').BorderRadius = (function () {
  
  function BorderRadiusrField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    BorderRadiusrField.parent.call(this, this.configs);
    
    this.addClass('borderradiusrfield');
  }
  
  metaScore.editor.Field.extend(BorderRadiusrField);
    
  return BorderRadiusrField;
  
})();