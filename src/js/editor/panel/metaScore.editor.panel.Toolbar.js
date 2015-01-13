/**
 * Toolbar
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor.panel').Toolbar = (function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  function Toolbar(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});
    
    this.title = new metaScore.Dom('<div/>', {'class': 'title'})
      .appendTo(this);
    
    /*this.selector = new metaScore.editor.field.Select()
      .appendTo(this);*/
    
    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    if(this.configs.title){
      this.title.text(this.configs.title);
    }
  }
  
  Toolbar.defaults = {    
    /**
    * A text to add as a title
    */
    title: null
  };
  
  metaScore.Dom.extend(Toolbar);
  
  Toolbar.prototype.getTitle = function(){  
    return this.title;    
  };
  
  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);
  
    return button;
  };
  
  Toolbar.prototype.getButton = function(action){  
    return this.buttons.children('[data-action="'+ action +'"]');
  };
    
  return Toolbar;
  
})();