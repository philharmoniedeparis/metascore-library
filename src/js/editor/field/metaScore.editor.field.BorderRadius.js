/**
 * BorderRadiusrField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').BorderRadius = (function () {

  function BorderRadiusrField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BorderRadiusrField.parent.call(this, this.configs);

    this.addClass('borderradiusrfield');
  }

  metaScore.editor.Field.extend(BorderRadiusrField);

  BorderRadiusrField.prototype.setupUI = function(){
    BorderRadiusrField.parent.prototype.setupUI.call(this);

    this.input
      .attr('readonly', 'readonly')
      .addListener('click', metaScore.Function.proxy(this.onClick, this));

    this.overlay = new metaScore.editor.overlay.BorderRadius()
      .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));

    this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
      .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
      .appendTo(this);
  };

  BorderRadiusrField.prototype.setValue = function(value, supressEvent){
    BorderRadiusrField.parent.prototype.setValue.call(this, value, supressEvent);

    this.input.attr('title', value);
  };

  BorderRadiusrField.prototype.onClick = function(evt){
    if(this.disabled){
      return;
    }

    this.overlay
      .setValue(this.value)
      .show();
  };

  BorderRadiusrField.prototype.onOverlaySubmit = function(evt){
    var value = evt.detail.value,
      overlay = evt.detail.overlay;

    this.setValue(value);
  };

  BorderRadiusrField.prototype.onClearClick = function(evt){
    this.setValue(null);
  };

  return BorderRadiusrField;

})();