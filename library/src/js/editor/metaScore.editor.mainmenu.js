/*global global console*/

/**
* Editor main menu
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Editor = metaScore.Editor || {};

  metaScore.Editor.MainMenu = metaScore.Dom.extend({
    init: function() {
    
      this.callSuper('<div/>', {'class': 'main-menu clearfix'});
      
      this.setupUI();
      
    },    
    setupUI: function(){
    
      var left, right;
      
      this.buttons = {};
      
      left = metaScore.Dom.create('<div/>', {'class': 'left'}).appendTo(this);
      right = metaScore.Dom.create('<div/>', {'class': 'right'}).appendTo(this);
      
      this.buttons['new'] = metaScore.Form.Button.create()
        .attr({
          'class': 'new',
          'title': metaScore.String.t('New')
        })
        .appendTo(left);
      
      this.buttons['open'] = metaScore.Form.Button.create()
        .attr({
          'class': 'open',
          'title': metaScore.String.t('Open')
        })
        .appendTo(left);
      
      this.buttons['save'] = metaScore.Form.Button.create()
        .attr({
          'class': 'save',
          'title': metaScore.String.t('save')
        })
        .appendTo(left);
      
      this.buttons['download'] = metaScore.Form.Button.create()
        .attr({
          'class': 'download',
          'title': metaScore.String.t('download')
        })
        .appendTo(left);
      
      this.buttons['delete'] = metaScore.Form.Button.create()
        .attr({
          'class': 'delete',
          'title': metaScore.String.t('delete')
        })
        .appendTo(left);
      
      this.buttons['time'] = metaScore.Form.TimeField.create()
        .attr({
          'class': 'time',
          'title': metaScore.String.t('time')
        })
        .appendTo(left);
      
      this.buttons['revert'] = metaScore.Form.Button.create()
        .attr({
          'class': 'revert',
          'title': metaScore.String.t('revert')
        })
        .appendTo(left);
      
      this.buttons['undo'] = metaScore.Form.Button.create()
        .attr({
          'class': 'undo',
          'title': metaScore.String.t('undo')
        })
        .appendTo(left);
      
      this.buttons['redo'] = metaScore.Form.Button.create()
        .attr({
          'class': 'redo',
          'title': metaScore.String.t('redo')
        })
        .disable()
        .appendTo(left);
        
      
      this.buttons['edit'] = metaScore.Form.Button.create()
        .attr({
          'class': 'edit',
          'title': metaScore.String.t('edit')
        })
        .appendTo(right);
      
      this.buttons['grid'] = metaScore.Form.Button.create()
        .attr({
          'class': 'grid',
          'title': metaScore.String.t('grid')
        })
        .appendTo(right);
      
      this.buttons['settings'] = metaScore.Form.Button.create()
        .attr({
          'class': 'settings',
          'title': metaScore.String.t('settings')
        })
        .appendTo(right);
      
      this.buttons['help'] = metaScore.Form.Button.create()
        .attr({
          'class': 'help',
          'title': metaScore.String.t('help')
        })
        .appendTo(right);
      
    }
  });
  
}(global));