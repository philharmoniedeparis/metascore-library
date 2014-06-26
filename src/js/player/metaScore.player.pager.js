/**
 * Player Page
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Pager = metaScore.Dom.extend(function(){

  var count, buttons;

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'pager'});
    
    count = new metaScore.Dom('<div/>', {'class': 'count'})
      .appendTo(this);
    
    buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    buttons.first = new metaScore.Dom('<div/>', {'class': 'first'})
      .appendTo(buttons);
      
    buttons.previous = new metaScore.Dom('<div/>', {'class': 'previous'})
      .appendTo(buttons);
      
    buttons.next = new metaScore.Dom('<div/>', {'class': 'next'})
      .appendTo(buttons);
    
  };
  
});