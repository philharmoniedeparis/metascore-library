/*global metaScore console*/

metaScore.Editor.Field.TimeField = metaScore.Editor.Field.extend(function(){
  
  // private vars
  var hours, minutes, seconds, centiseconds;
  
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
    
    hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'});
    minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'});
    seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'});
    centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'});
  
    this.super(configs);
    
    hours.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    minutes.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    seconds.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'}).appendTo(this);
    
    centiseconds.addListener('input', this.onInput).appendTo(this);
    
  };
  
  this.onInput = function(evt){
  
    var centiseconds_val = parseInt(centiseconds.val(), 10),
      seconds_val = parseInt(seconds.val(), 10),
      minutes_val = parseInt(minutes.val(), 10),
      hours_val = parseInt(hours.val(), 10);
      
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
    
    centiseconds.val(centiseconds_val);
    seconds.val(seconds_val);
    minutes.val(minutes_val);
    hours.val(hours_val);
    
    this.triggerEvent('change', true, false);
  
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
    
    hours.attr('disabled', 'disabled');
    minutes.attr('disabled', 'disabled');
    seconds.attr('disabled', 'disabled');
    centiseconds.attr('disabled', 'disabled');
    
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
    
    hours.attr('disabled', null);
    minutes.attr('disabled', null);
    seconds.attr('disabled', null);
    centiseconds.attr('disabled', null);
    
    this.removeClass('disabled');
    
    return this;
  };
});