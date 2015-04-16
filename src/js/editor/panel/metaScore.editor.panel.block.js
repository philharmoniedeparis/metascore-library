/**
* Description
* @class Block
* @namespace metaScore.editor.panel
* @extends metaScore.editor.Panel
*/

metaScore.namespace('editor.panel').Block = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function BlockPanel(configs) {
    // call parent constructor
    BlockPanel.parent.call(this, configs);
  }

  BlockPanel.defaults = {
    toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
      title: metaScore.Locale.t('editor.panel.Block.title', 'Block'),
      menuItems: {
        'synched': metaScore.Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
        'non-synched': metaScore.Locale.t('editor.panel.Block.menuItems.non-synched', 'Add an non-synchronized block'),
        'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
      }
    })
  };

  metaScore.editor.Panel.extend(BlockPanel);

  /**
   * Description
   * @method getDraggable
   * @return Literal
   */
  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
    
    if(component.getProperty('locked')){
      return false;
    }

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

  /**
   * Description
   * @method getResizable
   * @return ObjectExpression
   */
  BlockPanel.prototype.getResizable = function(){
    var component = this.getComponent();

    if(component instanceof metaScore.player.component.Controller || component.getProperty('locked')){
      return false;
    }

    return {
      'target': component,
      'container': component.parents()
    };
  };

  return BlockPanel;

})();