/**
 * Field
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor');
 
metaScore.editor.Field = (function () {
  
  function Field(configs) {
    this.configs = this.getConfigs(configs);
    
    // call the super constructor.
    metaScore.Dom.call(this, this.configs.tag, this.configs.attributes);
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.disabled = false;
    
    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }
    
    if(this.configs.disabled){
      this.disable();
    }
    
    this.addListener('change', metaScore.Function.proxy(this.onChange, this));
  }
  
  Field.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    tag: '<input/>'
  };
  
  metaScore.Dom.extend(Field);
  
  Field.prototype.attributes = {
    'type': 'text',
    'class': 'field'
  };
  
  Field.prototype.onChange = function(evt){
    this.value = this.val();
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };
  
  Field.prototype.setValue = function(value, triggerChange){    
    this.val(value);
    this.value = value;
    
    if(triggerChange === true){
      this.triggerEvent('change');
    }
  };
  
  Field.prototype.getValue = function(){  
    return this.value;  
  };

  /**
  * Disable the field
  * @returns {object} the XMLHttp object
  */
  Field.prototype.disable = function(){
    this.disabled = true;
    
    this.addClass('disabled');
    this.attr('disabled', 'disabled');
    
    return this;
  };

  /**
  * Enable the field
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Field.prototype.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    this.attr('disabled', null);
    
    return this;
  };
    
  return Field;
  
})();