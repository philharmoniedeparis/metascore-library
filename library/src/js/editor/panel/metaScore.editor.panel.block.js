/*global metaScore console*/

/**
* Editor panel
*/
metaScore.Editor.Panel.Block = metaScore.Editor.Panel.extend(function(){

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Block',
    
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
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Width'
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Height'
      },
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Background color'
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': 'Background image'
      },
      'synched': {
        'type': metaScore.Editor.Field.BooleanField,
        'label': 'Synchronized pages ?'
      }
    }
  };
  
  
});