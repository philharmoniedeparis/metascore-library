import Element from '../Element';

/**
 * An image element
 */
export default class Image extends Element{
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
    }

}
