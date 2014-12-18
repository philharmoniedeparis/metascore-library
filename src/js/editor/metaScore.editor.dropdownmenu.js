/**
 * DropDownMenu
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor').DropDownMenu = (function () {
  
  function DropDownMenu(configs) {  
    this.configs = this.getConfigs(configs);
    
    // call the super constructor.
    metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
  }
  
  metaScore.Dom.extend(DropDownMenu);
  
  DropDownMenu.prototype.addItem = function(attr){  
    var item = new metaScore.Dom('<li/>', attr)
      .appendTo(this);    
  
    return item;  
  };
  
  DropDownMenu.prototype.enableItems = function(selector){  
    var items = this.children(selector);
    
    items.removeClass('disabled');
  
    return items;  
  };
  
  DropDownMenu.prototype.disableItems = function(selector){  
    var items = this.children(selector);
    
    items.addClass('disabled');
  
    return items;  
  };
    
  return DropDownMenu;
  
})();