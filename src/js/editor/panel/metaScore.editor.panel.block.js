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
      
    this.addDelegate('.field', 'change', this.onFieldChange);
    
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
    
    this.unsetBlock(_block, supressEvent);
    
    _block = block;
    
    this.updateValues();      
    this.enableFields();      
    this.getMenu().enableItems('[data-action="delete"]');
    
    _block._draggable = new metaScore.Draggable(_block, _block.child('.pager'), _block.parents()).enable();
    _block._resizable = new metaScore.Resizable(_block, _block.parents()).enable();
    
    _block
      .addListener('drag', this.onBlockDrag)
      .addListener('resize', this.onBlockResize)
      .addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('blockset', {'block': _block});
    }
    
    return this;
    
  };
  
  this.unsetBlock = function(block, supressEvent){
    
    block = block || this.getBlock();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(block){
      block._draggable.destroy();
      delete block._draggable;
      
      block._resizable.destroy();
      delete block._resizable;
  
      block
        .removeListener('drag', this.onBlockDrag)
        .removeListener('resize', this.onBlockResize)
        .removeClass('selected');
      
      _block = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('blockunset', {'block': block});
    }
    
    return this;
    
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
      case 'bg-color':
        _block.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
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
      case 'bg-color':
        field.setValue(_block.css('background-color'));
        break;
      case 'bg-image':
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