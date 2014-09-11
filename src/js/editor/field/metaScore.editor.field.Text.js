/**
 * TextField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Text = (function () {
  
  function TextField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    TextField.parent.call(this, this.configs);
  }

  TextField.defaults = {
    /**
    * Defines the default value
    */
    value: '',
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    attributes: {
      'class': 'field textfield'
    }
  };
  
  metaScore.editor.Field.extend(TextField);
    
  return TextField;
  
})();