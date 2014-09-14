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
        'getter': function(component){
          return component.dom.css('background-color');
        },
        'setter': function(component, value){
          component.dom.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        }
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'getter': function(component){
          return component.dom.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(component, value){
          component.dom.css('background-image', 'url('+ value +')');
        }
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time'),
        'getter': function(component){
          return component.dom.data('start-time') || 0;
        },
        'setter': function(component, value){
          component.dom.data('start-time', value);
        }
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time'),
        'getter': function(component){
          return component.dom.data('end-time') || 0;
        },
        'setter': function(component, value){
          component.dom.data('end-time', value);
        }
      }
    }
  };
  
  metaScore.editor.Panel.extend(PagePanel);
    
  return PagePanel;
  
})();