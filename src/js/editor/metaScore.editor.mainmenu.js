/**
 * MainMenu
 *
 * @requires metaScore.editor.button.js
 * @requires field/metaScore.editor.field.timefield.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.namespace('editor').MainMenu = (function(){

  function MainMenu() {
    // call parent constructor
    MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});
    
    this.setupUI();    
  }
  
  metaScore.Dom.extend(MainMenu);
  
  MainMenu.prototype.setupUI = function(){
  
    var left, right;
    
    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);
    
    new metaScore.Dom('<div/>', {'class': 'logo-philharmonie'})
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('New')
      })
      .data('action', 'new')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('Open')
      })
      .data('action', 'open')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('edit')
      })
      .data('action', 'edit')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('save')
      })
      .data('action', 'save')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('delete')
      })
      .data('action', 'delete')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('download')
      })
      .data('action', 'download')
      .appendTo(left);
    
    this.timefield = new metaScore.editor.field.Time()
      .attr({
        'title': metaScore.String.t('time')
      })
      .addClass('time')
      .appendTo(left);
    
    this.rindexfield = new metaScore.editor.field.Number({
        min: 0
      })
      .attr({
        'title': metaScore.String.t('reading index')
      })
      .addClass('r-index')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('edit toggle')
      })
      .data('action', 'edit-toggle')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('revert')
      })
      .data('action', 'revert')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('undo')
      })
      .data('action', 'undo')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('redo')
      })
      .data('action', 'redo')
      .appendTo(left);
      
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('settings')
      })
      .data('action', 'settings')
      .appendTo(right);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('help')
      })
      .data('action', 'help')
      .appendTo(right);
    
  };
  
  MainMenu.prototype.toggleButton = function(action, state){
    this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);
  
    return this;
  };
    
  return MainMenu;
  
})();