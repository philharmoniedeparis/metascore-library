/**
* Description
* @class Function
* @extends Class
*/

metaScore.Function = (function () {

    /**
     * Description
     * @constructor
     */
    function Function() {
    }

    metaScore.Class.extend(Function);

    /**
     * Checks if a variable is of a certain type
     * @method proxy
     * @param {} fn
     * @param {} scope
     * @param {} args
     * @return FunctionExpression
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

    /**
     * A reusable empty function
     * @method emptyFn
     * @return
     */
    Function.emptyFn = function(){};

    return Function;

})();