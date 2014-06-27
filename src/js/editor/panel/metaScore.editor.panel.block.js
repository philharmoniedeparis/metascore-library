/**
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 */
metaScore.Editor.Panel.Block = metaScore.Editor.Panel.extend(function(){

  var menu, block;

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
    
    menu = new metaScore.Editor.DropDownMenu();
    menu.addItem({'text': 'Add a new block', 'class': 'new'});
    menu.addItem({'text': 'Delete the active block', 'class': 'delete'});
    
    this.getToolbar().addButton()
      .addClass('menu')
      .append(menu);
      
    this.addDelegate('.field', 'change', function(evt){
      var field = evt.detail.field,
        value = evt.detail.value;
    
      switch(field.data('name')){
        case 'bg_color':
          block.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
          break;
      }
      
    });
    
  };
  
  this.getMenu = function(){
  
    return menu;
  
  };
  
  this.setBlock = function(value){
    block = value;
    
    block.setDraggable(true);    
    block.addListener('drag', this.onBlockDrag);
    
    this.updateValues();
  
  };
  
  this.onBlockDrag = function(evt){  
    this.updateValues(['x', 'y']);
  };
  
  this.updateValue = function(field){
    var value;
    
    switch(field){
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
      default:
        return;
    }
    
    this.getField(field).setValue(value);
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
  
    return block;
  
  };
  
  
});