import { isArray as _isArray } from "lodash";
import { isString as _isString } from "lodash";
import { isNumber as _isNumber } from "lodash";
import { isFunction as _isFunction } from "lodash";
import { isObject as _isObject } from "lodash";
import { isEqual as _isEqual } from "lodash";
import { isNil as _isNil } from "lodash";
import { isArrayLike as _isArrayLike } from "lodash";
import { isEmpty as _isEmpty } from "lodash";
import { cloneDeep as _clone } from "lodash";

/**
 * Check if a variable is an array
 *
 * @param {*} value The variable
 * @returns {boolean} Whether the variable is an array
 */
export function isArray(value) {
  return _isArray(value);
}

/**
 * Check if a variable is a string
 *
 * @param {*} value The variable
 * @returns {boolean} Whether the variable is a string
 */
export function isString(value) {
  return _isString(value);
}

/**
 * Check if a variable is a number
 *
 * @param {*} value The variable
 * @returns {boolean} Whether the variable is a number
 */
export function isNumber(value) {
  return _isNumber(value);
}

/**
 * Check if a variable represents a numeric value
 *
 * @param {*} value The variable
 * @returns {boolean} Whether the variable represents a numeric value
 */
export function isNumeric(value) {
  return !isArray(value) && value - parseFloat(value) + 1 >= 0;
}

/**
 * Check if a variable is a function
 *
 * @param {*} value The variable
 * @returns {boolean} Whether the variable is a function
 */
export function isFunction(value) {
  return _isFunction(value);
}

/**
 * Check if a variable is an object
 *
 * @param {*} value The variable
 * @returns {boolean} Whether the variable is an object
 */
export function isObject(value) {
  return _isObject(value);
}

/**
 * Check if two values are equal by performing a deep comparison
 *
 * @param {*} value1 The first value
 * @param {*} value2 The second value
 * @returns {boolean} Whether the values are equal
 */
export function isEqual(value1, value2) {
  return _isEqual(value1, value2);
}

/**
 * Check if a variable is empty
 *
 * @param {*} value The variable
 * @returns {boolean} Whether the variable is empty
 */
export function isEmpty(value) {
  if (_isNil(value)) {
    return true;
  }

  if (_isArrayLike(value) || isObject(value)) {
    return _isEmpty(value);
  }

  return false;
}

/**
 * Deep clone a variable.
 *
 * @param {*} value The value to clone
 * @returns {*} The new value
 */
export function clone(value) {
  return _clone(value);
}
