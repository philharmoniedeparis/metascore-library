/**
 * DropDownMenu
 *
 * @requires metaScore.editor.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.DropDownMenu = metaScore.Dom.extend(function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super('<ul/>', {'class': 'dropdown-menu'});
  
    this.initConfig(configs);
  };
  
  this.addItem = function(text){
  
    var item = new metaScore.Dom('<li/>', {'text': text})
      .appendTo(this);    
  
    return item;
  
  };
});