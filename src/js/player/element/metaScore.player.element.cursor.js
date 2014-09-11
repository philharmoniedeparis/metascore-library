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
    
    this.dom.data('type', 'cursor');
  }
  
  metaScore.player.Element.extend(Cursor);
    
  return Cursor;
  
})();