/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Text = (function () {

  function Text(element) {  
    // call parent constructor
    Text.parent.call(this, element);
    
    this.data('type', 'text');    
  }
  
  metaScore.player.Element.extend(Text);
    
  return Text;
  
})();