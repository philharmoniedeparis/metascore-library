/**
 * ImageField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.ImageField = metaScore.Editor.Field.extend(function(){

  // private vars
  var _file;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.attributes = {
    'type': 'file',
    'class': 'field imagefield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);

    this.addListener('change', this.onFileSelect, false);
    
  };
  
  this.setValue = function(val, triggerChange){
  
    this.value = val;
    
    if(triggerChange !== false){
      this.triggerEvent('change', {'field': this, 'value': this.value}, false, true);
    }
  
  };
  
  this.onFileSelect = function(evt) {
  
    var files = evt.target.files;
  
    if(files.length > 0 && files[0].type.match('image.*')){
      _file = files[0];
    }
    else{
      _file = null;
    }
    
    /*this.getBase64(function(result){
      this.setValue(result);
    });*/
    
  };
  
  this.getBase64 = function(callback){
  
    var reader;
  
    if(_file){
      reader = new FileReader();
      reader.onload = metaScore.Function.proxy(function(evt){
        callback.call(this, evt.target.result, evt);
      }, this);
      reader.readAsDataURL(_file);
    }
  
  };
});