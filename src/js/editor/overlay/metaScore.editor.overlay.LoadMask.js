/**
* Description
* @class editor.overlay.LoadMask
* @extends editor.Overlay
*/

metaScore.namespace('editor.overlay').LoadMask = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
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
        /**
        * True to make this draggable
        */
        'draggable': false,

        'text': metaScore.Locale.t('editor.overlay.LoadMask.text', 'Loading...')
    };

    metaScore.editor.Overlay.extend(LoadMask);

    return LoadMask;

})();