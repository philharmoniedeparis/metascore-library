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
      * The handler function to call when clicked
      */
      handler: metaScore.Function.emptyFn,
      
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
      var changeCallback = metaScore.Function.proxy(this.onChange, this);
    
      this.initConfig(configs);
      
      this.callSuper('<div/>', {'class': 'timefield'});
      
      this.el = this.get(0);
      
      this.hours = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'hours', 'size': 2, 'maxlength': 3, 'value': 0})
        .addListener('change', changeCallback)
        .appendTo(this);
      
      metaScore.Dom.create('<span/>', {'text': ':', 'class': 'separator'})
        .appendTo(this);
      
      this.minutes = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'minutes', 'size': 2, 'maxlength': 3, 'value': 0})
        .addListener('change', changeCallback)
        .appendTo(this);
      
      metaScore.Dom.create('<span/>', {'text': ':', 'class': 'separator'})
        .appendTo(this);
      
      this.seconds = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'seconds', 'size': 2, 'maxlength': 3, 'value': 0})
        .addListener('change', changeCallback)
        .appendTo(this);
      
      metaScore.Dom.create('<span/>', {'text': '.', 'class': 'separator'})
        .appendTo(this);
      
      this.centiseconds = metaScore.Dom.create('<input/>', {'type': 'number', 'class': 'centiseconds', 'size': 2, 'maxlength': 2, 'value': 0})
        .addListener('change', changeCallback)
        .appendTo(this);
    },
    
    onChange: function(evt){    
      var milliseconds_value,
        centiseconds_value = parseInt(this.centiseconds.val(), 10),
        seconds_value = parseInt(this.seconds.val(), 10),
        minutes_value = parseInt(this.minutes.val(), 10),
        hours_value = parseInt(this.hours.val(), 10),
        event;
        
      evt.stopPropagation();
              
      if(centiseconds_value >= 100){
        seconds_value += Math.floor(centiseconds_value / 100);
        centiseconds_value = centiseconds_value % 100;
      }
      else if(centiseconds_value < 0){
        seconds_value += Math.floor(centiseconds_value / 100);
        centiseconds_value = 100 + (centiseconds_value % 100);
      }
              
      if(seconds_value >= 60){
        minutes_value += Math.floor(seconds_value / 60);
        seconds_value = seconds_value % 60;
      }
      else if(seconds_value < 0){
        minutes_value += Math.floor(seconds_value / 60);
        seconds_value = 60 + (seconds_value % 60);
      }
      
      if(minutes_value >= 60){
        hours_value += Math.floor(minutes_value / 60);
        minutes_value = minutes_value % 60;
      }
      else if(minutes_value < 0){
        hours_value += Math.floor(minutes_value / 60);
        minutes_value = 60 + (minutes_value % 60);
      }
      
      this.value = (centiseconds_value * 10) + (seconds_value * 1000) + (minutes_value * 60 * 1000) + (hours_value * 60 * 60 * 1000);
      
      if(this.value < 0){
        this.value = 0;
        
        centiseconds_value = 0;
        seconds_value = 0;
        minutes_value = 0;
        hours_value = 0;
      }
      
      this.centiseconds.val(centiseconds_value);
      this.seconds.val(seconds_value);
      this.minutes.val(minutes_value);
      this.hours.val(hours_value);
      
      this.triggerEvent('change', true, false);
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