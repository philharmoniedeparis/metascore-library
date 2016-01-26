/**
 * @module Core
 */

metaScore.Function = (function () {

    /**
     * A class for function helper functions
     * 
     * @class Function
     * @constructor
     */
    function Function() {
    }

    /**
     * Create a proxy of a function
     * 
     * @method proxy
     * @static
     * @param {Function} fn The function to proxy
     * @param {Mixed} scope The value to use as this when executing the proxy function
     * @param {Array} args Extra arguments to preppend to the passed arguments when the proxy function is called
     * @return {Function} The proxy function
     */
    Function.proxy = function(fn, scope, args){
        if (!metaScore.Var.type(fn, 'function')){
            return undefined;
        }

        return function () {
            var args_array;

            if(args){
                args_array = Array.prototype.slice.call(args); // transform args to a true array
                args_array = args_array.concat(Array.prototype.slice.call(arguments)); // concat passed arguments to the args_array
            }
            else{
                args_array = arguments;
            }

            return fn.apply(scope || this, args_array);
        };
    };

    return Function;

})();