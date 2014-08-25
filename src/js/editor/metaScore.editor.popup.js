/**
 * Field
 *
 * @requires ./metaScore.editor.overlay.js
 */
metaScore.Editor.Popup = metaScore.Editor.Overlay.extend(function(){

  var _toolbar, _contents;

  this.defaults = {
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
  
  this.constructor = function(configs) {
  
    this.super(configs);
    
    this.addClass('popup');
  
    _toolbar = new metaScore.Editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    _toolbar.addButton()
      .data('action', 'close')
      .addListener('click', this.onCloseClick);
    
    _contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
    
  };
  
  this.getToolbar = function(){
    
    return _toolbar;
    
  };
  
  this.getContents = function(){
    
    return _contents;
    
  };
  
  this.onCloseClick = function(){
    this.hide();
  };
});