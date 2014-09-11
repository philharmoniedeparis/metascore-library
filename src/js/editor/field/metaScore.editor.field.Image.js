/**
 * ImageField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Image = (function () {
  
  function ImageField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    ImageField.parent.call(this, this.configs);

    this.addListener('change', metaScore.Function.proxy(this.onFileSelect, this), false);
  }
  
  ImageField.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    attributes: {
      'type': 'file',
      'class': 'field imagefield'
    }
  };
  
  metaScore.editor.Field.extend(ImageField);
  
  ImageField.prototype.setValue = function(val, triggerChange){  
    this.value = val;
    
    if(triggerChange !== false){
      this.triggerEvent('valuechange', {'field': this, 'value': this.value}, false, true);
    }  
  };
  
  ImageField.prototype.onFileSelect = function(evt) {  
    var files = evt.target.files;
  
    if(files.length > 0 && files[0].type.match('image.*')){
      this.file = files[0];
    }
    else{
      this.file = null;
    }
    
    /*this.getBase64(function(result){
      this.setValue(result);
    });*/    
  };
  
  ImageField.prototype.getBase64 = function(callback){  
    var reader;
  
    if(this.file){
      reader = new FileReader();
      reader.onload = metaScore.Function.proxy(function(evt){
        callback.call(this, evt.target.result, evt);
      }, this);
      reader.readAsDataURL(this.file);
    }  
  };
    
  return ImageField;
  
})();