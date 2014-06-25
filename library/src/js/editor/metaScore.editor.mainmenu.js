/**
* Main Menu
*/
metaScore.Editor.MainMenu = metaScore.Dom.extend(function(){

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'main-menu clearfix'});
    
    this.setupUI();
    
  };
  
  this.setupUI = function(){
  
    var left, right;
    
    this.buttons = {};
    
    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);
    
    this.buttons['new'] = new metaScore.Editor.Button()
      .attr({
        'class': 'new',
        'title': metaScore.String.t('New')
      })
      .appendTo(left);
    
    this.buttons['open'] = new metaScore.Editor.Button()
      .attr({
        'class': 'open',
        'title': metaScore.String.t('Open')
      })
      .appendTo(left);
    
    this.buttons['edit'] = new metaScore.Editor.Button()
      .attr({
        'class': 'edit',
        'title': metaScore.String.t('edit')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['save'] = new metaScore.Editor.Button()
      .attr({
        'class': 'save',
        'title': metaScore.String.t('save')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['download'] = new metaScore.Editor.Button()
      .attr({
        'class': 'download',
        'title': metaScore.String.t('download')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['delete'] = new metaScore.Editor.Button()
      .attr({
        'class': 'delete',
        'title': metaScore.String.t('delete')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['time'] = new metaScore.Editor.Field.TimeField()
      .attr({
        'class': 'time',
        'title': metaScore.String.t('time')
      })
      .appendTo(left);
    
    this.buttons['revert'] = new metaScore.Editor.Button()
      .attr({
        'class': 'revert',
        'title': metaScore.String.t('revert')
      })
      .appendTo(left);
    
    this.buttons['undo'] = new metaScore.Editor.Button()
      .attr({
        'class': 'undo',
        'title': metaScore.String.t('undo')
      })
      .appendTo(left);
    
    this.buttons['redo'] = new metaScore.Editor.Button()
      .attr({
        'class': 'redo',
        'title': metaScore.String.t('redo')
      })
      .disable()
      .appendTo(left);
      
    
    this.buttons['settings'] = new metaScore.Editor.Button()
      .attr({
        'class': 'settings',
        'title': metaScore.String.t('settings')
      })
      .appendTo(right);
    
    this.buttons['help'] = new metaScore.Editor.Button()
      .attr({
        'class': 'help',
        'title': metaScore.String.t('help')
      })
      .appendTo(right);
    
  };
});