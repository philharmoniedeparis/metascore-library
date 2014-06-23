/*global metaScore console*/

metaScore.Editor.Button = metaScore.Dom.extend(function(){
  /**
  * Keep track of the current state
  */
  this.disabled = false;
  
  this.defaults = {    
    /**
    * A text to add as a label
    */
    label: null
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    var btn = this;
    
    this.super('<button/>');
  
    this.initConfig(configs);
    
    if(this.configs.label){
      this.label = new metaScore.Dom('<span/>', {'class': 'label', 'text': this.configs.label});
      this.append(this.label);
    }
    
    this.addListener('click', function(evt){
      if(btn.disabled){
        evt.stopPropagation();
      }
    });
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
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
    
    this.removeClass('disabled');
    
    return this;
  };
});