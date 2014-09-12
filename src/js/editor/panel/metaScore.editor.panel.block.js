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
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    BlockPanel.parent.call(this, this.configs);
      
    // fix event handlers scope
    this.onBlockDragStart = metaScore.Function.proxy(this.onBlockDragStart, this);
    this.onBlockDragEnd = metaScore.Function.proxy(this.onBlockDragEnd, this);
    this.onBlockResizeStart = metaScore.Function.proxy(this.onBlockResizeStart, this);
    this.onBlockResizeEnd = metaScore.Function.proxy(this.onBlockResizeEnd, this);
    
    this.menu = new metaScore.editor.DropDownMenu();
    this.menu.addItem({'text': metaScore.String.t('Add a new block'), 'data-action': 'new'});
    this.menu.addItem({'text': metaScore.String.t('Delete the active block'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(this.menu);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this));
  }

  BlockPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Block'),
    
    /**
    * The panel's fields
    */
    fields: {
      'name': {
        'type': metaScore.editor.field.Text,
        'label': metaScore.String.t('Name')
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height')
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image')
      },
      'synched': {
        'type': metaScore.editor.field.Boolean,
        'label': metaScore.String.t('Synchronized pages ?')
      }
    }
  };
  
  metaScore.editor.Panel.extend(BlockPanel);
  
  BlockPanel.prototype.setComponenet = function(componenet, supressEvent){
    // call parent constructor
    BlockPanel.parent.setComponenet.call(this, componenet, supressEvent);
    
    componenet._draggable = new metaScore.Draggable({'target': componenet.dom, 'handle': componenet.dom.child('.pager'), 'container': componenet.dom.parents()}).enable();
    componenet._resizable = new metaScore.Resizable({'target': componenet.dom, 'container': componenet.dom.parents()}).enable();
    
    componenet.dom
      .addListener('dragstart', this.onBlockDragStart)
      .addListener('dragend', this.onBlockDragEnd)
      .addListener('resizestart', this.onBlockResizeStart)
      .addListener('resizeend', this.onBlockResizeEnd)
      .addClass('selected');
    
  };
  
  BlockPanel.prototype.onBlockDragStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.beforeDragValues = this.getValues(fields);
  };
  
  BlockPanel.prototype.onBlockDragEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeDragValues, 'new_values': this.getValues(fields)});
    
    delete this.beforeDragValues;
  };
  
  BlockPanel.prototype.onBlockResizeStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.beforeResizeValues = this.getValues(fields);
  };
  
  BlockPanel.prototype.onBlockResizeEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeResizeValues, 'new_values': this.getValues(fields)});
    
    delete this.beforeResizeValues;
  };
    
  return BlockPanel;
  
})();