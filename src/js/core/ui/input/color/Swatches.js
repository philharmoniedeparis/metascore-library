import Dom from '../../../Dom';

import {className} from '../../../../../css/core/ui/input/color/Swatches.scss';

/**
 * A color swatch selector
 */
export default class Swatches extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value=#fff}] The default value (see {@link toRGBA} for valid values)
     */
    constructor(configs) {
        // call the super constructor.
        super('<div/>', {'class': `swatches ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.setupUI();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'colors': [
                '#FFFFFF',
                '#000000'
            ]
        };
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        this.configs.colors.forEach((color) => {
            new Dom('<button/>', {'class': 'swatch', 'type': 'button'})
                .css('background-color', color)
                .data('value', color)
                .addListener('click', this.onSwatchClick.bind(this))
                .appendTo(this);
        });
    }

    /**
     * Swatch click event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onSwatchClick(evt){
        const color = new Dom(evt.target).data('value');
        this.triggerEvent('swatchclick', {'swatches': this, 'value': color});
    }

}
