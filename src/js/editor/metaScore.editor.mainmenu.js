/**
 * MainMenu
 *
 * @requires metaScore.editor.button.js
 * @requires field/metaScore.editor.field.timefield.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.Editor.MainMenu = metaScore.Dom.extend(function(){

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'main-menu clearfix'});
    
    this.setupUI();
    
  };
  
  this.setupUI = function(){
  
    var left, right;
    
    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('New')
      })
      .data('action', 'new')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('Open')
      })
      .data('action', 'open')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('edit')
      })
      .data('action', 'edit')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('save')
      })
      .data('action', 'save')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('download')
      })
      .data('action', 'download')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('delete')
      })
      .data('action', 'delete')
      .appendTo(left);
    
    new metaScore.Editor.Field.TimeField()
      .attr({
        'title': metaScore.String.t('time')
      })
      .data('action', 'time')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('revert')
      })
      .data('action', 'revert')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('undo')
      })
      .data('action', 'undo')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('redo')
      })
      .data('action', 'redo')
      .appendTo(left);
      
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('settings')
      })
      .data('action', 'settings')
      .appendTo(right);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('help')
      })
      .data('action', 'help')
      .appendTo(right);
    
  };
  
  this.enableItems = function(selector){
  
    var items = this.children(selector);
    
    items.removeClass('disabled');
  
    return items;
  
  };
  
  this.disableItems = function(selector){
  
    var items = this.children(selector);
    
    items.addClass('disabled');
  
    return items;
  
  };
});