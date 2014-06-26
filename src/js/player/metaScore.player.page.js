/**
 * Player Page
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Page = metaScore.Dom.extend(function(){
  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'page'});
    
  };
});