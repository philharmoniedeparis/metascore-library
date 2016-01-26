/**
 * @module Core
 */

metaScore.Object = (function () {

    /**
     * A class for object helper functions
     * 
     * @class Object
     * @constructor
     */
    function Object() {
    }

    /**
     * Merge the contents of two or more objects together into the first object
     * 
     * @method extend
     * @static
     * @param {Object} [first] The object to which other objects are merged
     * @param {Object} [...others] The objects to merge with the first one
     * @return {Object} The first object
     */
    Object.extend = function() {
        var target = arguments[0] || {},
            options,
            i = 1,
            length = arguments.length,
            key, src, copy;

        for (; i < length; i++ ) {
            if ((options = arguments[i]) != null) {
                for ( key in options ) {
                    src = target[key];
                    copy = options[key];

                    if(src !== copy && copy !== undefined ) {
                        target[key] = copy;
                    }
                }
            }
        }

        return target;
    };

    /**
     * Return a copy of an object
     * 
     * @method copy
     * @static
     * @param {Object} obj The original object
     * @return {Object} The object copy
     */
    Object.copy = function(obj) {
        return Object.extend({}, obj);
    };

    /**
     * Iterate over an object
     * 
     * @method each
     * @static
     * @param {Object} obj The object to iterate over
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {String} callback.key The key of the current element being processed in the object
     * @param {Mixed} callback.value The element that is currently being processed in the object
     * @param {Mixed} scope The value to use as this when executing the callback
     * @return {Object} The object
     */
    Object.each = function(obj, callback, scope) {
        var key, value,
            scope_provided = scope !== undefined;

        for (key in obj) {
            value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);

            if (value === false) {
                break;
            }
        }

        return obj;
    };

    return Object;

})();