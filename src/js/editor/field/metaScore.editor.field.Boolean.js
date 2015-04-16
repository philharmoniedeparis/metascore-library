/**
* Description
* @class Boolean
* @namespace metaScore.editor.field
* @extends metaScore.editor.Field
*/

metaScore.namespace('editor.field').Boolean = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function BooleanField(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    BooleanField.parent.call(this, this.configs);

    this.addClass('booleanfield');

    this.input.get(0).checked = this.configs.checked;
  }

  BooleanField.defaults = {

    /**
    * Defines whether the field is checked by default
    */
    checked: false,

    /**
    * Defines the value when checked
    */
    checked_value: true,

    /**
    * Defines the value when unchecked
    */
    unchecked_value: false
  };

  metaScore.editor.Field.extend(BooleanField);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  BooleanField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<input/>', {'type': 'checkbox', 'id': uid})
      .addListener('click', metaScore.Function.proxy(this.onClick, this))
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method onClick
   * @param {} evt
   * @return 
   */
  BooleanField.prototype.onClick = function(evt){
    if(this.readonly){
      evt.preventDefault();
    }
  };

  /**
   * Description
   * @method onChange
   * @param {} evt
   * @return 
   */
  BooleanField.prototype.onChange = function(evt){
    if(this.readonly){
      evt.preventDefault();
      return;
    }
    
    this.value = this.input.is(":checked") ? this.configs.checked_value : this.configs.unchecked_value;
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  BooleanField.prototype.setValue = function(value, supressEvent){
    this.input.get(0).checked = value === this.configs.checked_value;

    if(supressEvent !== true){
      this.input.triggerEvent('change');
    }
  };

  /**
   * Toggle the readonly attribute of the field
   * @method readonly
   * @return ThisExpression
   */
  BooleanField.prototype.readonly = function(readonly){
    this.readonly = readonly === true;

    this.toggleClass('readonly', this.readonly);

    return this;
  };

  return BooleanField;

})();