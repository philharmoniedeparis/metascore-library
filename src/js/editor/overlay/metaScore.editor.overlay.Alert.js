/**
 * Alert
 *
 * @requires ./metaScore.editor.Overlay.js
 */
 
metaScore.namespace('editor.overlay').Alert = (function () {
  
  function Alert(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    Alert.parent.call(this, this.configs);
    
    this.addClass('alert');
    
    this.text = new metaScore.Dom('<div/>', {'class': 'text'})
      .appendTo(this.contents);
      
    if(this.configs.text){
      this.setText(this.configs.text);
    }
    
    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this.contents);
      
    if(this.configs.buttons){
      
    }
  }

  Alert.defaults = {    
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