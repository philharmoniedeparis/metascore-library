import {replaceAll} from './utils/String';
import Ajax from './Ajax';

let translations = {};

export default class Locale{

    static load(file, callback) {
        Ajax.GET(file, {
            'responseType': 'json',
            'onSuccess': (evt) => {
                translations = evt.target.getResponse();
                callback(null, translations);
            },
            'onError': (evt) => {
                callback(evt.target.getStatusText());
            }
        });
    }

    /**
     * Replace placeholders with sanitized values in a string
     *
     * @method formatString
     * @static
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
 * @method t
 * @static
 * @param {String} key The string identifier
 * @param {String} str The default string to use if no translation is found
 * @param {Object} args An object of replacements to make after translation
 * @return {String} The translated string
 */
    static t(key, str, args){
        let translated = str;

        if(translations.hasOwnProperty(key)){
            translated = translations[key];
        }

        return Locale.formatString(translated, args);
    }

}
