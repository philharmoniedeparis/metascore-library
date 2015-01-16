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
 
metaScore.namespace('editor.panel').Block = (function () {
  
  function BlockPanel(configs) {    
    // call parent constructor
    BlockPanel.parent.call(this, configs);
  }

  BlockPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.Locale.t('editor.panel.Block.title', 'Block'),
    
    menuItems: {
      'new': metaScore.Locale.t('editor.panel.Block.menuItems.new', 'Add a new block'),
      'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
    }
  };
  
  metaScore.editor.Panel.extend(BlockPanel);
  
  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();    
    
    if(component instanceof metaScore.player.component.Controller){
      return {
        'target': component,
        'handle': component.child('.timer'),
        'container': component.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      };
    }    
    else if(component instanceof metaScore.player.component.Media){
      return {
        'target': component,
        'handle': component.child('video'),
        'container': component.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      };
    }
    else if(component instanceof metaScore.player.component.Block){
      return {
        'target': component,
        'handle': component.child('.pager'),
        'container': component.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
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