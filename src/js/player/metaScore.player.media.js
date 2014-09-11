/**
 * Media
 *
 * @requires metaScore.player.js
 * @requires ../metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Media = (function () {
  
  function Media(configs){  
    this.configs = this.getConfigs(configs);
  }

  Media.defaults = {
    'type': 'video',
    'sources': []
  };
  
  metaScore.Dom.extend(Media);

  Media.prototype.play = function() {

  };
  
  Media.prototype.pause = function() {

  };
  
  Media.prototype.stop = function() {

  };
  
  Media.prototype.setCurrentTime = function(time) {
  
  };
  
  Media.prototype.getCurrentTime = function() {
      
  };
    
  return Media;
  
})();