import EventEmitter from './EventEmitter';

/**
 * A class to handle clipboard data
 */
export default class Clipboard extends EventEmitter {

    /**
     * Instantiate
     */
    constructor() {
        // call parent constructor
        super();

        /**
         * The copied/cut data
         * @type {Object}
         */
        this.data = null;
    }

    /**
    * Set the stored data
    *
    * @method setData
    * @param {String} type The data type
    * @param {Mixed} data The data
    * @chainable
    */
    setData(type, data){
        this.data = {
          'type': type,
          'data': data
        };

        return this;
    }

    /**
    * Get the stored data
    *
    * @method getData
    * @return {Mixed} The data
    */
    getData() {
        return this.data ? this.data.data : null;
    }

    /**
    * Get the stored data type
    *
    * @method getData
    * @return {String} The data type
    */
    getDataType() {
        return this.data ? this.data.type : null;
    }

    /**
    * Clear the stored data
    *
    * @method clearData
    * @chainable
    */
    clearData() {
        this.data = null;

        return this;
    }

}
