/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Time = (function () {
  
  function TimeField(configs) {
    this.configs = this.getConfigs(configs);
    
    this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'});
    this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'});
    this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'});
    this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'});
  
    // call parent constructor
    TimeField.parent.call(this, this.configs);
    
    this.hours.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    this.minutes.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    this.seconds.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'}).appendTo(this);
    
    this.centiseconds.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
  }
  
  TimeField.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the minimum value allowed
    */
    min: 0,
    
    /**
    * Defines the maximum value allowed
    */
    max: null,
    
    tag: '<div/>',
    
    attributes: {
      'class': 'field timefield'
    }
  };
  
  metaScore.editor.Field.extend(TimeField);
  
  TimeField.prototype.onInput = function(evt){
  
    var centiseconds_val = parseInt(this.centiseconds.val(), 10),
      seconds_val = parseInt(this.seconds.val(), 10),
      minutes_val = parseInt(this.minutes.val(), 10),
      hours_val = parseInt(this.hours.val(), 10);
      
    evt.stopPropagation();
    
    this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
  };
  
  TimeField.prototype.setValue = function(milliseconds){
      
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
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  TimeField.prototype.getValue = function(){
  
    return this.value;
  
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