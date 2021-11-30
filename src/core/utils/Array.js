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
