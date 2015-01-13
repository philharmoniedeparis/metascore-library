/**
 * Overlay
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor').Overlay = (function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  function Overlay(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});
    
    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }
    
    if(this.configs.autoShow){
      this.show();
    }
    
    if(this.configs.toolbar){
      this.toolbar = new metaScore.editor.overlay.Toolbar({'title': this.configs.title})
        .appendTo(this);
        
      this.toolbar.addButton('close')
        .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
    }
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
    
    if(this.configs.draggable){
      this.draggable = new metaScore.Draggable({'target': this, 'handle': this.configs.toolbar ? this.toolbar : this});
    }
  }
  
  Overlay.defaults = {
    
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
    draggable: true,
    
    /**
    * True to show automatically
    */
    autoShow: false,
    
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: false,
    
    /**
    * The overlay's title
    */
    title: ''
  };
  
  metaScore.Dom.extend(Overlay);
  
  Overlay.prototype.show = function(){    
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }
  
    this.appendTo(this.configs.parent);
    
    return this;
  };
  
  Overlay.prototype.hide = function(){    
    if(this.configs.modal){
      this.mask.remove();
    }
  
    this.remove();
    
    return this;    
  };
  
  Overlay.prototype.getToolbar = function(){    
    return this.toolbar;    
  };
  
  Overlay.prototype.getContents = function(){    
    return this.contents;    
  };
  
  Overlay.prototype.onCloseClick = function(){
    this.hide();
  };
    
  return Overlay;
  
})();