/*global global console*/

/**
* TimeField
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Form = metaScore.Form || {};

  metaScore.Form.TimeField = metaScore.Dom.extend({
    /**
    * Keep track of the current state
    */
    disabled: false,
    /**
    * Keep track of the current value
    */
    value: 0,
    
    defaults: {
      
      /**
      * Defines the minimum value allowed
      */
      min: 0,
      
      /**
      * Defines the maximum value allowed
      */
      max: null
    },

    /**
    * Initialize
    * @param {object} a configuration object
    * @returns {void}
    */
    init: function(configs) {
      var inputCallback = metaScore.Function.proxy(this.onInput, this);
    
      this.initConfig(configs);
      
      this.callSuper('<div/>', {'class': 'field timefield'});
      
      this.el = this.get(0);
      
      this.hours = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'hours', 'size': 2, 'maxlength': 3, 'value': 0})
        .addListener('input', inputCallback)
        .appendTo(this);
      
      metaScore.Dom.create('<span/>', {'text': ':', 'class': 'separator'})
        .appendTo(this);
      
      this.minutes = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'minutes', 'size': 2, 'maxlength': 3, 'value': 0})
        .addListener('input', inputCallback)
        .appendTo(this);
      
      metaScore.Dom.create('<span/>', {'text': ':', 'class': 'separator'})
        .appendTo(this);
      
      this.seconds = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'seconds', 'size': 2, 'maxlength': 3, 'value': 0})
        .addListener('input', inputCallback)
        .appendTo(this);
      
      metaScore.Dom.create('<span/>', {'text': '.', 'class': 'separator'})
        .appendTo(this);
      
      this.centiseconds = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'centiseconds', 'size': 2, 'maxlength': 2, 'value': 0})
        .addListener('input', inputCallback)
        .appendTo(this);
    },
    
    onInput: function(evt){   
    
      var centiseconds = parseInt(this.centiseconds.val(), 10),
        seconds = parseInt(this.seconds.val(), 10),
        minutes = parseInt(this.minutes.val(), 10),
        hours = parseInt(this.hours.val(), 10),
        event;
        
      evt.stopPropagation();
      
      this.setValue((centiseconds * 10) + (seconds * 1000) + (minutes * 60000) + (hours * 3600000));
    },
    
    setValue: function(milliseconds){
        
      var centiseconds, seconds, minutes, hours;
      
      this.value = milliseconds;
      
      if(this.configs.min !== null){
        this.value = Math.max(this.value, this.configs.min);
      }
      if(this.configs.max !== null){
        this.value = Math.min(this.value, this.configs.max);
      }
        
      centiseconds = parseInt((this.value / 10) % 100, 10);
      seconds = parseInt((this.value / 1000) % 60, 10);
      minutes = parseInt((this.value / 60000) % 60, 10);
      hours = parseInt((this.value / 3600000), 10);
      
      this.centiseconds.val(centiseconds);
      this.seconds.val(seconds);
      this.minutes.val(minutes);
      this.hours.val(hours);
      
      this.triggerEvent('change', true, false);
    
    },
    
    getValue: function(){
    
      return this.value;
    
    },

    /**
    * Disable the button
    * @returns {object} the XMLHttp object
    */
    disable: function(){
      this.addClass('disabled');
      this.disabled = true;
      
      return this;
    },

    /**
    * Enable the button
    * @param {string} the url of the request
    * @param {object} options to set for the request; see the defaults variable
    * @returns {object} the XMLHttp object
    */
    enable: function(){
      this.removeClass('disabled');
      this.disabled = false;
      
      return this;
    }
  });
  
}(global));