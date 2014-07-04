/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Element = metaScore.Dom.extend(function(){

  this.constructor = function(dom) {
  
    if(dom){
      this.super(dom);
    }
    else{
      this.super('<div/>', {'class': 'element'});
    }
    
  };
});