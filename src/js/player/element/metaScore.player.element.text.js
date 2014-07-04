/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
metaScore.Player.Element.Text = metaScore.Player.Element.extend(function(){

  this.constructor = function(element) {
  
    this.super(element);
    
    this.data('type', 'text');
    
  };
});