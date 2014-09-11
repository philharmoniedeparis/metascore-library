/**
 * Image
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Image = (function () {

  function Image(element) {
    // call parent constructor
    Image.parent.call(this, element);
    
    this.data('type', 'image');    
  }
  
  metaScore.player.Element.extend(Image);
    
  return Image;
  
})();