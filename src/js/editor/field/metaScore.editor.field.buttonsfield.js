/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.TimeField = metaScore.Editor.Field.extend(function(){
  
  // private vars
  var _hours, _minutes, _seconds, _centiseconds;
  
  this.defaults = {
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
    max: null
  };
  
  this.tag = '<div/>';
  
  this.attributes = {
    'class': 'field timefield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    _hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'});
    _minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'});
    _seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'});
    _centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'});
  
    this.super(configs);
    
    
    _hours.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    _minutes.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    _seconds.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'}).appendTo(this);
    
    _centiseconds.addListener('input', this.onInput).appendTo(this);
    
  };
  
  this.onInput = function(evt){
  
    var centiseconds_val = parseInt(_centiseconds.val(), 10),
      seconds_val = parseInt(_seconds.val(), 10),
      minutes_val = parseInt(_minutes.val(), 10),
      hours_val = parseInt(_hours.val(), 10);
      
    evt.stopPropagation();
    
    this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
  };
  
  this.setValue = function(milliseconds){
      
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
    
    _centiseconds.val(centiseconds_val);
    _seconds.val(seconds_val);
    _minutes.val(minutes_val);
    _hours.val(hours_val);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  this.getValue = function(){
  
    return this.value;
  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    _hours.attr('disabled', 'disabled');
    _minutes.attr('disabled', 'disabled');
    _seconds.attr('disabled', 'disabled');
    _centiseconds.attr('disabled', 'disabled');
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    _hours.attr('disabled', null);
    _minutes.attr('disabled', null);
    _seconds.attr('disabled', null);
    _centiseconds.attr('disabled', null);
    
    this.removeClass('disabled');
    
    return this;
  };
});