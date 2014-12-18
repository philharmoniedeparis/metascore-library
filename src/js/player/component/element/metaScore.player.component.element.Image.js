/**
 * Image
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.component.element').Image = (function () {

  function Image(configs) {
    // call parent constructor
    Image.parent.call(this, configs);   
  }
  
  metaScore.player.component.Element.extend(Image);
  
  Image.prototype.setupDOM = function(){
    // call parent function
    Image.parent.prototype.setupDOM.call(this);
    
    this.data('type', 'image');
  };
    
  return Image;
  
})();