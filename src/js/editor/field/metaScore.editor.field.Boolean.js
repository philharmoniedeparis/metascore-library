/**
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field').Boolean = (function () {
  
  function BooleanField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    BooleanField.parent.call(this, this.configs);
        
    this.addClass('booleanfield');
    
    if(this.configs.checked){
      this.input.attr('checked', 'checked');
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
    checked: false
  };
  
  metaScore.editor.Field.extend(BooleanField);
  
  BooleanField.prototype.setupUI = function(){  
    this.input = new metaScore.Dom('<input/>', {'type': 'checkbox'})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);    
  };
  
  BooleanField.prototype.onChange = function(evt){      
    this.value = this.input.is(":checked") ? this.input.val() : this.configs.unchecked_value;
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);  
  };
  
  BooleanField.prototype.setChecked = function(checked){
    this.input.attr('checked', checked ? 'checked' : '');  
  };
    
  return BooleanField;
  
})();