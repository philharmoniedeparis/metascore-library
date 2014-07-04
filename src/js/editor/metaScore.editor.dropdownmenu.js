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
  
  this.enableItems = function(selector){
  
    var items = this.children(selector);
    
    items
      .removeListener('click', this.stopClick)
      .removeClass('disabled');
  
    return items;
  
  };
  
  this.disableItems = function(selector){
  
    var items = this.children(selector);
    
    items
      .addListener('click', this.stopClick)
      .addClass('disabled');
  
    return items;
  
  };
  
  this.stopClick = function(evt){
  
    evt.stopPropagation();
  
  };
});