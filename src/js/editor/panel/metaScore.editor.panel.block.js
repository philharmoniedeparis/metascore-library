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
    ],
    
    /**
    * The panel's fields
    */
    fields: {
      'name': {
        'type': metaScore.editor.field.Text,
        'label': metaScore.String.t('Name'),
        'property': 'name'
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X'),
        'property': 'x'
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y'),
        'property': 'y'
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width'),
        'property': 'width',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height'),
        'property': 'height',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color'),
        'property': 'bg-color',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'property': 'bg-image',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'synched': {
        'type': metaScore.editor.field.Boolean,
        'label': metaScore.String.t('Synchronized pages ?'),
        'property': 'synched',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      }
    }
  };
  
  metaScore.editor.Panel.extend(BlockPanel);
  
  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
    
    if(component instanceof metaScore.player.Controller){
      return {
        'target': component,
        'handle': component.child('.timer'),
        'container': component.parents()
      };
    }
  
    return {
      'target': component,
      'handle': component.child('.pager'),
      'container': component.parents()
    };
  };
  
  BlockPanel.prototype.getResizable = function(){  
    var component = this.getComponent();
    
    if(component instanceof metaScore.player.Controller){
      return false;
    }
    
    return {
      'target': component,
      'container': component.parents()
    };
  };
    
  return BlockPanel;
  
})();