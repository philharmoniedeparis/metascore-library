import { naturalCompare } from "./String";

/**
 * A natural case-insentive sorting function to use with Array.sort
 *
 * @returns {Function} The sorting function
 */
export function naturalSortInsensitive() {
  return (a, b) => {
    return naturalCompare(a, b, true);
  };
}

/**
 * A natural case-sentive sorting function to use with Array.sort
 *
 * @returns {Function} The sorting function
 */
export function naturalSortSensitive() {
  return (a, b) => {
    return naturalCompare(a, b, false);
  };
}

/**
 * Clone an array.
 *
 * @param {Array} array The array to clone
 * @returns {Array} The new array
 */
export function clone(array) {
  return [...array];
}

/**
 * Get unique array values
 *
 * @param {Array} array The original array
 * @returns {Array} The array of unique values
 */
export function unique(array) {
  return array.filter((el, index, arr) => {
    return arr.indexOf(el) === index;
  });
}
