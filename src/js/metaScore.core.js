/**
* The code class
* Implements global helper methods
* @class metaScore
*/

metaScore = global.metaScore = {

  /**
   * Returns the current version identifier
   * @method getVersion
   * @return {String} The version identifier
   */
  getVersion: function(){
    return "[[VERSION]]";
  },

  /**
   * Returns the current revision identifier
   * @method getRevision
   * @return {String} The revision identifier
   */
  getRevision: function(){
    return "[[REVISION]]";
  },

  /**
   * Extends the metaScore namespace
   * @method namespace
   * @param {String} The namespace to add
   * @return {Object} The extended namespace
   */
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