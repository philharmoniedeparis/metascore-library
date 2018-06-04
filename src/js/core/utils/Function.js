import {_Var} from './Var';

/**
 * A class for function helper functions
 */
export default class Function {

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
    static proxy(fn, scope, args){
        if (!_Var.type(fn, 'function')){
            return undefined;
        }

        return constructor() {
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
    * Returns a throttled version of a function
    * The returned function will only call the original function at most once per the specified threshhold
    * @method throttle
    * @param {Function} fn The function to throttle
    * @param {Number} threshhold The threshhold in milliseconds
    * @param {Object} scope The scope in which the original function will be called
    * @return {Function} The throttled function
    */
    static throttle(fn, threshhold, scope){
        var lastFn, lastRan;

        return function() {
            var args = arguments;

            if (!lastRan) {
                fn.apply(scope, args);
                lastRan = Date.now();
            }
            else {
                clearTimeout(lastFn);

                lastFn = setTimeout(function(){
                    if((Date.now() - lastRan) >= threshhold){
                        fn.apply(scope, args);
                        lastRan = Date.now();
                    }
                }, threshhold - (Date.now() - lastRan));
            }
        };
    };

}