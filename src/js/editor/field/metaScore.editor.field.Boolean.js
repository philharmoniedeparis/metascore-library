/**
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */

metaScore.namespace('editor.field').Boolean = (function () {

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

  BooleanField.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<input/>', {'type': 'checkbox', 'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);
  };

  BooleanField.prototype.onChange = function(evt){
    this.value = this.input.is(":checked") ? this.configs.checked_value : this.configs.unchecked_value;
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  BooleanField.prototype.setValue = function(value, supressEvent){
    this.input.get(0).checked = value === this.configs.checked_value;

    if(supressEvent !== true){
      this.input.triggerEvent('change');
    }
  };

  return BooleanField;

})();