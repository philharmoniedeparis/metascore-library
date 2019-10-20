import Dom from '../../../Dom';
import Button from '../../Button';
import {toRGBA, rgb2hsv, hsv2rgb} from '../../../utils/Color';

import {className} from '../../../../../css/core/ui/input/color/Picker.scss';

/**
 * A color picker
 * Highly inspired by https://github.com/Simonwep/pickr
 */
export default class Picker extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value=#fff}] The default value (see {@link toRGBA} for valid values)
     */
    constructor(configs) {
        // call the super constructor.
        super('<div/>', {'class': `picker ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // fix event handlers scope
        this.onPaletteInputMouseMove = this.onPaletteInputMouseMove.bind(this);
        this.onPaletteInputMouseUp = this.onPaletteInputMouseUp.bind(this);
        this.onHueInputMouseMove = this.onHueInputMouseMove.bind(this);
        this.onHueInputMouseUp = this.onHueInputMouseUp.bind(this);
        this.onOpacityInputMouseMove = this.onOpacityInputMouseMove.bind(this);
        this.onOpacityInputMouseUp = this.onOpacityInputMouseUp.bind(this);

        this.rgb = {'r': 0, 'g': 0, 'b': 0};
        this.hsv = {'h': 0, 's': 0, 'v': 0};
        this.opacity = 1;

        this.setupUI();

        this.setValue(this.configs.value);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'value': '#fff'
        };
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        this.palette_input = new Dom('<div/>', {'class': 'draggable-input palette'})
            .addListener('mousedown', this.onPaletteInputMouseDown.bind(this))
            .appendTo(inner);

        this.palette_thumb = new Dom('<div/>', {'class': 'thumb'})
            .appendTo(this.palette_input);

        this.hue_input = new Dom('<div/>', {'class': 'draggable-input hue'})
            .addListener('mousedown', this.onHueInputMouseDown.bind(this))
            .appendTo(inner);

        this.hue_thumb = new Dom('<div/>', {'class': 'thumb'})
            .appendTo(this.hue_input);

        this.opacity_input = new Dom('<div/>', {'class': 'draggable-input opacity'})
            .addListener('mousedown', this.onOpacityInputMouseDown.bind(this))
            .appendTo(inner);

        this.opacity_thumb = new Dom('<div/>', {'class': 'thumb'})
            .appendTo(this.opacity_input);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(inner);

        new Button({'label': 'Save'})
            .data('action', 'save')
            .addListener('click', this.onSaveClick.bind(this))
            .appendTo(buttons);

        new Button({'label': 'Reset'})
            .data('action', 'reset')
            .addListener('click', this.onResetClick.bind(this))
            .appendTo(buttons);

        new Button({'label': 'Cancel'})
            .data('action', 'cancel')
            .addListener('click', this.onCancelClick.bind(this))
            .appendTo(buttons);
    }

    setValue(color){
        if(color === null){
            this.rgb = {'r': 0, 'g': 0, 'b': 0};
            this.opacity = 1;
        }
        else{
            const rgba = toRGBA(color);

            this.rgb.r = rgba.r;
            this.rgb.g = rgba.g;
            this.rgb.b = rgba.b;

            this.opacity = rgba.a;
        }

        this.hsv = rgb2hsv(this.rgb.r, this.rgb.g, this.rgb.b);

        this.updateUI();

        return this;
    }

    getRGB(){
        return Object.assign({}, this.rgb);
    }

    getRGBA(){
        return Object.assign(this.getRGB(), {'a': this.opacity});
    }

    getHSV(){
        return Object.assign({}, this.hsv);
    }

    getHSVA(){
        return Object.assign(this.getHSV(), {'a': this.opacity});
    }

    getOpacity(){
        return this.opacity;
    }

    /**
     * The mousedown event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPaletteInputMouseDown(evt){
        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.get(0)));
        }

        this.doc
            .addListener('mousemove', this.onPaletteInputMouseMove)
            .addListener('mouseup', this.onPaletteInputMouseUp);

        this._palette_rect = this.palette_input.get(0).getBoundingClientRect();

        this.onPaletteInputMouseMove(evt);
    }

    onPaletteInputMouseMove(evt){
        const x = evt.clientX - this._palette_rect.left;
        const y = evt.clientY - this._palette_rect.top;

        let saturation = x / this._palette_rect.width;
        saturation = Math.max(0, Math.min(1, saturation));

        let value = y / this._palette_rect.height;
        value = 1 - Math.max(0, Math.min(1, value));

        this.hsv.s = saturation;
        this.hsv.v = value;
        this.rgb = hsv2rgb(this.hsv.h, this.hsv.s, this.hsv.v);

        this.updatePaletteThumb();
    }

    onPaletteInputMouseUp(evt){
        this.doc
            .removeListener('mousemove', this.onPaletteInputMouseMove)
            .removeListener('mouseup', this.onPaletteInputMouseUp);

        delete this._palette_rect;

        evt.stopPropagation();
        evt.preventDefault();
    }

    onHueInputMouseDown(evt){
        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.get(0)));
        }

        this.doc
            .addListener('mousemove', this.onHueInputMouseMove)
            .addListener('mouseup', this.onHueInputMouseUp);

        this._hue_rect = this.hue_input.get(0).getBoundingClientRect();

        this.onHueInputMouseMove(evt);
    }

    onHueInputMouseMove(evt){
        const x = evt.clientX - this._hue_rect.left;

        let hue = x / this._hue_rect.width;
        hue = Math.max(0, Math.min(1, hue));

        this.hsv.h = hue;
        this.rgb = hsv2rgb(this.hsv.h, this.hsv.s, this.hsv.v);

        this
            .updateHueThumb()
            .updatePaletteColor()
            .updatePaletteThumb();
    }

    onHueInputMouseUp(evt){
        this.doc
            .removeListener('mousemove', this.onHueInputMouseMove)
            .removeListener('mouseup', this.onHueInputMouseUp);

        delete this._hue_rect;

        evt.stopPropagation();
        evt.preventDefault();
    }

    onOpacityInputMouseDown(evt){
        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.get(0)));
        }

        this.doc
            .addListener('mousemove', this.onOpacityInputMouseMove)
            .addListener('mouseup', this.onOpacityInputMouseUp);

        this._opacity_rect = this.opacity_input.get(0).getBoundingClientRect();

        this.onOpacityInputMouseMove(evt);
    }

    onOpacityInputMouseMove(evt){
        const x = evt.clientX - this._opacity_rect.left;

        this.opacity = x / this._opacity_rect.width;
        this.opacity = Math.max(0, Math.min(1, this.opacity));

        this.updateOpcaityThumb();
    }

    onOpacityInputMouseUp(evt){
        this.doc
            .removeListener('mousemove', this.onOpacityInputMouseMove)
            .removeListener('mouseup', this.onOpacityInputMouseUp);

        delete this._opacity_rect;

        evt.stopPropagation();
        evt.preventDefault();
    }

    onSaveClick(){
        this.triggerEvent('save');
    }

    onResetClick(){
        this.triggerEvent('reset');
    }

    onCancelClick(){
        this.triggerEvent('cancel');
    }

    updateUI(){
        this
            .updatePaletteThumb()
            .updateHueThumb()
            .updateOpcaityThumb()
            .updatePaletteColor();
    }

    updatePaletteThumb(){
        this.palette_thumb
            .css('background-color', `rgb(${this.rgb.r},${this.rgb.g},${this.rgb.b})`)
            .css('left', `${this.hsv.s * 100}%`)
            .css('bottom', `${this.hsv.v * 100}%`);

        return this;
    }

    updatePaletteColor(){
        const rgb = hsv2rgb(this.hsv.h, 1, 1);

        let background = 'linear-gradient(to top, rgb(0, 0, 0), transparent) repeat scroll 0% 0%,';
        background += `rgba(0, 0, 0, 0) linear-gradient(to left, rgb(${rgb.r},${rgb.g},${rgb.b}),`;
        background += 'rgb(255, 255, 255)) repeat scroll 0% 0%';

        this.palette_input.css('background', background);

        return this;
    }

    updateHueThumb(){
        const rgb = hsv2rgb(this.hsv.h, 1, 1);

        this.hue_thumb
            .css('background-color', `rgb(${rgb.r},${rgb.g},${rgb.b})`)
            .css('left', `${this.hsv.h * 100}%`);

        return this;
    }

    updateOpcaityThumb(){
        this.opacity_thumb
            .css('background-color', `rgba(0, 0, 0, ${this.opacity})`)
            .css('left', `${this.opacity * 100}%`);

        return this;
    }

}
