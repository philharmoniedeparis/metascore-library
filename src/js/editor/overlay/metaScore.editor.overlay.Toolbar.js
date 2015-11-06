/**
* Description
* @class editor.overlay.Toolbar
* @extends Dom
*/

metaScore.namespace('editor.overlay').Toolbar = (function(){

  /**
   * Initialize
   * @constructor
   * @param {} configs
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

  /**
   * Description
   * @method getTitle
   * @return MemberExpression
   */
  Toolbar.prototype.getTitle = function(){
    return this.title;
  };

  /**
   * Description
   * @method addButton
   * @param {} action
   * @return button
   */
  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  /**
   * Description
   * @method getButton
   * @param {} action
   * @return CallExpression
   */
  Toolbar.prototype.getButton = function(action){
    return this.buttons.children('[data-action="'+ action +'"]');
  };

  return Toolbar;

})();