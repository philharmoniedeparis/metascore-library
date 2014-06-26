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

  var menu;

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
    menu.addItem('Add a new block');
    menu.addItem('Delete the active block');
    
    this.getToolbar().addButton()
      .addClass('menu')
      .append(menu);
    
  };
  
  
});