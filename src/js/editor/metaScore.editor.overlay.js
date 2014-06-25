/**
* Overlay
*/
metaScore.Editor.Overlay = metaScore.Dom.extend(function(){
  
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
    modal: true,
    
    /**
    * True to make this draggable
    */
    draggable: true
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'metaScore-overlay clearfix'});
  
    this.initConfig(configs);
    
    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'metaScore-overlay-mask'});
    }
    
    this.setDraggable(this.configs.draggable);
    
  };
  
  this.show = function(){
    
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }
  
    this.appendTo(this.configs.parent);
    
  };
  
  this.hide = function(){
    
    if(this.configs.modal){
      this.mask.remove();
    }
  
    this.remove();
    
  };
});