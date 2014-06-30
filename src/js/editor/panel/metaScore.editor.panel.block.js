/**
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 * @requires ../../helpers/metaScore.draggable.js
 * @requires ../../helpers/metaScore.resizable.js
 */
metaScore.Editor.Panel.Block = metaScore.Editor.Panel.extend(function(){

  var _menu, _block;

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Block',
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'X'
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Y'
      },
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Width'
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Height'
      },
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Background color'
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': 'Background image'
      },
      'synched': {
        'type': metaScore.Editor.Field.BooleanField,
        'label': 'Synchronized pages ?'
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
    _menu.addItem({'text': 'Add a new block', 'class': 'new'});
    _menu.addItem({'text': 'Delete the active block', 'class': 'delete'});
    
    this.getToolbar().addButton()
      .addClass('menu')
      .append(_menu);
      
    this.addDelegate('.field', 'change', function(evt){
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
      
    });
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.selectBlock = function(new_block){
  
    var old_block = _block;
    
    _block = new_block;
  
    this.unSelectBlock(old_block);
    
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
    
  };
  
  this.unSelectBlock = function(block){
  
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
    
  };
  
  this.onBlockDrag = function(evt){  
    this.updateValues(['x', 'y']);
  };
  
  this.onBlockResize = function(evt){  
    this.updateValues(['x', 'y', 'width', 'height']);
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
      default:
        return;
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
  
  this.getBlock = function(){
  
    return _block;
  
  };
  
  
});