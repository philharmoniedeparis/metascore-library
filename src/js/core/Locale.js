import {replaceAll} from './utils/String';

/**
 * Stores the string translations
 * @type {Object}
 */
const translations = 'metaScoreLocale' in window ? window.metaScoreLocale : {};

/**
 * A class to handle string translations
 */
export default class Locale{

    /**
     * Replace placeholders with sanitized values in a string
     *
     * @param {String} str The string to process
     * @param {Object} [args] An optional object of replacements with placeholders as keys
     * @return {String} The translated string
     */
    static formatString(str, args) {
        let formatted = str;

        if(args){
            Object.entries(args).forEach(([key]) => {
                formatted = replaceAll(formatted, key, args[key]);
            });
        }

        return formatted;
    }

    /**
     * Translate a string
     *
     * @param {String} key The string identifier
     * @param {String} str The default string to use if no translation is found
     * @param {Object} args An object of replacements to make after translation
     * @return {String} The translated string
     */
    static t(key, str, args){
        let translated = str;

        if(Object.prototype.hasOwnProperty.call(translations, key)){
            translated = window.metaScoreLocale[key];
        }

        return Locale.formatString(translated, args);
    }

}
