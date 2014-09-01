/**
 * Media
 *
 * @requires metaScore.player.js
 * @requires ../metaScore.dom.js
 */
metaScore.Player.Media = metaScore.Dom.extend(function(){

  this.defaults = {
    'type': 'video',
    'sources': []
  };
  
  this.constructor = function(configs) {
  
    console.log(this.super);
  
    this.initConfig(configs);
  
    console.log(this.super);
    
  };

  this.play = function() {

  };
  
  this.pause = function() {

  };
  
  this.stop = function() {

  };
  
  this.setCurrentTime = function(time) {
  
  };
  
  this.getCurrentTime = function() {
      
  };

});