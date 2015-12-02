/**
* Description
*
* @class player.component.element.Image
* @extends player.component.Element
*/

metaScore.namespace('player.component.element').Image = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function Image(configs) {
        // call parent constructor
        Image.parent.call(this, configs);
    }

    metaScore.player.component.Element.extend(Image);

    /**
     * Description
     * @method setupDOM
     * @return
     */
    Image.prototype.setupDOM = function(){
        // call parent function
        Image.parent.prototype.setupDOM.call(this);

        this.data('type', 'Image');
    };

    return Image;

})();