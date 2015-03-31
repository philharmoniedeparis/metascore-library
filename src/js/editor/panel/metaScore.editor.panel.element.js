/**
* Description
* @class Element
* @namespace metaScore.editor.panel
* @extends metaScore.editor.Panel
*/

metaScore.namespace('editor.panel').Element = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
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

  /**
   * Description
   * @method getDraggable
   * @return ObjectExpression
   */
  ElementPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
    
    if(component.getProperty('locked')){
      return false;
    }

    return {
      'target': component,
      'handle': component,
      'container': component.parents()
    };
  };

  /**
   * Description
   * @method getResizable
   * @return ObjectExpression
   */
  ElementPanel.prototype.getResizable = function(){
    var component = this.getComponent();
    
    if(component.getProperty('locked')){
      return false;
    }

    return {
      'target': component,
      'container': component.parents()
    };
  };

  return ElementPanel;

})();