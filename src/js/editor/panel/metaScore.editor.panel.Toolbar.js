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
        .addOption(null, '')
        .appendTo(this);
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
    selector: false,

    menuItems: {}
  };

  metaScore.Dom.extend(Toolbar);

  Toolbar.prototype.getToggle = function(){
    return this.toggle;
  };

  Toolbar.prototype.getTitle = function(){
    return this.title;
  };

  Toolbar.prototype.getSelector = function(){
    return this.selector;
  };

  Toolbar.prototype.getMenu = function(){
    return this.menu;
  };

  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);

    return button;
  };

  Toolbar.prototype.getButton = function(action){
    return this.buttons.children('[data-action="'+ action +'"]');
  };

  Toolbar.prototype.addComponent = function(component){
    if(this.selector){
      this.selector.addOption(component.getId(), component.getName());
    }
  };

  Toolbar.prototype.setComponent = function(component, supressEvent){
    if(this.selector){
      this.selector.setValue(component ? component.getId() : null, supressEvent);
    }
  };

  Toolbar.prototype.toggleMenuItem = function(action, state){
    var menu = this.getMenu();

    if(menu){
      menu.toggleItem(action, state);
    }

    return this;
  };

  return Toolbar;

})();