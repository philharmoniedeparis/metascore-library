/**
* Player
*/
metaScore.Player = metaScore.Dom.extend(function(){
  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-player'});
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
  };
});