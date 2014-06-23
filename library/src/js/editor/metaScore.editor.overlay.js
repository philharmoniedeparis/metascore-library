/*global metaScore console*/

/**
* TimeField
*/
metaScore.Editor.Overlay = metaScore.Dom.extend(function(){

  var mask;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * The parent element in which the overlay will be appended
    */
    parent: 'body',
    
    /**
    * True to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
    */
    modal: true
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'overlay clearfix'});
  
    this.initConfig(configs);
    
    if(this.configs.modal){
      mask = new metaScore.Dom('<div/>', {'class': 'mask'}).appendTo(this);
    }
    
  };
  
  this.show = function(){
    this.appendTo(this.configs.parent);
  };
  
  this.hide = function(){
    this.remove();
  };
});