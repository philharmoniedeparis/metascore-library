import {naturalCompare} from './String';

/**
 * A natural case-insentive sorting function to use with Array.sort
 *
 * @method naturalSortInsensitive
 * @static
 * @param {String} a The first string to compare
 * @param {String} b The second string to compare
 * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
export function naturalSortInsensitive(){
    return (a, b) => {
        return naturalCompare(a, b, true);
    }
}


/**
 * A natural case-sentive sorting function to use with Array.sort
 *
 * @method naturalSortSensitive
 * @static
 * @param {String} a The first string to compare
 * @param {String} b The second string to compare
 * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
export function naturalSortSensitive(){
    return (a, b) => {
        return naturalCompare(a, b, false);
    }
}
