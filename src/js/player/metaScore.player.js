/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = metaScore.Base.extend(function(){

  var _componenets;

  this.constructor = function() {
  
    _componenets = {};
  
  };
  
  this.addComponenet = function(type, componenet){
  
    var id = componenet.attr('id');
  
    if(!_componenets.hasOwnProperty(type)){
      _componenets[type] = {};
    }
  
    _componenets[type][id] = componenet;
  
  };
  
  this.getComponenetById = function(type, id){
    
    if(_componenets.hasOwnProperty(type) && _componenets[type].hasOwnProperty(id)){
      return _componenets[type][id];
    }
    
    return undefined;
  
  };
  
  this.getComponenetByElement = function(type, element){
    
    return this.getComponenetById(type, metaScore.Dom.attr(element, 'id'));
  
  };
  
  this.getComponenetBySelector = function(type, selector){
  
    var componenet;
  
    if(_componenets.hasOwnProperty(type)){
      metaScore.Object.each(_componenets[type], function(key, value){
        if(value.is(selector)){
          componenet = value;
          return false;
        }
      }, this);
    }
    
    return componenet;
  
  };
  
});