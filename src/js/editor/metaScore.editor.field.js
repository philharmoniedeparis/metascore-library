/**
* Description
* @class Field
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').Field = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Field(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<div/>', {'class': 'field'});

    this.setupUI();

    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;

    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }

    if(this.configs.name && this.input){
      this.input.attr('name', this.configs.name);
    }

    if(this.configs.disabled){
      this.disable();
    }
    else{
      this.enable();
    }

    this.readonly(this.configs.readonly);
  }

  Field.defaults = {
    /**
    * Defines the default value
    */
    value: null,

    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,

    /**
    * Defines whether the field is readonly by default
    */
    readonly: false
  };

  metaScore.Dom.extend(Field);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  Field.prototype.setupUI = function(){
    var uid = 'field-'+ metaScore.String.uuid(5);

    if(this.configs.label){
      this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
        .appendTo(this);
    }
      
    this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
      .appendTo(this);

    this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
      .addListener('change', metaScore.Function.proxy(this.onChange, this))
      .appendTo(this.input_wrapper);
  };

  /**
   * Description
   * @method onChange
   * @param {} evt
   * @return 
   */
  Field.prototype.onChange = function(evt){
    this.value = this.input.val();

    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };

  /**
   * Description
   * @method setValue
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  Field.prototype.setValue = function(value, supressEvent){
    this.input.val(value);
    this.value = value;

    if(supressEvent !== true){
      this.input.triggerEvent('change');
    }
  };

  /**
   * Description
   * @method getValue
   * @return MemberExpression
   */
  Field.prototype.getValue = function(){
    return this.value;
  };

  /**
   * Disable the field
   * @method disable
   * @return ThisExpression
   */
  Field.prototype.disable = function(){
    this.disabled = true;

    this.addClass('disabled');
    
    if(this.input){
      this.input.attr('disabled', 'disabled');
    }

    return this;
  };

  /**
   * Enable the field
   * @method enable
   * @return ThisExpression
   */
  Field.prototype.enable = function(){
    this.disabled = false;

    this.removeClass('disabled');
    
    if(this.input){
      this.input.attr('disabled', null);
    }

    return this;
  };

  /**
   * Toggle the readonly attribute of the field
   * @method readonly
   * @return ThisExpression
   */
  Field.prototype.readonly = function(readonly){
    this.is_readonly = readonly === true;

    this.toggleClass('readonly', this.is_readonly);
    
    if(this.input){
      this.input.attr('readonly', this.is_readonly ? "readonly" : null);
    }

    return this;
  };

  return Field;

})();