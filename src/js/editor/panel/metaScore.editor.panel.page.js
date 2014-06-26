/**
 * Page
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 */
metaScore.Editor.Panel.Page = metaScore.Editor.Panel.extend(function(){

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Page',
    
    /**
    * The panel's fields
    */
    fields: {
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Background color'
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': 'Background image'
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