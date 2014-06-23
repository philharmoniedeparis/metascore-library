/*global metaScore console*/

metaScore.Editor.Field.BooleanField = metaScore.Editor.Field.extend(function(){

  this.defaults = {
    /**
    * Defines the default value
    */
    value: true,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.attributes = {
    'type': 'checkbox',
    'class': 'field booleanfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
  };
});