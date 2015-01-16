/**
 * TextareaField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field').Textarea = (function () {
  
  function TextareaField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    TextareaField.parent.call(this, this.configs);
    
    this.addClass('textareafield');
  }

  TextareaField.defaults = {
    /**
    * Defines the default value
    */
    value: ''
  };
  
  metaScore.editor.Field.extend(TextareaField);
  
  TextareaField.prototype.setupUI = function(){  
    var uid = 'field-'+ metaScore.String.uuid(5);
  
    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
    
    this.input = new metaScore.Dom('<textarea/>', {'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this);
  };
    
  return TextareaField;
  
})();