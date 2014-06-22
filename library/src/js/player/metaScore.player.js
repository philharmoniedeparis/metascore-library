/*global global console*/

/**
* Player
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Player = metaScore.Dom.extend({
    init: function(selector) {
    
      this.callSuper('<div/>', {'class': 'metaScore-player'});
      
      if(selector !== undefined){
        this.appendTo(selector);
      }
      
    }
  });
  
}(global));