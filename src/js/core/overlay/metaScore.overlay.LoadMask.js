/**
 * @module Core
 */

metaScore.namespace('overlay').LoadMask = (function () {

    /**
     * A loading mask
     *
     * @class LoadMask
     * @namespace overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.text='Loading...'] The text to display
     */
    function LoadMask(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        LoadMask.parent.call(this, this.configs);

        this.addClass('loadmask');

        this.text = new metaScore.Dom('<div/>', {'class': 'text', 'text': this.configs.text})
            .appendTo(this.contents);
    }

    LoadMask.defaults = {
        'text': metaScore.Locale.t('overlay.LoadMask.text', 'Loading...')
    };

    metaScore.Overlay.extend(LoadMask);

    return LoadMask;

})();