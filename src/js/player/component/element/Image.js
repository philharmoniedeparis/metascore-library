

export default class Image extends Element{

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
    constructor(configs) {
        // call parent constructor
        super(configs);
    }

    /**
     * Setup the image's UI
     * 
     * @method setupUI
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this.data('type', 'Image');
    };
    
}