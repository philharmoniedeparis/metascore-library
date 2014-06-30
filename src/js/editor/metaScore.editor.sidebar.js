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

  var _panels = {};

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'sidebar'});
  
    _panels.block = new metaScore.Editor.Panel.Block()
      .appendTo(this);
  
    _panels.page = new metaScore.Editor.Panel.Page()
      .appendTo(this);
  
    _panels.element = new metaScore.Editor.Panel.Element()
      .appendTo(this);
  
    _panels.text = new metaScore.Editor.Panel.Text()
      .appendTo(this);
   
  };
  
  this.getPanel = function(panel){
  
    return _panels[panel];
  
  };
});