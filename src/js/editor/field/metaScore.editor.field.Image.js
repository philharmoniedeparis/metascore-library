/* global Drupal */
/**
 * ImageField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field').Image = (function () {
  
  function ImageField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    ImageField.parent.call(this, this.configs);
    
    this.addClass('imagefield');
        
    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  metaScore.editor.Field.extend(ImageField);
  
  ImageField.prototype.onClick = function(evt){
    Drupal.media.popups.mediaBrowser(metaScore.Function.proxy(this.onFileSelect, this));
  };
  
  ImageField.prototype.onFileSelect = function(files){
    if(files.length > 0){
      this.setValue(files[0].url +'?fid='+ files[0].fid, true);
    }
  };
    
  return ImageField;
  
})();