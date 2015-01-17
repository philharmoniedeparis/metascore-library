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

  DropDownMenu.prototype.addItem = function(action, label){
    var item = new metaScore.Dom('<li/>', {'data-action': action, 'text': label})
      .appendTo(this);

    return item;
  };

  DropDownMenu.prototype.toggleItem = function(action, state){
    this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

    return this;
  };

  return DropDownMenu;

})();