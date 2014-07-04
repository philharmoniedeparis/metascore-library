/**
 * Player Page
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Pager = metaScore.Dom.extend(function(){

  var _count, _buttons;

  this.constructor = function(dom) {
  
    if(dom){
      this.super(dom);      
      _count = this.child('.count');      
      _buttons = this.child('.buttons');        
      _buttons.first = _buttons.child('[data-action="first"]');
      _buttons.previous = _buttons.child('[data-action="previous"]');
      _buttons.next = _buttons.child('[data-action="next"]');
    }
    else{
      this.super('<div/>', {'class': 'pager'});
      _count = new metaScore.Dom('<div/>', {'class': 'count'}).appendTo(this);      
      _buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
        .addListener('mousedown', function(evt){
          evt.stopPropagation();
        })
        .appendTo(this);        
      _buttons.first = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'first'}).appendTo(_buttons);      
      _buttons.previous = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'previous'}).appendTo(_buttons);      
      _buttons.next = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'next'}).appendTo(_buttons);
    }
    
  };
  
  this.updateCount = function(index, count){
  
    _count.text(metaScore.String.t('page !current/!count', {'!current': (index + 1), '!count': count}));
    
    _buttons.first.toggleClass('inactive', index === 0);
    _buttons.previous.toggleClass('inactive', index === 0);
    _buttons.next.toggleClass('inactive', index >= count - 1);
  
  };
  
});