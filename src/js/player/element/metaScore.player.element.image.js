/**
 * Image
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Image = (function () {

  function Image(configs) {
    // call parent constructor
    Image.parent.call(this, configs);
    
    this.dom.data('type', 'image');    
  }
  
  metaScore.player.Element.extend(Image);
    
  return Image;
  
})();