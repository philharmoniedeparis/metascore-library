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
  }

  metaScore.editor.Field.extend(ImageField);

  ImageField.prototype.setupUI = function(){
    ImageField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this.input_wrapper);
  };

  ImageField.prototype.setValue = function(value, supressEvent){
    ImageField.parent.prototype.setValue.call(this, value, supressEvent);

    this.input.attr('title', value);
  };

  ImageField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }
    
    this.openBrowser(metaScore.Function.proxy(this.onFileSelect, this));
  };

  ImageField.prototype.openBrowser = function(callback){
  };

  ImageField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };

  ImageField.prototype.onFileSelect = function(url){
    this.setValue(url);
  };

  return ImageField;

})();