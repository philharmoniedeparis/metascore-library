/**
* Toolbar
*/
metaScore.Editor.Toolbar = metaScore.Dom.extend(function(){

  var title, buttons;
  
  this.defaults = {    
    /**
    * A text to add as a title
    */
    title: null
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {    
    this.super('<div/>', {'class': 'toolbar clearfix'});
  
    this.initConfig(configs);
    
    title = new metaScore.Dom('<div/>', {'class': 'title'})
      .appendTo(this);
    
    buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    if(this.configs.title){
      title.text(this.configs.title);
    }
  };
  
  this.getTitle = function(){
  
    return title;
    
  };
  
  this.addButton = function(configs){
  
    return new metaScore.Editor.Button(configs)
      .appendTo(buttons);
  
  };
});