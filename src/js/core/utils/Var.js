/**
 * Check if a variable is an array
 * @param {Mixed} value The variable
 * @return {Boolean} Whether the variable is an array
 */
export function isArray(value){
    return Array.isArray(value);
}

/**
 * Check if a variable is a string
 * @param {Mixed} value The variable
 * @return {Boolean} Whether the variable is a string
 */
export function isString(value){
    return (value !== null) && ((typeof value === 'string') || (value instanceof String));
}

/**
 * Check if a variable is a number
 * @param {Mixed} value The variable
 * @return {Boolean} Whether the variable is a number
 */
export function isNumber(value){
    return (value !== null) && ((typeof value === 'number') || (value instanceof Number));
}

/**
 * Check if a variable represents a numeric value
 * @param {Mixed} value The variable
 * @return {Boolean} Whether the variable represents a numeric value
 */
export function isNumeric(value){
    return !isArray(value) && ((value - parseFloat(value) + 1) >= 0);
}

/**
 * Check if a variable is a function
 * @param {Mixed} value The variable
 * @return {Boolean} Whether the variable is a function
 */
export function isFunction(value){
    return (value !== null) && ((typeof value === 'function') || (value instanceof Function));
}

/**
 * Check if a variable is an object
 * @param {Mixed} value The variable
 * @return {Boolean} Whether the variable is an object
 */
export function isObject(value){
    return (value !== null) && ((typeof value === 'object') || (value instanceof Object));
}

/**
 * Check if a variable is empty
 *
 * @param {Mixed} value The variable
 * @return {Boolean} Whether the variable is empty
 */
export function isEmpty(value) {
    if((typeof value === 'undefined') || (value === null)){
        return true;
    }

    if(length in value){
        return value.length === 0;
    }

    if(isObject(value)){
        return Object.keys(value).length === 0;
    }

    return false;
}
