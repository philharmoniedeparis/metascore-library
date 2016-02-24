/**
 * @module Core
 */

metaScore.Clipboard = (function(){

    /**
     * A class to handle clipboard data
     *
     * @class Clipboard
     * @extends Evented
     * @constructor
     */
    function Clipboard() {
        // call parent constructor
        Clipboard.parent.call(this);

        this.data = null;
    }

    metaScore.Evented.extend(Clipboard);

    /**
    * Set the stored data
    *
    * @method setData
    * @param {String} type The data type
    * @param {Mixed} data The data
    * @chainable
    */
    Clipboard.prototype.setData = function(type, data){
        this.data = {
          'type': type,
          'data': data
        };

        return this;
    };

    /**
    * Get the stored data
    *
    * @method getData
    * @return {Mixed} The data
    */
    Clipboard.prototype.getData = function(){
        return this.data ? this.data.data : null;
    };

    /**
    * Get the stored data type
    *
    * @method getData
    * @return {String} The data type
    */
    Clipboard.prototype.getDataType = function(){
        return this.data ? this.data.type : null;
    };

    /**
    * Clear the stored data
    *
    * @method clearData
    * @chainable
    */
    Clipboard.prototype.clearData = function(){  
        this.data = null;

        return this;
    };

    return Clipboard;

})();