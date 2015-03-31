/**
* Description
* @class Toolbar
* @namespace metaScore.editor.panel
* @extends metaScore.Dom
*/

metaScore.namespace('editor.panel').Toolbar = (function(){

  /**
   * Initialize
   * @constructor
   * @param {} configs
   */
  function Toolbar(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

    this.title = new metaScore.Dom('<div/>', {'class': 'title', 'text': this.configs.title})
      .appendTo(this);

    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);

    metaScore.Array.each(this.configs.buttons, function(index, action){
      this.addButton(action);
    }, this);

    if(this.configs.selector){
      this.selector = new metaScore.editor.field.Select()
        .addClass('selector')
        .appendTo(this);
        
      this.emptySelector();
    }

    if(!metaScore.Var.isEmpty(this.configs.menuItems)){
      this.menu = new metaScore.editor.DropDownMenu();

      metaScore.Object.each(this.configs.menuItems, function(action, label){
        this.menu.addItem(action, label);
      }, this);

      this.addButton('menu')
        .append(this.menu);
    }
  }

  Toolbar.defaults = {
    /**
    * A text to add as a title
    */
    title: '',

    buttons: [],

    /**
    * Whether to replace the title with a selector
    */
    selector: true,

    menuItems: {}
  };

  metaScore.Dom.extend(Toolbar);

  /**
   * Description
   * @method getToggle
   * @return MemberExpression
   */
  Toolbar.prototype.getToggle = function(){
    return this.toggle;
  };

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
   * @method getSelector
   * @return MemberExpression
   */
  Toolbar.prototype.getSelector = function(){
    return this.selector;
  };

  /**
   * Description
   * @method getMenu
   * @return MemberExpression
   */
  Toolbar.prototype.getMenu = function(){
    return this.menu;
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

  /**
   * Description
   * @method emptySelector
   * @return ThisExpression
   */
  Toolbar.prototype.emptySelector = function(){
    if(this.selector){
      this.selector.removeOptions();
    }
    
    return this;
  };

  /**
   * Description
   * @method addSelectorOption
   * @param {} value
   * @param {} text
   * @return ThisExpression
   */
  Toolbar.prototype.addSelectorOption = function(value, text){
    if(this.selector){
      this.selector.addOption(value, text);
    }
    
    return this;
  };

  /**
   * Description
   * @method setSelectorValue
   * @param {} value
   * @param {} supressEvent
   * @return ThisExpression
   */
  Toolbar.prototype.setSelectorValue = function(value, supressEvent){
    if(this.selector){
      this.selector.setValue(value, supressEvent);
    }
    
    return this;
  };

  /**
   * Description
   * @method toggleMenuItem
   * @param {} action
   * @param {} state
   * @return ThisExpression
   */
  Toolbar.prototype.toggleMenuItem = function(action, state){
    var menu = this.getMenu();

    if(menu){
      menu.toggleItem(action, state);
    }

    return this;
  };

  return Toolbar;

})();