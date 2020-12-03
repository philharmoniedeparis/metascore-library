/**
 * Create an object with some properties of another object.
 *
 * @param {Object} source The source object
 * @param {Array} properties The list of properties to copy
 * @return {Object} The new object
 */
export function pick(source, properties){
    const obj = {};

    Object.entries(source).forEach(([key, value]) => {
        if (properties.includes(key)) {
            obj[key] = value;
        }
    });

    return obj;
}

/**
 * Create an object from another object omitting some properties.
 *
 * @param {Object} source The source object
 * @param {Array} properties The list of properties to omit
 * @return {Object} The new object
 */
export function omit(source, properties){
    const obj = Object.assign(source);

    properties.forEach((key) => {
        delete obj[key];
    });

    return obj;
}