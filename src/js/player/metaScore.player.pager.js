/**
 * Player Page
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Pager = metaScore.Dom.extend(function(){

  var _count, _buttons;

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'pager'});
    
    _count = new metaScore.Dom('<div/>', {'class': 'count'})
      .appendTo(this);
    
    _buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    _buttons.first = new metaScore.Dom('<div/>', {'class': 'first'})
      .appendTo(_buttons);
      
    _buttons.previous = new metaScore.Dom('<div/>', {'class': 'previous'})
      .appendTo(_buttons);
      
    _buttons.next = new metaScore.Dom('<div/>', {'class': 'next'})
      .appendTo(_buttons);
    
  };
  
  this.updateCount = function(index, total){
  
    _count.text(metaScore.String.t('page !current/!total', {'!current': index + 1, '!total': total}));
    
    _buttons.first.toggleClass('inactive', index === 0);
    _buttons.previous.toggleClass('inactive', index === 0);
    _buttons.next.toggleClass('inactive', index >= total - 1);
  
  };
  
});