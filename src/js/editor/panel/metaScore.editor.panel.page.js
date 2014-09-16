/**
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 * @requires ../../helpers/metaScore.string.js
 * @requires ../../helpers/metaScore.resizable.js
 * @requires ../../helpers/metaScore.resizable.js
 */
 
metaScore.namespace('editor.panel');

metaScore.editor.panel.Page = (function () {
  
  function PagePanel(configs) {    
    // call parent constructor
    PagePanel.parent.call(this, configs);
  }

  PagePanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Page'),
    
    menuItems: [
      {
        'text': metaScore.String.t('Add a new page'),
        'data-action': 'new'
      },
      {
        'text': metaScore.String.t('Delete the active page'),
        'data-action': 'delete'
      }
    ],
    
    /**
    * The panel's fields
    */
    fields: {
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color'),
        'property': 'bg-color'
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'property': 'bg-image'
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time'),
        'property': 'start-time'
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time'),
        'property': 'end-time'
      }
    }
  };
  
  metaScore.editor.Panel.extend(PagePanel);
    
  return PagePanel;
  
})();