/*global global console*/

/**
* Button
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Form = metaScore.Form || {};

  metaScore.Form.Button = metaScore.Dom.extend({
    /**
    * Keep track of the current state
    */
    disabled: false,
    
    defaults: {    
      /**
      * A text to add as a label
      */
      label: null
    },

    /**
    * Initialize
    * @param {object} a configuration object
    * @returns {void}
    */
    init: function(configs) {
      var btn = this;
    
      this.initConfig(configs);
      
      this.callSuper('<button/>');
      
      if(this.configs.label){
        this.label = metaScore.Dom.create('<span/>', {'class': 'label', 'text': this.configs.label});
        this.append(this.label);
      }
      
      this.addListener('click', function(evt){
        if(btn.disabled){
          evt.stopPropagation();
        }
      });
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