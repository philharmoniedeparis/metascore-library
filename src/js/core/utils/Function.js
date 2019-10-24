/**
* Returns a throttled version of a function
* The returned function will only call the original function at most once per the specified threshhold
* @method throttle
* @param {Function} fn The function to throttle
* @param {Number} threshhold The threshhold in milliseconds
* @param {Object} scope The scope in which the original function will be called
* @return {Function} The throttled function
*/
export function throttle(fn, threshhold, scope = null)
{
    let inThrottle;

    return function() {
        const args = arguments;

        if(!inThrottle){
            fn.apply(scope, args);
            inThrottle = true;
            setTimeout(() => {inThrottle = false}, threshhold);
        }
    }
}
