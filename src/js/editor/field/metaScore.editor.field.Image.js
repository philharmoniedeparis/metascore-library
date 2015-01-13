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
  
  ImageField.prototype.setupUI = function(){
    ImageField.parent.prototype.setupUI.call(this);
  
    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this);
  };
  
  ImageField.prototype.setValue = function(value, supressEvent){
    ImageField.parent.prototype.setValue.call(this, value, supressEvent);
    
    this.input.attr('title', value);
  };
  
  ImageField.prototype.onClick = function(evt){
    Drupal.media.popups.mediaBrowser(metaScore.Function.proxy(this.onFileSelect, this));
  };
  
  ImageField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };
  
  ImageField.prototype.onFileSelect = function(files){
    if(files.length > 0){
      this.setValue(files[0].url +'?fid='+ files[0].fid);
    }
  };
    
  return ImageField;
  
})();