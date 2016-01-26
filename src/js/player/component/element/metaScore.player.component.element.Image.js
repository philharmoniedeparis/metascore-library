/**
 * @module Player
 */

metaScore.namespace('player.component.element').Image = (function () {

    /**
     * An image element
     *
     * @class Cursor
     * @namespace player.component.element
     * @extends player.component.Element
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Image(configs) {
        // call parent constructor
        Image.parent.call(this, configs);
    }

    metaScore.player.component.Element.extend(Image);

    /**
     * Setup the image's UI
     * 
     * @method setupUI
     * @private
     */
    Image.prototype.setupUI = function(){
        // call parent function
        Image.parent.prototype.setupUI.call(this);

        this.data('type', 'Image');
    };

    return Image;

})();