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
        'getter': function(component){
          return component.dom.data('name');
        },
        'setter': function(component, value){
          component.dom.data('name', value);
        }
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X'),
        'getter': function(component){
          return parseInt(component.dom.css('left'), 10);
        },
        'setter': function(component, value){
          component.dom.css('left', value +'px');
        }
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y'),
        'getter': function(component){
          return parseInt(component.dom.css('top'), 10);
        },
        'setter': function(component, value){
          component.dom.css('top', value +'px');
        }
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width'),
        'getter': function(component){
          return parseInt(component.dom.css('width'), 10);
        },
        'setter': function(component, value){
          component.dom.css('width', value +'px');
        }
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height'),
        'getter': function(component){
          return parseInt(component.dom.css('height'), 10);
        },
        'setter': function(component, value){
          component.dom.css('height', value +'px');
        }
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color'),
        'getter': function(component){
          return component.dom.css('background-color');
        },
        'setter': function(component, value){
          component.dom.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        }
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'getter': function(component){
          return component.dom.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(component, value){
          component.dom.css('background-image', 'url('+ value +')');
        }
      },
      'synched': {
        'type': metaScore.editor.field.Boolean,
        'label': metaScore.String.t('Synchronized pages ?'),
        'getter': function(component){
          return component.dom.data('synched') === "true";
        },
        'setter': function(component, value){
          component.dom.data('synched', value);
        }
      }
    }
  };
  
  metaScore.editor.Panel.extend(BlockPanel);
  
  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
  
    return {
      'target': component.dom,
      'handle': component.dom.child('.pager'),
      'container': component.dom.parents()
    };
  };
  
  BlockPanel.prototype.getResizable = function(){  
    var component = this.getComponent();
    
    return {
      'target': component.dom,
      'container': component.dom.parents()
    };
  };
    
  return BlockPanel;
  
})();