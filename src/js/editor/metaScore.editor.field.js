/**
 * Field
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Field = metaScore.Dom.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
  };
  
  this.tag = '<input/>';
  
  this.attributes = {
    'type': 'text',
    'class': 'field'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(this.tag, this.attributes);
  
    this.initConfig(configs);
    
    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }
    
    if(this.configs.disabled){
      this.disable();
    }
    
    this.addListener('change', this.onChange);
    
  };
  
  this.onChange = function(evt){
  
    if(!evt.hasOwnProperty('detail')){
      evt.stopPropagation();
      
      this.value = this.val();
      
      this.triggerEvent('change', {'field': this, 'value': this.value}, true, false);
    }
  
  };
  
  this.setValue = function(val){
    
    this.val(val);    
  
  };

  /**
  * Disable the field
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
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
  this.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    this.attr('disabled', null);
    
    return this;
  };
});