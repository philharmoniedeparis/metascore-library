/**
 * SelectField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Select = (function () {
  
  function SelectField(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    SelectField.parent.call(this, this.configs);
    
    this.setOptions(this.configs.options);
  }
  
  SelectField.defaults = {
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
    options: {},
    
    tag: '<select/>',
    
    attributes: {
      'class': 'field selectfield'
    }
  };
  
  metaScore.editor.Field.extend(SelectField);
  
  SelectField.prototype.setOptions = function(options){
  
    metaScore.Object.each(options, function(key, value){    
      this.append(new metaScore.Dom('<option/>', {'text': value, 'value': key}));
    }, this);
    
  };
  
  SelectField.prototype.setValue = function(value){
    
    this.val(value);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  SelectField.prototype.getValue = function(){
  
    return this.value;
  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  SelectField.prototype.disable = function(){
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
  SelectField.prototype.enable = function(){
    this.disabled = false;
    
    this
      .attr('disabled', null)
      .removeClass('disabled');
    
    return this;
  };
    
  return SelectField;
  
})();