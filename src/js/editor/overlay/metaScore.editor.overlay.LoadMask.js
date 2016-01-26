/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').LoadMask = (function () {

    /**
     * A loading mask
     *
     * @class LoadMask
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.draggable=false] Whether the mask is draggable
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
        'draggable': false,
        'text': metaScore.Locale.t('editor.overlay.LoadMask.text', 'Loading...')
    };

    metaScore.editor.Overlay.extend(LoadMask);

    return LoadMask;

})();