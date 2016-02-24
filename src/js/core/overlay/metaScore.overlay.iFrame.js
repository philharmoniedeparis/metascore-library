/**
 * @module Core
 */

metaScore.namespace('overlay').iFrame = (function () {


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
    function iFrame(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        iFrame.parent.call(this, this.configs);

        this.addClass('iframe');
    }

    iFrame.defaults = {
        'toolbar': true,
        'url': null
    };

    metaScore.Overlay.extend(iFrame);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    iFrame.prototype.setupUI = function(){
        // call parent method
        iFrame.parent.prototype.setupUI.call(this);

        this.frame = new metaScore.Dom('<iframe/>', {'src': this.configs.url})
            .appendTo(this.contents);
    };

    return iFrame;

})();