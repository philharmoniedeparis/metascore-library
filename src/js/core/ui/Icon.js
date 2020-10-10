import Dom from '../Dom';

import {className} from '../../../css/core/ui/Icon.scss';

/**
 * A simple button based on an HTML button element
 */
export default class Icon extends Dom {

    static defaults = {
        'symbol': null
    };

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
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        if(this.configs.symbol){
            this.setSymbol(this.configs.symbol);
        }
    }

    /**
     * Set the SVG symbol
     *
     * @param {Object} symbol An object describing the symbol
     * @property {String} id The symbol's id
     * @property {String} viewBox The symbol'S viewBox
     * @return {Object} The default values
     */
    setSymbol(symbol){
        this.attr('viewBox', symbol.viewBox);
        this.child('use').attr('xlink:href', `#${symbol.id}`, 'http://www.w3.org/1999/xlink');
    }

}
