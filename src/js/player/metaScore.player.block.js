/**
 * Player Block
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Block = metaScore.Dom.extend(function(){
  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'block'});
    
  };
});