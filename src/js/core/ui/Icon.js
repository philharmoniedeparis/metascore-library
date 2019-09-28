import Dom from '../Dom';

import {className} from '../../../css/core/ui/Icon.scss';

/**
 * A simple button based on an HTML button element
 */
export default class Icon extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} symbol The symbol of the icon to use
     */
    constructor(configs) {
        // call the super constructor.
        super('<svg><use></use><svg>', {'class': `${className} icon`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        if(this.configs.symbol){
            this.setSymbol(this.configs.symbol);
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'symbol': null
        };
    }

    setSymbol(symbol){
        this.child('use').attr('xlink:href', `#${symbol}`, 'http://www.w3.org/1999/xlink');
    }

}
