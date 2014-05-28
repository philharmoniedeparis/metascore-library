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
    
    defaults: {    
      /**
      * The handler function to call when clicked
      */
      handler: metaScore.Function.emptyFn
    },

    /**
    * Initialize
    * @param {object} a configuration object
    * @returns {void}
    */
    init: function(configs) {
      var field = this;
    
      this.initConfig(configs);
      
      this.callSuper('<div/>', {'class': 'timefield'});
      
      this.hours = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'hours', 'maxlength': 2})
        .appendTo(this);
      
      this.minutes = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'minutes', 'maxlength': 2})
        .addListener('change', function(){
          var value = parseInt(this.value, 10),
            hours;
          
          if(value > 59){
            hours = field.hours.get(0);
            hours.value = parseInt(hours.value, 10) + (value % 59);
          }
          else if(value < 0){
            hours = field.hours.get(0);
            hours.value = parseInt(hours.value, 10) - (value % 59);
          }
        })
        .appendTo(this);
      
      this.seconds = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'seconds', 'maxlength': 2})
        .appendTo(this);
      
      this.milliseconds = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'milliseconds', 'maxlength': 2})
        .appendTo(this);
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