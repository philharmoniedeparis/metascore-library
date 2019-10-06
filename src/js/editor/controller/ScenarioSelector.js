import Dom from '../../core/Dom';

import {className} from '../../../css/editor/controller/ScenarioSelector.scss';

/**
 * A scenario selector
 */
export default class ScenarioSelector extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `scenario-selector ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
        };
    }

}
