/*global metaScore console*/

/**
* Editor panel
*/
metaScore.Editor.Panel.Element = metaScore.Editor.Panel.extend(function(){

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Element',
    
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
      'r_index': {
        'type': metaScore.Editor.Field.IntegerField,
        'configs': {
          'min': 0
        },
        'label': 'Reading index'
      },
      'z_index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Display index'
      },
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Background color'
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': 'Background image'
      },
      'border_width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Border width'
      },
      'border_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Border color'
      },
      'rounded_conrners': {
        'type': metaScore.Editor.Field.CornerField,
        'label': 'Rounded conrners'
      },
      'start_time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'Start time'
      },
      'end_time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'End time'
      }
    }
  };
  
  
});