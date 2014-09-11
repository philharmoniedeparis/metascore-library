/**
 * Player Page
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Pager = (function () {

  function Pager(dom) {
    if(dom){
      // call parent constructor
      Pager.parent.call(this, dom);
      
      this.count = this.child('.count');      
      this.buttons = this.child('.buttons');        
      this.buttons.first = this.buttons.child('[data-action="first"]');
      this.buttons.previous = this.buttons.child('[data-action="previous"]');
      this.buttons.next = this.buttons.child('[data-action="next"]');
    }
    else{
      // call parent constructor
      Pager.parent.call(this, '<div/>', {'class': 'pager'});
      
      this.count = new metaScore.Dom('<div/>', {'class': 'count'}).appendTo(this);      
      this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
        .addListener('mousedown', function(evt){
          evt.stopPropagation();
        })
        .appendTo(this);        
      this.buttons.first = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'first'}).appendTo(this.buttons);      
      this.buttons.previous = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'previous'}).appendTo(this.buttons);      
      this.buttons.next = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'next'}).appendTo(this.buttons);
    }    
  }
  
  metaScore.Dom.extend(Pager);
  
  Pager.prototype.updateCount = function(index, count){
  
    this.count.text(metaScore.String.t('page !current/!count', {'!current': (index + 1), '!count': count}));
    
    this.buttons.first.toggleClass('inactive', index === 0);
    this.buttons.previous.toggleClass('inactive', index === 0);
    this.buttons.next.toggleClass('inactive', index >= count - 1);
  
  };
    
  return Pager;
  
})();