/**
 * Overlay
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Overlay = metaScore.Dom.extend(function(){

  var _draggable;
  
  this.defaults = {
    
    /**
    * The parent element in which the overlay will be appended
    */
    parent: '.metaScore-editor',
    
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
  
    this.super('<div/>', {'class': 'overlay clearfix'});
  
    this.initConfig(configs);
    
    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }
    
    if(this.configs.draggable){
      _draggable = new metaScore.Draggable(this, this);
    }
    
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