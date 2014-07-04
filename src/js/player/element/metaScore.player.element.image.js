/**
 * Image
 *
 * @requires ../metaScore.player.element.js
 */
metaScore.Player.Element.Image = metaScore.Player.Element.extend(function(){

  this.constructor = function(element) {
  
    this.super(element);
    
    this.data('type', 'image');
    
  };
});