import Dom from '../../../Dom';
import SliderInput from '../SliderInput';

import {className} from '../../../../../css/core/ui/input/color/Picker.scss';

/**
 * A color picker
 */
export default class Picker extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value={r:255, g:255, b:255, a:1}}] The default value (see {@link toRGBA} for valid values)
     */
    constructor(configs) {
        // call the super constructor.
        super('<div/>', {'class': `picker ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.hue = 0;
        this.opacity = 0;

        this.setupUI();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {};
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        this.palette = new Dom('<div/>', {'class': 'palette'})
            .appendTo(inner);

        this.palette_thumb = new Dom('<div/>', {'class': 'thumb'})
            .appendTo(this.palette);

        this.hue_slider = new SliderInput({
                'min': 0,
                'max': 360,
                'triggerChangeOnDrag': true
            })
            .addListener('valuechange', this.onHueValueChange.bind(this))
            .data('action', 'hue')
            .appendTo(inner);

        this.hue_thumb = new Dom('<div/>', {'class': 'thumb'})
            .appendTo(this.hue_slider);

        this.opacity_slider = new SliderInput({
                'min': 0,
                'max': 100,
                'triggerChangeOnDrag': true
            })
            .addListener('valuechange', this.onOpacitValueChange.bind(this))
            .data('action', 'opacity')
            .appendTo(inner);

        this.opacity_thumb = new Dom('<div/>', {'class': 'thumb'})
            .appendTo(this.opacity_slider);

        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(inner);

        this.updateUI();
    }

    onHueValueChange(evt){
        this.hue = parseInt(evt.detail.value, 10);
        this.updateUI();
    }

    onOpacitValueChange(evt){
        this.opacity = parseInt(evt.detail.value, 10) / 100;
        this.updateUI();
    }

    updateUI(){
        this.hue_thumb
            .css('background-color', `hsl(${this.hue},100%,50%)`)
            .css('left', `${this.hue/360*100}%`);

        this.opacity_thumb
            .css('background-color', `rgba(0, 0, 0, ${this.opacity})`)
            .css('left', `${this.opacity*100}%`);

        this.palette.css('background', `linear-gradient(to top, hsl(360, 100%, 0%), transparent) repeat scroll 0% 0%, hsla(360, 100%, 0%, 0) linear-gradient(to left, hsl(${this.hue},100%,50%), hsl(360, 100%, 100%)) repeat scroll 0% 0%`);
    }

}
