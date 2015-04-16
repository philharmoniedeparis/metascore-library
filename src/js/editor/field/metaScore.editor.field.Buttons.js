/**
* Description
* @class Buttons
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Buttons = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
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

  /**
   * Description
   * @method setValue
   * @return 
   */
  ButtonsField.prototype.setValue = function(){
  };

  /**
   * Description
   * @method setupUI
   * @return 
   */
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
  
  /**
   * Description
   * @method getButtons
   * @return MemberExpression
   */
  ButtonsField.prototype.getButtons = function(){
    return this.buttons;
  };
  
  /**
   * Description
   * @method getButton
   * @param {} key
   * @return MemberExpression
   */
  ButtonsField.prototype.getButton = function(key){
    return this.buttons[key];
  };

  return ButtonsField;

})();