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
metaScore.Editor.Panel.Block = metaScore.Editor.Panel.extend(function(){

  var _menu, _block;

  this.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Block'),
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Height')
      },
      'bg-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
      },
      'synched': {
        'type': metaScore.Editor.Field.BooleanField,
        'label': metaScore.String.t('Synchronized pages ?')
      }
    }
  };
  
  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(configs);
    
    _menu = new metaScore.Editor.DropDownMenu();
    _menu.addItem({'text': metaScore.String.t('Add a new block'), 'data-action': 'new'});
    _menu.addItem({'text': metaScore.String.t('Delete the active block'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(_menu);
      
    this.addDelegate('.field', 'valuechange', this.onFieldValueChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getBlock = function(){
  
    return _block;
  
  };
  
  this.setBlock = function(block, supressEvent){
  
    if(_block && (_block.get(0) === block.get(0))){
      return;
    }
    
    this.unsetBlock(supressEvent);
    
    this.enableFields();
    this.updateFieldValues(block);  
    this.getMenu().enableItems('[data-action="delete"]');
    
    block._draggable = new metaScore.Draggable(block, block.child('.pager'), block.parents()).enable();
    block._resizable = new metaScore.Resizable(block, block.parents()).enable();
    
    block
      .addListener('dragstart', this.onBlockDragStart)
      .addListener('dragend', this.onBlockDragEnd)
      .addListener('resizestart', this.onBlockResizeStart)
      .addListener('resizeend', this.onBlockResizeEnd)
      .addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('blockset', {'block': block});
    }
    
    _block = block;
    
    return this;
    
  };
  
  this.unsetBlock = function(supressEvent){
  
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
      
      _block = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('blockunset', {'block': block});
    }
    
    return this;
    
  };
  
  this.onBlockDragStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.beforeDragValues = this.getValues(block, fields);
  };
  
  this.onBlockDragEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(block, fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeDragValues, 'new_values': this.getValues(block, fields)});
    
    delete this.beforeDragValues;
  };
  
  this.onBlockResizeStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.beforeResizeValues = this.getValues(block, fields);
  };
  
  this.onBlockResizeEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(block, fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeResizeValues, 'new_values': this.getValues(block, fields)});
    
    delete this.beforeResizeValues;
  };
  
  this.onFieldValueChange = function(evt){
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
  
  this.updateFieldValue = function(name, value, supressEvent){
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
  
  this.updateFieldValues = function(block, values, supressEvent){
  
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
  
  this.updateBlockProperty = function(block, name, value){
  
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
  
  this.updateBlockProperties = function(block, values){
  
    metaScore.Object.each(values, function(name, value){
      this.updateBlockProperty(block, name, value);
    }, this);
    
    this.updateFieldValues(block, values, true);
  
  };
  
  this.getValue = function(block, name){
  
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
  
  this.getValues = function(block, fields){
  
    var values = {};
    
    fields = fields || Object.keys(this.getField());
    
    metaScore.Array.each(fields, function(index, field){
      values[field] = this.getValue(block, field);
    }, this);
    
    return values;  
  };
  
  
});