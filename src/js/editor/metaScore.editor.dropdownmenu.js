/**
 * DropDownMenu
 *
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
  
  this.addItem = function(attr){
  
    var item = new metaScore.Dom('<li/>', attr)
      .appendTo(this);    
  
    return item;
  
  };
});