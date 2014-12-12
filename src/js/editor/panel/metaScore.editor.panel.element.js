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

metaScore.editor.panel.Element = (function () {
  
  function ElementPanel(configs) {    
    // call parent constructor
    ElementPanel.parent.call(this, configs);
  }

  ElementPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Element'),
    
    menuItems: [
      {
        'text': metaScore.String.t('Add a new cursor'),
        'data-action': 'new',
        'data-type': 'Cursor'
      },
      {
        'text': metaScore.String.t('Add a new image'),
        'data-action': 'new',
        'data-type': 'Image'
      },
      {
        'text': metaScore.String.t('Add a new text element'),
        'data-action': 'new',
        'data-type': 'Text'
      },
      {
        'text': metaScore.String.t('Delete the active element'),
        'data-action': 'delete'
      }
    ]
  };
  
  metaScore.editor.Panel.extend(ElementPanel);
  
  ElementPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
  
    return {
      'target': component,
      'handle': component,
      'container': component.parents()
    };
  };
  
  ElementPanel.prototype.getResizable = function(){
    var component = this.getComponent();
    
    return {
      'target': component,
      'container': component.parents()
    };
  };
    
  return ElementPanel;
  
})();