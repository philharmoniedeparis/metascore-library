/**
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.BooleanField = metaScore.Editor.Field.extend(function(){

  this.defaults = {    
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
    disabled: false
  };
  
  this.attributes = {
    'type': 'checkbox',
    'class': 'field booleanfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
    if(this.configs.checked){
      this.attr('checked', 'checked');
    }
    
  };
  
  this.onChange = function(evt){
  
    if(!evt.hasOwnProperty('detail')){
      evt.stopPropagation();
      
      this.value = this.is(":checked") ? this.val() : this.configs.unchecked_value;
      
      this.triggerEvent('change', {'field': this, 'value': this.value}, true, false);
    }
  
  };
  
  this.setChecked = function(checked){
  
    this.attr('checked', checked ? 'checked' : '');
  
  };
});