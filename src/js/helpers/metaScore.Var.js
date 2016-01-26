/**
 * @module Core
 */

metaScore.Var = (function () {

    /**
     * A class for variable helper functions
     * 
     * @class Var
     * @constructor
     */
    function Var() {
    }

    /**
     * A list of variable type correspondances
     *
     * @property classes2types
     * @type {Object}
     * @static
     * @private
     */
    Var.classes2types = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regexp",
        "[object Object]": "object"
    };

    /**
     * Get the type of a variable
     * 
     * @method type
     * @static
     * @param {Mixed} obj The variable
     * @return {String} The type of the variable
     */
    Var.type = function(obj) {
        return obj == null ? String(obj) : Var.classes2types[ Object.prototype.toString.call(obj) ] || "object";
    };

    /**
     * Check if a variable is of a certain type
     * 
     * @method is
     * @static
     * @param {Mixed} obj The variable
     * @param {String} type The type to check for
     * @return {Boolean} Whether the variable is of the specified type
     */
    Var.is = function(obj, type) {
        return Var.type(obj) === type.toLowerCase();
    };

    /**
     * Check if a variable is empty
     * 
     * @method isEmpty
     * @static
     * @param {Mixed} obj The variable
     * @return {Boolean} Whether the variable is empty
     */
    Var.isEmpty = function(obj) {
        if(obj === undefined || obj == null){
            return true;
        }

        if(obj.hasOwnProperty('length')){
            return obj.length <= 0;
        }

        if(metaScore.Var.is(obj, 'object')){
            return Object.keys(obj).length <= 0;
        }

        return false;
    };

    return Var;

})();