/**
 * Sidebar
 *
 * @requires metaScore.editor.js
 * @requires panel/metaScore.editor.panel.block.js
 * @requires panel/metaScore.editor.panel.page.js
 * @requires panel/metaScore.editor.panel.element.js
 * @requires panel/metaScore.editor.panel.text.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Sidebar = metaScore.Dom.extend(function(){

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'sidebar'});
   
    this.addPanels();
   
  };
  
  this.addPanels = function(){
  
    new metaScore.Editor.Panel.Block()
      .appendTo(this);
  
    new metaScore.Editor.Panel.Page()
      .appendTo(this);
  
    new metaScore.Editor.Panel.Element()
      .appendTo(this);
  
    new metaScore.Editor.Panel.Text()
      .appendTo(this);
  
  };
});