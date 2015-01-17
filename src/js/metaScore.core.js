/**
* Core
*/
metaScore = global.metaScore = {

  getVersion: function(){
    return "[[VERSION]]";
  },

  getRevision: function(){
    return "[[REVISION]]";
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