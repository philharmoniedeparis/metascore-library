/**
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Boolean = (function () {
  
  function BooleanField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    BooleanField.parent.call(this, this.configs);
    
    if(this.configs.checked){
      this.attr('checked', 'checked');
    }
  }

  BooleanField.defaults = {
    /**
    * Defines the default value
    */
    value: true,
    
    /**
    * Defines the value when unchecked
    */
    unchecked_value: false,
    
    /**
    * Defines whether the field is checked by default
    */
    checked: false,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    attributes: {
      'type': 'checkbox',
      'class': 'field booleanfield'
    }
  };
  
  metaScore.editor.Field.extend(BooleanField);
  
  BooleanField.prototype.onChange = function(evt){      
    this.value = this.is(":checked") ? this.val() : this.configs.unchecked_value;
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);  
  };
  
  BooleanField.prototype.setChecked = function(checked){  
    this.attr('checked', checked ? 'checked' : '');  
  };
    
  return BooleanField;
  
})();