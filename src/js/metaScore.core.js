/**
* Core
*/
var metaScore = {

  version: "[[VERSION]]",
  
  getVersion: function(){
    return this.version;
  },
  
  namespace: function(str){  
    var parent = this,
      parts = str.split('.'),
      part;
        
    for(var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      parent[part] = parent[part] || {};
      parent = parent[part];
    }
    
    return parent;
  }
  
};