/**
* Description
* @class MainMenu
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').MainMenu = (function(){

  /**
   * Description
   * @constructor
   */
  function MainMenu() {
    // call parent constructor
    MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});

    this.setupUI();
  }

  metaScore.Dom.extend(MainMenu);

  /**
   * Description
   * @method setupUI
   * @return 
   */
  MainMenu.prototype.setupUI = function(){

    var left, right;

    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);

    new metaScore.Dom('<div/>', {'class': 'logo-philharmonie'})
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.new', 'New')
      })
      .data('action', 'new')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.open', 'Open')
      })
      .data('action', 'open')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.edit', 'Edit')
      })
      .data('action', 'edit')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.save', 'Save')
      })
      .data('action', 'save')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.delete', 'Delete')
      })
      .data('action', 'delete')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.download', 'Download')
      })
      .data('action', 'download')
      .appendTo(left);

    this.timefield = new metaScore.editor.field.Time()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.time', 'Time')
      })
      .addClass('time')
      .appendTo(left);

    this.rindexfield = new metaScore.editor.field.Number({
        min: 0,
        max: 999
      })
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.r-index', 'Reading index')
      })
      .addClass('r-index')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.edit-toggle', 'Toggle edit mode')
      })
      .data('action', 'edit-toggle')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.revert', 'Revert')
      })
      .data('action', 'revert')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.undo', 'Undo')
      })
      .data('action', 'undo')
      .appendTo(left);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.redo', 'Redo')
      })
      .data('action', 'redo')
      .appendTo(left);


    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.settings', 'Settings')
      })
      .data('action', 'settings')
      .appendTo(right);

    new metaScore.editor.Button()
      .attr({
        'title': metaScore.Locale.t('editor.MainMenu.help', 'Help')
      })
      .data('action', 'help')
      .appendTo(right);

  };

  /**
   * Description
   * @method toggleButton
   * @param {} action
   * @param {} state
   * @return ThisExpression
   */
  MainMenu.prototype.toggleButton = function(action, state){
    this.find('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

    return this;
  };

  return MainMenu;

})();