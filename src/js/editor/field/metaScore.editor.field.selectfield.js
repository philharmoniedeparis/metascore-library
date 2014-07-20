/**
 * SelectField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.SelectField = metaScore.Editor.Field.extend(function(){
  
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the maximum value allowed
    */
    options: {}
  };
  
  this.tag = '<select/>';
  
  this.attributes = {
    'class': 'field selectfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(configs);
    
    this.setOptions(this.configs.options);
    
  };
  
  this.setOptions = function(options){
  
    metaScore.Object.each(options, function(key, value){    
      this.append(new metaScore.Dom('<option/>', {'text': value, 'value': key}));
    }, this);
    
  };
  
  this.setValue = function(value){
    
    this.val(value);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  this.getValue = function(){
  
    return this.value;
  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    this
      .attr('disabled', 'disabled')
      .addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    this
      .attr('disabled', null)
      .removeClass('disabled');
    
    return this;
  };
});