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

metaScore.editor.panel.Element = (function () {
  
  function ElementPanel(configs) {    
    // call parent constructor
    ElementPanel.parent.call(this, configs);
  }

  ElementPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Element'),
    
    menuItems: [
      {
        'text': metaScore.String.t('Add a new cursor'),
        'data-action': 'new',
        'data-type': 'Cursor'
      },
      {
        'text': metaScore.String.t('Add a new image'),
        'data-action': 'new',
        'data-type': 'Image'
      },
      {
        'text': metaScore.String.t('Add a new text element'),
        'data-action': 'new',
        'data-type': 'Text'
      },
      {
        'text': metaScore.String.t('Delete the active element'),
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
        'property': 'width'
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height'),
        'property': 'height'
      },
      'r-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Reading index'),
        'property': 'r-index',
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Display index'),
        'property': 'z-index'
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color'),
        'property': 'bg-color'
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'property': 'bg-image'
      },
      'border-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Border width'),
        'property': 'border-width'
      },
      'border-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Border color'),
        'property': 'border-color'
      },
      'rounded-conrners': {
        'type': metaScore.editor.field.Corner,
        'label': metaScore.String.t('Rounded conrners'),
        'property': 'rounded-conrners'
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time'),
        'property': 'start-time'
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time'),
        'property': 'end-time'
      },
      'direction': {
        'type': metaScore.editor.field.Select,
        'label': metaScore.String.t('Direction'),
        'property': 'direction',
        'filter': function(component){
          return component.data('type') === 'cursor';
        },
        'configs': {
          'options': {
            'right': metaScore.String.t('Left > Right'),
            'left': metaScore.String.t('Right > Left'),
            'bottom': metaScore.String.t('Top > Bottom'),
            'top': metaScore.String.t('Bottom > Top'),
          }
        }
      },
      'cursor-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Cursor width'),
        'property': 'cursor-width',
        'filter': function(component){
          return component.data('type') === 'cursor';
        }
      },
      'cursor-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Cursor color'),
        'property': 'cursor-color',
        'filter': function(component){
          return component.data('type') === 'cursor';
        }
      },
      'font-family': {
        'type': metaScore.editor.field.Select,
        'label': metaScore.String.t('Font'),
        'property': 'font-family',
        'filter': function(component){
          return component.data('type') === 'text';
        },
        'configs': {
          'options': {
            'Georgia, serif': 'Georgia',
            '"Times New Roman", Times, serif': 'Times New Roman',
            'Arial, Helvetica, sans-serif': 'Arial',
            '"Comic Sans MS", cursive, sans-serif': 'Comic Sans MS',
            'Impact, Charcoal, sans-serif': 'Impact',
            '"Lucida Sans Unicode", "Lucida Grande", sans-serif': 'Lucida Sans Unicode',
            'Tahoma, Geneva, sans-serif': 'Tahoma',
            'Verdana, Geneva, sans-serif': 'Verdana',
            '"Courier New", Courier, monospace': 'Courier New',
            '"Lucida Console", Monaco, monospace': 'Lucida Console'
          }
        }
      },
      'text-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Text color'),
        'property': 'text-color',
        'filter': function(component){
          return component.data('type') === 'text';
        }
      }
    }
  };
  
  metaScore.editor.Panel.extend(ElementPanel);
  
  ElementPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
  
    return {
      'target': component,
      'handle': component,
      'container': component.parents()
    };
  };
  
  ElementPanel.prototype.getResizable = function(){
    var component = this.getComponent();
    
    return {
      'target': component,
      'container': component.parents()
    };
  };
  
  ElementPanel.prototype.setComponent = function(component, supressEvent){    
    // call parent function
    ElementPanel.parent.prototype.setComponent.call(this, component, supressEvent);
    
    if(component.data('type') === 'text'){
      component.setEditable(true);
    }
    
    return this;
  };
    
  return ElementPanel;
  
})();