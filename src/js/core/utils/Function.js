/**
* Returns a throttled version of a function
* The returned function will only call the original function at most once per the specified threshhold
* @method throttle
* @param {Function} fn The function to throttle
* @param {Number} threshhold The threshhold in milliseconds
* @param {Object} scope The scope in which the original function will be called
* @return {Function} The throttled function
*/
export function throttle(fn, threshhold, scope){
	let lastFn, lastRan;

	return () => {
		const args = arguments;

		if (!lastRan) {
			fn.apply(scope, args);
			lastRan = Date.now();
		}
		else {
			clearTimeout(lastFn);

			lastFn = setTimeout(() => {
				if((Date.now() - lastRan) >= threshhold){
					fn.apply(scope, args);
					lastRan = Date.now();
				}
			}, threshhold - (Date.now() - lastRan));
		}
	};
}
