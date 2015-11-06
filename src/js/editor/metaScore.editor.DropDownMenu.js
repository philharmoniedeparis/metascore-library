/**
* Description
* @class editor.DropDownMenu
* @extends Dom
*/

metaScore.namespace('editor').DropDownMenu = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function DropDownMenu(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
  }

  metaScore.Dom.extend(DropDownMenu);

  /**
   * Description
   * @method addItem
   * @param {} action
   * @param {} label
   * @return item
   */
  DropDownMenu.prototype.addItem = function(action, label){
    var item = new metaScore.Dom('<li/>', {'data-action': action, 'text': label})
      .appendTo(this);

    return item;
  };

  /**
   * Description
   * @method toggleItem
   * @param {} action
   * @param {} state
   * @return ThisExpression
   */
  DropDownMenu.prototype.toggleItem = function(action, state){
    this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

    return this;
  };

  return DropDownMenu;

})();