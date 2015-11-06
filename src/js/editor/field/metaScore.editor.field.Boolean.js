/**
* Description
* @class editor.field.Boolean
* @extends editor.Field
*/

metaScore.namespace('editor.field').Boolean = (function () {

  /**
   * Fired when the field's value changes
   *
   * @event valuechange
   * @param {Object} field The field instance
   * @param {Mixed} value The new value
   */
  var EVT_VALUECHANGE = 'valuechange';

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
    
    this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
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
    if(this.is_readonly){
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
    if(this.is_readonly){
      evt.preventDefault();
      return;
    }
    
    if(this.input.is(":checked")){
      this.value = this.configs.checked_value;
      this.addClass('checked');
    }
    else{
      this.value = this.configs.unchecked_value;
      this.removeClass('checked');
    }
    
    this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
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

  return BooleanField;

})();