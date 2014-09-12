/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Text = (function () {

  function Text(configs) {  
    // call parent constructor
    Text.parent.call(this, configs);
    
    this.dom.data('type', 'text');
    
    this.text = new metaScore.Dom('<div/>', {'class': 'text'})
      .appendTo(this.contents);
  }
  
  metaScore.player.Element.extend(Text);
  
  Text.prototype.setEditable = function(editable){
    this.text.attr('contenteditable', editable ? 'true' : 'null');
  };
    
  return Text;
  
})();