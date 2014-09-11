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
  }
  
  metaScore.player.Element.extend(Text);
    
  return Text;
  
})();