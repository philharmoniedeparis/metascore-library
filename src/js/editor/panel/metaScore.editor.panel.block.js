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

metaScore.editor.panel.Block = (function () {
  
  function BlockPanel(configs) {    
    // call parent constructor
    BlockPanel.parent.call(this, configs);
  }

  BlockPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Block'),
    
    menuItems: [
      {
        'text': metaScore.String.t('Add a new block'),
        'data-action': 'new'
      },
      {
        'text': metaScore.String.t('Delete the active block'),
        'data-action': 'delete'
      }
    ]
  };
  
  metaScore.editor.Panel.extend(BlockPanel);
  
  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();    
    
    if(component instanceof metaScore.player.component.Controller){
      return {
        'target': component,
        'handle': component.child('.timer'),
        'container': component.parents()
      };
    }    
    else if(component instanceof metaScore.player.component.Media){
      return {
        'target': component,
        'handle': component.child('video'),
        'container': component.parents()
      };
    }
    else if(component instanceof metaScore.player.component.Block){
      return {
        'target': component,
        'handle': component.child('.pager'),
        'container': component.parents()
      };
    }
    
    return false;
  };
  
  BlockPanel.prototype.getResizable = function(){  
    var component = this.getComponent();
    
    if(component instanceof metaScore.player.component.Controller){
      return false;
    }
    
    return {
      'target': component,
      'container': component.parents()
    };
  };
    
  return BlockPanel;
  
})();