/**
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.numberfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 * @requires ../../helpers/metaScore.string.js
 * @requires ../../helpers/metaScore.resizable.js
 * @requires ../../helpers/metaScore.resizable.js
 */

metaScore.namespace('editor.panel').Element = (function () {

  function ElementPanel(configs) {
    // call parent constructor
    ElementPanel.parent.call(this, configs);
  }

  ElementPanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Element.title', 'Element'),
      menuItems: {
        'Cursor': metaScore.Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
        'Image': metaScore.Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
        'Text': metaScore.Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
        'delete': metaScore.Locale.t('editor.panel.Element.menuItems.delete', 'Delete the active element')
      }
    })
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