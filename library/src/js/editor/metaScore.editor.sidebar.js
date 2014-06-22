/*global global console*/

/**
* Editor sidebar
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Editor = metaScore.Editor || {};

  metaScore.Editor.Sidebar = metaScore.Dom.extend({
    init: function() {
    
      this.callSuper('<div/>', {'class': 'sidebar'});
     
      this.addPanels();
     
    },
    
    addPanels: function(){
    
      this.panels = {};
    
      this.panels.block = metaScore.Editor.Panel.create({
          'title': 'Block',
          'fields': {
            'x': {
              'type': metaScore.Form.IntegerField,
              'label': 'X'
            },
            'y': {
              'type': metaScore.Form.IntegerField,
              'label': 'Y'
            },
            'endtime': {
              'type': metaScore.Form.TimeField,
              'label': 'End time'
            }
          }
        })
        .appendTo(this);
    
      this.panels.page = metaScore.Editor.Panel.create({'title': 'Page'})
        .appendTo(this);
    
      this.panels.element = metaScore.Editor.Panel.create({'title': 'Element'})
        .appendTo(this);
    
      this.panels.text = metaScore.Editor.Panel.create({'title': 'Text'})
        .appendTo(this);
    
    }
  });
  
}(global));