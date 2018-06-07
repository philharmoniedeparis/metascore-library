/* global metaScoreLocale */

import {replaceAll} from './String';

/**
 * Replace placeholders with sanitized values in a string
 *
 * @method formatString
 * @static
 * @param {String} str The string to process
 * @param {Object} args An object of replacements with placeholders as keys
 * @return {String} The translated string
 */
export function formatString(str, args) {
    Object.entries(args).forEach(([key, value]) => {
        str = replaceAll(str, key, value);
    });

    return str;
}

/**
 * Translate a string
 *
 * @method t
 * @static
 * @param {String} key The string identifier
 * @param {String} str The default string to use if no translation is found
 * @param {Object} args An object of replacements to make after translation
 * @return {String} The translated string
 */
export function t(key, str, args){
    if(typeof(metaScoreLocale) !== "undefined" && metaScoreLocale.hasOwnProperty(key)){
        str = metaScoreLocale[key];
    }

    return formatString(str, args);
}
