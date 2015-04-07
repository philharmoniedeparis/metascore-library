/**
* Description
* @class Select
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Select = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function SelectField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    SelectField.parent.call(this, this.configs);

    this.addClass('selectfield');
  }

  SelectField.defaults = {
    /**
    * Defines the maximum value allowed
    */
    options: {}
  };

  metaScore.editor.Field.extend(SelectField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  SelectField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<select/>', {'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);

      metaScore.Object.each(this.configs.options, function(key, value){
        this.addOption(key, value);
      }, this);
  };

  /**
   * Description
   * @method addOption
   * @param {} value
   * @param {} text
   * @chainable
   */
  SelectField.prototype.addOption = function(value, text){
    this.input.append(new metaScore.Dom('<option/>', {'value': value, 'text': text}));

    return this;
  };

  /**
   * Description
   * @method updateOption
   * @param {} value
   * @param {} text
   * @chainable
   */
  SelectField.prototype.updateOption = function(value, text){
    this.input.find('option[value="'+ value +'"]').text(text);

    return this;
  };

  /**
   * Description
   * @method removeOptions
   * @return ThisExpression
   */
  SelectField.prototype.removeOptions = function(){
    this.input.empty();

    return this;
  };

  /**
   * Description
   * @method removeOption
   * @param {} value
   * @chainable
   */
  SelectField.prototype.removeOption = function(value){
    this.input.child('[value="'+ value +'"]').remove();

    return this;
  };

  return SelectField;

})();