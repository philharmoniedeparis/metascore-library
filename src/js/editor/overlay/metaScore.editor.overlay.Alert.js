/**
 * Alert
 *
 * @requires ./metaScore.editor.Overlay.js
 */
 
metaScore.namespace('editor.overlay');

metaScore.editor.overlay.Alert = (function () {
  
  function Alert(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    Alert.parent.call(this, this.configs);
    
    this.addClass('alert');
    
    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    if(this.configs.buttons){
      
    }
    
    this.text = new metaScore.Dom('<div/>', {'class': 'text'})
      .appendTo(this);
      
    if(this.configs.text){
      this.setText(this.configs.text);
    }
  }

  Alert.defaults = {
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
    draggable: false,
    
    text: '',
    
    buttons: []
  };
  
  metaScore.editor.Overlay.extend(Alert);
  
  Alert.prototype.setText = function(str){
    this.text.text(str);
  };
  
  Alert.prototype.setButtons = function(){
  };
    
  return Alert;
  
})();