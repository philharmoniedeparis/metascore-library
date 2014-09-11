/**
 * Toolbar
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.editor.Toolbar = (function(){

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
  
  Toolbar.prototype.addButton = function(configs){
  
    return new metaScore.editor.Button(configs)
      .appendTo(this.buttons);
  
  };
    
  return Toolbar;
  
})();