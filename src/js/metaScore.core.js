/**
* The core object <br/>
* Implements global helper methods
*
* @class metaScore
* @static
*/

var metaScore = {

    /**
     * Returns the current version identifier
     *
     * @method getVersion
     * @static
     * @return {String} The version identifier
     */
    getVersion: function(){
        return "[[VERSION]]";
    },

    /**
     * Returns the current revision identifier
     *
     * @method getRevision
     * @static
     * @return {String} The revision identifier
     */
    getRevision: function(){
        return "[[REVISION]]";
    },

    /**
     * Extends the metaScore namespace
     *
     * @method namespace
     * @static
     * @param {String} The sub-namespace to create
     * @return {Object} The sub-namespace
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