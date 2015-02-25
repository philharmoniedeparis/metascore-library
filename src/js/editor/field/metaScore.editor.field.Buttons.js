/**
 * ButtonsField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Buttons = (function () {

  function ButtonsField(configs) {
    this.configs = this.getConfigs(configs);
    
    this.buttons = {};

    // fix event handlers scope
    this.onClick = metaScore.Function.proxy(this.onClick, this);

    // call parent constructor
    ButtonsField.parent.call(this, this.configs);

    this.addClass('buttonsfield');
  }

  ButtonsField.defaults = {
    buttons: {}
  };

  metaScore.editor.Field.extend(ButtonsField);

  ButtonsField.prototype.setValue = function(){
  };

  ButtonsField.prototype.setupUI = function(){
    var field = this;

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    metaScore.Object.each(this.configs.buttons, function(key, attr){
      this.buttons[key] = new metaScore.Dom('<button/>', attr)
        .addListener('click', function(){
          field.triggerEvent('valuechange', {'field': field, 'value': key}, true, false);
        })
        .appendTo(this.input_wrapper);
    }, this);
  };
  
  ButtonsField.prototype.getButtons = function(){
    return this.buttons;
  };
  
  ButtonsField.prototype.getButton = function(key){
    return this.buttons[key];
  };
  
  ButtonsField.prototype.enable = function(){
    this.disabled = false;

    this.removeClass('disabled');

    return this;
  };
  
  ButtonsField.prototype.disable = function(){
    this.disabled = true;

    this.addClass('disabled');

    return this;
  };

  return ButtonsField;

})();