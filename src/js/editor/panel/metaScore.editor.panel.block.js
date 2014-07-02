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
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg_image': {
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
      .addClass('menu')
      .append(_menu);
      
    this.addDelegate('.field', 'change', this.onFieldChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getBlock = function(){
  
    return _block;
  
  };
  
  this.setBlock = function(block){
    
    this.unsetBlock(_block);
    
    _block = block;
    
    if(!_block._draggable){
      new metaScore.Draggable(_block, _block.children('.pager'), _block.parents());
    }
    _block._draggable.enable();
    
    if(!_block._resizable){
      new metaScore.Resizable(_block, _block.parents());
    }
    _block._resizable.enable(); 
    
    _block
      .addListener('drag', this.onBlockDrag)
      .addListener('resize', this.onBlockResize)
      .addClass('selected');
    
    this.updateValues();
      
    this.enableFields();
      
    this.triggerEvent('blockset', {'block': _block});
    
  };
  
  this.unsetBlock = function(block){
  
    block = block || this.getBlock();
  
    if(!block){
      return;
    }
    
    if(block._draggable){
      block._draggable.disable();
    }
    if(block._resizable){
      block._resizable.disable();
    }
  
    block
      .removeListener('drag', this.onBlockDrag)
      .removeListener('resize', this.onBlockResize)
      .removeClass('selected');
      
    this.disableFields();
      
    this.triggerEvent('blockunset', {'block': block});
    
  };
  
  this.onBlockDrag = function(evt){  
    this.updateValues(['x', 'y']);
  };
  
  this.onBlockResize = function(evt){  
    this.updateValues(['x', 'y', 'width', 'height']);
  };
  
  this.onFieldChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!_block){
      return;
    }
  
    switch(field.data('name')){
      case 'x':
        _block.css('left', value +'px');
        break;
      case 'y':
        _block.css('top', value +'px');
        break;
      case 'width':
        _block.css('width', value +'px');
        break;
      case 'height':
        _block.css('height', value +'px');
        break;
      case 'bg_color':
        _block.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg_image':
        // TODO
        break;
      case 'synched':
        _block.data('synched', value);
        break;
    }
  };
  
  this.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
        field.setValue(parseInt(_block.css('left'), 10));
        break;
      case 'y':
        field.setValue(parseInt(_block.css('top'), 10));
        break;
      case 'width':
        field.setValue(parseInt(_block.css('width'), 10));
        break;
      case 'height':
        field.setValue(parseInt(_block.css('height'), 10));
        break;
      case 'bg_color':
        field.setValue(_block.css('background-color'));
        break;
      case 'bg_image':
        // TODO
        break;
      case 'synched':
        field.setChecked(_block.data('synched') === "true");
        break;
    }
  };
  
  this.updateValues = function(fields){
  
    if(fields === undefined){
      fields = Object.keys(this.getField());
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);
  
  };
  
  
});