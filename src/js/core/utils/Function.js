/**
* Returns a throttled version of a function
* The returned function will only call the original function at most once per the specified threshhold
* @method throttle
* @param {Function} fn The function to throttle
* @param {Number} threshhold The threshhold in milliseconds
* @param {Object} scope The scope in which the original function will be called
* @return {Function} The throttled function
*/
export function throttle(fn, threshhold, scope) {
    let timeout = null;
    let last_ran = null;

    return function (...args) {
        if (!last_ran) {
            fn.apply(scope, args);
            last_ran = Date.now();
        }
        else {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                if ((Date.now() - last_ran) >= threshhold) {
                    fn.apply(scope, args);
                    last_ran = Date.now();
                }
            }, threshhold - (Date.now() - last_ran));
        }
    }
}
