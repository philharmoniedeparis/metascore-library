/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.component.element');

metaScore.player.component.element.Text = (function () {

  function Text(configs) {  
    // call parent constructor
    Text.parent.call(this, configs);
  }
  
  metaScore.player.component.Element.extend(Text);
  
  Text.defaults = {
    'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
      'font-family': {
        'type': 'Select',
        'label': metaScore.String.t('Font'),
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
        },
        'getter': function(){
          return this.css('font-family');
        },
        'setter': function(value){
          this.css('font-family', value);
        }
      },
      'text-color': {
        'type': 'Color',
        'label': metaScore.String.t('Text color'),
        'getter': function(){
          return this.css('color');
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      }
    })
  };
  
  Text.prototype.setupDOM = function(){
    // call parent function
    Text.parent.prototype.setupDOM.call(this);
    
    this.data('type', 'text');
    
    this.text = new metaScore.Dom('<div/>', {'class': 'text'})
      .appendTo(this.contents);
  };
  
  Text.prototype.setEditable = function(editable){
    this.text.attr('contenteditable', editable ? 'true' : 'null');
  };
    
  return Text;
  
})();