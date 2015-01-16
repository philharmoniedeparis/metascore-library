/**
 * Field
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor').Field = (function () {
  
  function Field(configs) {
    this.configs = this.getConfigs(configs);
    
    // call the super constructor.
    metaScore.Dom.call(this, '<div/>', {'class': 'field'});
    
    this.setupUI();
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.disabled = false;
    
    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }
    
    if(this.configs.disabled){
      this.disable();
    }
  }
  
  Field.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  metaScore.Dom.extend(Field);
  
  Field.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);
  
    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
  };
  
  Field.prototype.onChange = function(evt){
    this.value = this.input.val();
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };
  
  Field.prototype.setValue = function(value, supressEvent){
    this.input.val(value);
    this.value = value;
    
    if(supressEvent !== true){
      this.input.triggerEvent('change');
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
    this.input.attr('disabled', 'disabled');
    
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
    this.input.attr('disabled', null);
    
    return this;
  };
    
  return Field;
  
})();