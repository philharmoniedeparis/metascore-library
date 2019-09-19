import {isObject} from './utils/Var';

/**
 * Stores the configs
 * @type {Object}
 */
const configs = {};

/**
 * A class to handle global app configs
 */
export default class Configs{

    /**
    * Set a key/value pair or a assign an object
    *
    * @param {Mixed} value The value to assign
    * @param {String} [key] The associated key, if undefined and the value is an object, Object.assign is used to copy the values to the configs
    */
    static set(value, key) {
        if(key === undefined && isObject(value)){
            Object.assign(configs, value);
        }
        else{
            configs[key] = value;
        }
    }

    /**
    * Check if specified key exists
    *
    * @param {String} key The key
    * @returns {Boolean} Whether the key exists
    */
    static has(key) {
        return key in configs;
    }

    /**
    * Get a value associated with a specified key
    *
    * @param {String} key The key
    * @returns {Mixed} The associated value, or null if it doesn't exist
    */
    static get(key) {
        return configs[key];
    }

    /**
    * Delete a value by key
    *
    * @param {String} key The key
    */
    static delete(key) {
        delete configs[key];
    }

}
