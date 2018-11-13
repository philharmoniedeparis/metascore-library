import Dom from '../../Dom';
import Overlay from '../Overlay';

import {className} from '../../../../css/core/ui/overlay/iFrame.less';

/**
 * An iframe overlay
 */
export default class iFrame extends Overlay{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [url=null] The iframe's url
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`iframe ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbar': true,
            'url': null
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        // call parent method
        super.setupUI();

        /**
         * The <iframe> element
         * @type {Dom}
         */
        this.frame = new Dom('<iframe/>', {'src': this.configs.url})
            .appendTo(this.getContents());
    }

}
