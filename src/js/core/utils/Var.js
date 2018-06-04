/**
 * A list of variable type correspondances
 *
 * @property classes2types
 * @type {Object}
 * @static
 * @private
 */
var classes2types = {
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
 * A class for variable helper functions
 */
export default class Var {

    /**
     * Get the type of a variable
     * 
     * @method type
     * @static
     * @param {Mixed} obj The variable
     * @return {String} The type of the variable
     */
    static type(obj) {
        return obj == null ? String(obj) : classes2types[ Object.prototype.toString.call(obj) ] || "object";
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
    static is(obj, type) {
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
    static isEmpty(obj) {
        if(obj === undefined || obj == null){
            return true;
        }

        if(obj.hasOwnProperty('length')){
            return obj.length <= 0;
        }

        if(Var.is(obj, 'object')){
            return Object.keys(obj).length <= 0;
        }

        return false;
    };

}