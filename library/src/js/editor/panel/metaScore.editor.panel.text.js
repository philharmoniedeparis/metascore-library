/*global metaScore console*/

/**
* Editor panel
*/
metaScore.Editor.Panel.Text = metaScore.Editor.Panel.extend(function(){

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Text',
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'X'
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Y'
      },
      'endtime': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'End time'
      }
    }
  };
  
  
});