/**
 * Cursor
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Cursor = (function () {

  function Cursor(element) {  
    // call parent constructor
    Cursor.parent.call(this, element);
    
    this.data('type', 'cursor');    
  }
  
  metaScore.player.Element.extend(Cursor);
    
  return Cursor;
  
})();