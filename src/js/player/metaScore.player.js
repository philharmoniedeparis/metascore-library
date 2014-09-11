/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = (function () {
  
  function Player(configs) {
    this.configs = this.getConfigs(configs);
    
    this.media = new metaScore.player.Media();    
  }
  
  Player.defaults = {
    keyboard: true
  };
  
  metaScore.Class.extend(Player);
    
  return Player;
  
})();