/*global global console*/

/**
* TimeField
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Form = metaScore.Form || {};

  metaScore.Form.IntegerField = metaScore.Dom.extend({
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
      min: null,
      
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
      
      this.callSuper('<input/>', {'type': 'number', 'class': 'field integerfield', 'size': 2, 'value': 0});
      this.addListener('input', inputCallback);
      
      this.el = this.get(0);
    },
    
    onInput: function(evt){
        
      evt.stopPropagation();
      
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