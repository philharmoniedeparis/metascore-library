/**
 * Cursor
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Cursor = (function () {

  function Cursor(configs) {  
    // call parent constructor
    Cursor.parent.call(this, configs);
    
    this.data('type', 'cursor');
    
    this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
      .appendTo(this.contents);
  }
  
  metaScore.player.Element.extend(Cursor);
    
  return Cursor;
  
})();