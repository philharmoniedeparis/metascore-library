/**
 * Sidebar
 *
 * @requires panel/metaScore.editor.panel.block.js
 * @requires panel/metaScore.editor.panel.page.js
 * @requires panel/metaScore.editor.panel.element.js
 * @requires panel/metaScore.editor.panel.text.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Sidebar = metaScore.Dom.extend(function(){

  var panels = {};

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'sidebar'});
  
    panels.block = new metaScore.Editor.Panel.Block()
      .appendTo(this);
  
    panels.page = new metaScore.Editor.Panel.Page()
      .appendTo(this);
  
    panels.element = new metaScore.Editor.Panel.Element()
      .appendTo(this);
  
    panels.text = new metaScore.Editor.Panel.Text()
      .appendTo(this);
   
  };
  
  this.getPanel = function(panel){
  
    return panels[panel];
  
  };
});