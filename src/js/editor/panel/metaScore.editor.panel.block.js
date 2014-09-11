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
  
  BlockPanel.prototype.getMenu = function(){  
    return this.menu;  
  };
  
  BlockPanel.prototype.getBlock = function(){  
    return this.block;  
  };
  
  BlockPanel.prototype.setBlock = function(block, supressEvent){  
    if(this.block && (this.block.get(0) === block.get(0))){
      return;
    }
    
    this.unsetBlock(supressEvent);
    
    this.enableFields();
    this.updateFieldValues(block);  
    this.getMenu().enableItems('[data-action="delete"]');
    
    block._draggable = new metaScore.Draggable({'target': block, 'handle': block.child('.pager'), 'container': block.parents()}).enable();
    block._resizable = new metaScore.Resizable({'target': block, 'container': block.parents()}).enable();
    
    block
      .addListener('dragstart', this.onBlockDragStart)
      .addListener('dragend', this.onBlockDragEnd)
      .addListener('resizestart', this.onBlockResizeStart)
      .addListener('resizeend', this.onBlockResizeEnd)
      .addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('blockset', {'block': block});
    }
    
    this.block = block;
    
    return this;    
  };
  
  BlockPanel.prototype.unsetBlock = function(supressEvent){  
    var block = this.getBlock();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(block){
      block._draggable.destroy();
      delete block._draggable;
      
      block._resizable.destroy();
      delete block._resizable;
  
      block
        .removeListener('dragstart', this.onBlockDragStart)
        .removeListener('dragend', this.onBlockDragEnd)
        .removeListener('resizestart', this.onBlockResizeStart)
        .removeListener('resizeend', this.onBlockResizeEnd)
        .removeClass('selected');
      
      this.block = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('blockunset', {'block': block});
    }
    
    return this;    
  };
  
  BlockPanel.prototype.onBlockDragStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.beforeDragValues = this.getValues(block, fields);
  };
  
  BlockPanel.prototype.onBlockDragEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(block, fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeDragValues, 'new_values': this.getValues(block, fields)});
    
    delete this.beforeDragValues;
  };
  
  BlockPanel.prototype.onBlockResizeStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.beforeResizeValues = this.getValues(block, fields);
  };
  
  BlockPanel.prototype.onBlockResizeEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(block, fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeResizeValues, 'new_values': this.getValues(block, fields)});
    
    delete this.beforeResizeValues;
  };
  
  BlockPanel.prototype.onFieldValueChange = function(evt){
    var block = this.getBlock(),
      field, value, old_values;
      
    if(!block){
      return;
    }
    
    field = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues(block, [field]);
    
    this.updateBlockProperty(block, field, value);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': old_values, 'new_values': this.getValues(block, [field])});
  };
  
  BlockPanel.prototype.updateFieldValue = function(name, value, supressEvent){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
      case 'y':
      case 'width':
      case 'height':
      case 'bg-color':
        field.setValue(value);
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        field.setChecked(value);
        break;
    }
    
    if(supressEvent !== true){
      field.triggerEvent('change');
    }
  };
  
  BlockPanel.prototype.updateFieldValues = function(block, values, supressEvent){  
    if(block !== this.getBlock()){
      return;
    }
  
    values = values || this.getValues(block, Object.keys(this.getField()));
    
    if(metaScore.Var.is(values, 'array')){
      metaScore.Array.each(values, function(index, field){
        this.updateFieldValue(field, this.getValue(block, field), supressEvent);
      }, this);
    }
    else{
      metaScore.Object.each(values, function(field, value){
        this.updateFieldValue(field, value, supressEvent);
      }, this);
    }
  };
  
  BlockPanel.prototype.updateBlockProperty = function(block, name, value){  
    switch(name){
      case 'x':
        block.css('left', value +'px');
        break;
      case 'y':
        block.css('top', value +'px');
        break;
      case 'width':
        block.css('width', value +'px');
        break;
      case 'height':
        block.css('height', value +'px');
        break;
      case 'bg-color':
        block.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        block.data('synched', value);
        break;
    }  
  };
  
  BlockPanel.prototype.updateBlockProperties = function(block, values){  
    metaScore.Object.each(values, function(name, value){
      this.updateBlockProperty(block, name, value);
    }, this);
    
    this.updateFieldValues(block, values, true);  
  };
  
  BlockPanel.prototype.getValue = function(block, name){  
    var value;
  
    switch(name){
      case 'x':
        value = parseInt(block.css('left'), 10);
        break;
      case 'y':
        value = parseInt(block.css('top'), 10);
        break;
      case 'width':
       value = parseInt(block.css('width'), 10);
        break;
      case 'height':
        value = parseInt(block.css('height'), 10);
        break;
      case 'bg-color':
        value = block.css('background-color');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        value = block.data('synched') === "true";
        break;
    }
    
    return value;  
  };
  
  BlockPanel.prototype.getValues = function(block, fields){  
    var values = {};
    
    fields = fields || Object.keys(this.getField());
    
    metaScore.Array.each(fields, function(index, field){
      values[field] = this.getValue(block, field);
    }, this);
    
    return values;  
  };
    
  return BlockPanel;
  
})();