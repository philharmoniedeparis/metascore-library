/**
 * Field
 *
 * @requires ./metaScore.editor.overlay.js
 */
 
metaScore.namespace('editor');

metaScore.editor.Popup = (function () {
  
  function Popup(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    Popup.parent.call(this, this.configs);
    
    this.addClass('popup');
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.addButton()
      .data('action', 'close')
      .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);    
  }

  Popup.defaults = {
    /**
    * The popup's title
    */
    title: '',
    
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
    draggable: false
  };
  
  metaScore.editor.Overlay.extend(Popup);
  
  Popup.prototype.getToolbar = function(){    
    return this.toolbar;    
  };
  
  Popup.prototype.getContents = function(){    
    return this.contents;    
  };
  
  Popup.prototype.onCloseClick = function(){
    this.hide();
  };
    
  return Popup;
  
})();