/**
* Core
*/
metaScore = global.metaScore = {

  version: "[[VERSION]]",
  
  revision: "[[REVISION]]",
  
  getVersion: function(){
    return this.version;
  },
  
  getRevision: function(){
    return this.revision;
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