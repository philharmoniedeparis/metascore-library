/**
 * SelectField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field').Select = (function () {
  
  function SelectField(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    SelectField.parent.call(this, this.configs);
    
    this.addClass('selectfield');
  }
  
  SelectField.defaults = {    
    /**
    * Defines the maximum value allowed
    */
    options: {}
  };
  
  metaScore.editor.Field.extend(SelectField);
  
  SelectField.prototype.setupUI = function(){  
    var uid = 'field-'+ metaScore.String.uuid(5);
  
    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
    
    this.input = new metaScore.Dom('<select/>', {'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
      
      metaScore.Object.each(this.configs.options, function(key, value){    
        this.input.append(new metaScore.Dom('<option/>', {'text': value, 'value': key}));
      }, this);  
  };
    
  return SelectField;
  
})();