import {Dom} from '../Dom';
import {Overlay} from '../Overlay';

export default class iFrame extends Overlay{


    /**
     * An iframe overlay
     *
     * @class iFrame
     * @namespace overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.url=null] The iframe's url
     */
    constructor(configs) {
        // call parent constructor
        super(this.configs);

        this.addClass('iframe');
    }

    static getDefaults(){
        return {
            'toolbar': true,
            'url': null
        };
    }

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        // call parent method
        super.setupUI();

        this.frame = new Dom('<iframe/>', {'src': this.configs.url})
            .appendTo(this.contents);
    };

}