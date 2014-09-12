/* global Drupal */
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
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.addListener('change', metaScore.Function.proxy(this.onFileSelect, this), false);
    
    this.attr('readonly', 'readonly');
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
      'class': 'field imagefield'
    }
  };
  
  metaScore.editor.Field.extend(ImageField);
    
  ImageField.prototype.onClick = function(evt){
    Drupal.media.popups.mediaBrowser(metaScore.Function.proxy(this.onFileSelect, this));
  };
  
  ImageField.prototype.onFileSelect = function(files){
    if(files.length > 0){
      this.setValue(files[0].url);
    }
  };
  
  ImageField.prototype.setValue = function(value){    
    this.val(value);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);  
  };
    
  return ImageField;
  
})();