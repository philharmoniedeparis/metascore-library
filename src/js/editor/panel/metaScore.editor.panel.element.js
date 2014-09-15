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
      'r-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Reading index'),
        'getter': function(component){
          return parseInt(component.dom.data('r-index'), 10);
        },
        'setter': function(component, value){
          component.dom.data('r-index', value);
        },
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Display index'),
        'getter': function(component){
          return parseInt(component.dom.css('z-index'), 10);
        },
        'setter': function(component, value){
          component.dom.css('z-index', value);
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
      'border-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Border width'),
        'getter': function(component){
          return parseInt(component.dom.css('border-width'), 10);
        },
        'setter': function(component, value){
          component.dom.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Border color'),
        'getter': function(component){
          return component.dom.css('border-color');
        },
        'setter': function(component, value){
          component.dom.css('border-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        }
      },
      'rounded-conrners': {
        'type': metaScore.editor.field.Corner,
        'label': metaScore.String.t('Rounded conrners'),
        'getter': function(component){
          return null;
        },
        'setter': function(component, value){
          
        }
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time'),
        'getter': function(component){
          return component.dom.data('start-time');
        },
        'setter': function(component, value){
          component.dom.data('start-time', value);
        }
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time'),
        'getter': function(component){
          return component.dom.data('end-time');
        },
        'setter': function(component, value){
          component.dom.data('end-time', value);
        }
      },
      'direction': {
        'type': metaScore.editor.field.Select,
        'label': metaScore.String.t('Direction'),
        'getter': function(component){
          return component.dom.data('direction');
        },
        'setter': function(component, value){
          component.dom.data('direction', value);
        },
        'filter': function(component){
          return component.dom.data('type') === 'cursor';
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
        'getter': function(component){
          return component.cursor.css('width');
        },
        'setter': function(component, value){
          component.cursor.css('width', value +'px');
        },
        'filter': function(component){
          return component.dom.data('type') === 'cursor';
        }
      },
      'cursor-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Cursor color'),
        'getter': function(component){
          return component.cursor.css('background-color');
        },
        'setter': function(component, value){
          component.cursor.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        },
        'filter': function(component){
          return component.dom.data('type') === 'cursor';
        }
      },
      'font-family': {
        'type': metaScore.editor.field.Select,
        'label': metaScore.String.t('Font'),
        'getter': function(component){
          return component.dom.css('font-family');
        },
        'setter': function(component, value){
          component.dom.css('font-family', value);
        },
        'filter': function(component){
          return component.dom.data('type') === 'text';
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
        'getter': function(component){
          return component.dom.css('color');
        },
        'setter': function(component, value){
          component.dom.css('color', value);
        },
        'filter': function(component){
          return component.dom.data('type') === 'text';
        }
      }
    }
  };
  
  metaScore.editor.Panel.extend(ElementPanel);
  
  ElementPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
  
    return {
      'target': component.dom,
      'handle': component.dom,
      'container': component.dom.parents()
    };
  };
  
  ElementPanel.prototype.getResizable = function(){
    var component = this.getComponent();
    
    return {
      'target': component.dom,
      'container': component.dom.parents()
    };
  };
  
  ElementPanel.prototype.setComponent = function(component, supressEvent){
    
    // call parent function
    ElementPanel.parent.prototype.setComponent.call(this, component, supressEvent);
    
    if(component.dom.data('type') === 'text'){
      component.setEditable(true);
    }
    
    return this;    
  };
    
  return ElementPanel;
  
})();