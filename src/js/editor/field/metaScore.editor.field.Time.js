/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Time = (function () {
  
  function TimeField(configs) {  
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    TimeField.parent.call(this, this.configs);
    
    this.addClass('timefield');
  }
  
  TimeField.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines the minimum value allowed
    */
    min: 0,
    
    /**
    * Defines the maximum value allowed
    */
    max: null,
    
    buttons: true
  };
  
  metaScore.editor.Field.extend(TimeField);
  
  TimeField.prototype.setupUI = function(){
    this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this);
    
    this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);
      
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
      .appendTo(this);
      
    this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);
      
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'})
      .appendTo(this);
      
    this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'})
      .addListener('input', metaScore.Function.proxy(this.onInput, this))
      .appendTo(this);
    
    if(this.configs.buttons){      
      this.in = new metaScore.Dom('<button/>', {'data-action': 'in'})
        .addListener('click', metaScore.Function.proxy(this.onInClick, this));
      
      this.out = new metaScore.Dom('<button/>', {'data-action': 'out'})
        .addListener('click', metaScore.Function.proxy(this.onOutClick, this));

      new metaScore.Dom('<div/>', {'class': 'buttons'})
        .append(this.in)
        .append(this.out)
        .appendTo(this);
    }
    
    this.addListener('change', metaScore.Function.proxy(this.onChange, this));
    
  };
  
  TimeField.prototype.onChange = function(evt){
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };
  
  TimeField.prototype.onInput = function(evt){  
    var centiseconds_val = parseInt(this.centiseconds.val(), 10),
      seconds_val = parseInt(this.seconds.val(), 10),
      minutes_val = parseInt(this.minutes.val(), 10),
      hours_val = parseInt(this.hours.val(), 10);
      
    evt.stopPropagation();
    
    this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
  };
  
  TimeField.prototype.onInClick = function(evt){
    this.triggerEvent('valuein');
  };
  
  TimeField.prototype.onOutClick = function(evt){
    this.triggerEvent('valueout');
  };
  
  TimeField.prototype.setValue = function(milliseconds, supressEvent){
    var centiseconds_val, seconds_val, minutes_val, hours_val;
    
    this.value = milliseconds;
    
    if(this.configs.min !== null){
      this.value = Math.max(this.value, this.configs.min);
    }
    if(this.configs.max !== null){
      this.value = Math.min(this.value, this.configs.max);
    }
      
    centiseconds_val = parseInt((this.value / 10) % 100, 10);
    seconds_val = parseInt((this.value / 1000) % 60, 10);
    minutes_val = parseInt((this.value / 60000) % 60, 10);
    hours_val = parseInt((this.value / 3600000), 10);
    
    this.centiseconds.val(centiseconds_val);
    this.seconds.val(seconds_val);
    this.minutes.val(minutes_val);
    this.hours.val(hours_val);
    
    if(supressEvent !== true){
      this.triggerEvent('change');
    }
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  TimeField.prototype.disable = function(){
    this.disabled = true;
    
    this.hours.attr('disabled', 'disabled');
    this.minutes.attr('disabled', 'disabled');
    this.seconds.attr('disabled', 'disabled');
    this.centiseconds.attr('disabled', 'disabled');
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  TimeField.prototype.enable = function(){
    this.disabled = false;
    
    this.hours.attr('disabled', null);
    this.minutes.attr('disabled', null);
    this.seconds.attr('disabled', null);
    this.centiseconds.attr('disabled', null);
    
    this.removeClass('disabled');
    
    return this;
  };
    
  return TimeField;
  
})();