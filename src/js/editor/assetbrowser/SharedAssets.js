import Dom from '../../core/Dom';

import {className} from '../../../css/editor/assetbrowser/SharedAssets.scss';

/**
 * An asset browser class
 */
export default class AssetBrowser extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} list_url The shared assets list url
     * @property {Object} [xhr={}] Options to send with each XHR request. See {@link Ajax.send} for available options
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `shared-assets ${className}`});

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
    static getDefaults() {
        return {
            'list_url': null,
            'xhr': {}
        };
    }

}
