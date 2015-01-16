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
 
metaScore.namespace('editor.panel').Page = (function () {
  
  function PagePanel(configs) {    
    // call parent constructor
    PagePanel.parent.call(this, configs);
  }

  PagePanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.Locale.t('editor.panel.Page.title', 'Page'),
    
    menuItems: {
      'new': metaScore.Locale.t('editor.panel.Page.menuItems.new', 'Add a new page'),
      'delete': metaScore.Locale.t('editor.panel.Page.menuItems.delete', 'Delete the active page')
    }
  };
  
  metaScore.editor.Panel.extend(PagePanel);
    
  return PagePanel;
  
})();