/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = metaScore.Base.extend(function(){
  
  var _blocks,
    _media,
    _cuepoints;
  
  this.defaults = {
    keyboard: true
  };
  
  this.constructor = function(configs) {
  
    this.initConfig(configs);
    
    _media = new metaScore.Player.Media();
    
  };
  
});