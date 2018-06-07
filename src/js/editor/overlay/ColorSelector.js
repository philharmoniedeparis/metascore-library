import Overlay from '../../core/ui/Overlay';
import Dom from '../../core/Dom';
import Button from '../../core/ui/Button';
import {isObject} from '../../core/utils/Var';
import {toRGBA, rgb2hsv} from '../../core/utils/Color';

/**
 * Fired when the submit button is clicked
 *
 * @event submit
 * @param {Object} overlay The overlay instance
 * @param {Object} value The color value in rgba format
 */
const EVT_SUBMIT = 'submit';

export default class ColorSelector extends Overlay {

    /**
     * An overlay to select an RGBA color
     *
     * @class ColorSelector
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onGradientClick = this.onGradientClick.bind(this);
        this.onAlphaClick = this.onAlphaClick.bind(this);

        this.addClass('color-selector');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'parent': '.metaScore-editor'
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        // call parent method
        super.setupUI();

        this.gradient = new Dom('<div/>', {'class': 'gradient'}).appendTo(this.contents);

        this.gradient.canvas = new Dom('<canvas/>', {'width': '255', 'height': '255'})
            .addListener('click', this.onGradientClick.bind(this))
            .addListener('mousedown', this.onGradientMousedown.bind(this))
            .addListener('mouseup', this.onGradientMouseup.bind(this))
            .appendTo(this.gradient);

        this.gradient.position = new Dom('<div/>', {'class': 'position'}).appendTo(this.gradient);

        this.alpha = new Dom('<div/>', {'class': 'alpha'}).appendTo(this.contents);

        this.alpha.canvas = new Dom('<canvas/>', {'width': '20', 'height': '255'})
            .addListener('click', this.onAlphaClick.bind(this))
            .addListener('mousedown', this.onAlphaMousedown.bind(this))
            .addListener('mouseup', this.onAlphaMouseup.bind(this))
            .appendTo(this.alpha);

        this.alpha.position = new Dom('<div/>', {'class': 'position'}).appendTo(this.alpha);

        this.controls = new Dom('<div/>', {'class': 'controls'}).appendTo(this.contents);

        this.controls.r = new Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
            .addListener('input', this.onControlInput.bind(this));

        new Dom('<div/>', {'class': 'control-wrapper'})
            .append(new Dom('<label/>', {'text': 'R', 'for': 'r'}))
            .append(this.controls.r)
            .appendTo(this.controls);

        this.controls.g = new Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
            .addListener('input', this.onControlInput.bind(this));

        new Dom('<div/>', {'class': 'control-wrapper'})
            .append(new Dom('<label/>', {'text': 'G', 'for': 'g'}))
            .append(this.controls.g)
            .appendTo(this.controls);

        this.controls.b = new Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
            .addListener('input', this.onControlInput.bind(this));

        new Dom('<div/>', {'class': 'control-wrapper'})
            .append(new Dom('<label/>', {'text': 'B', 'for': 'b'}))
            .append(this.controls.b)
            .appendTo(this.controls);

        this.controls.a = new Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
            .addListener('input', this.onControlInput.bind(this));

        new Dom('<div/>', {'class': 'control-wrapper'})
            .append(new Dom('<label/>', {'text': 'A', 'for': 'a'}))
            .append(this.controls.a)
            .appendTo(this.controls);

        this.controls.current = new Dom('<canvas/>');

        new Dom('<div/>', {'class': 'canvas-wrapper current'})
            .append(this.controls.current)
            .appendTo(this.controls);

        this.controls.previous = new Dom('<canvas/>');

        new Dom('<div/>', {'class': 'canvas-wrapper previous'})
            .append(this.controls.previous)
            .appendTo(this.controls);

        this.controls.cancel = new Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', this.onCancelClick.bind(this))
            .appendTo(this.controls);

        this.controls.apply = new Button({'label': 'Apply'})
            .addClass('submit')
            .addListener('click', this.onApplyClick.bind(this))
            .appendTo(this.controls);

        this.fillGradient();

    }

    /**
     * Set the current value
     *
     * @method setValue
     * @param {Mixed} val The value in a format accepted by {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}}
     * @chainable
     */
    setValue(val){
        this.updateValue(val);

        this.previous_value = this.value;

        this.fillPrevious();

        return this;
    }

    /**
     * Update the selected value
     *
     * @method updateValue
     * @private
     * @param {Mixed} val The value in a format accepted by {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}}
     * @param {Boolean} refillAlpha Whether to refill the alpha indicator canvas
     * @param {Boolean} updatePositions Whether to update the cursor positions
     * @param {Boolean} updateInputs Whether to update the input values
     * @chainable
     */
    updateValue(val, refillAlpha, updatePositions, updateInputs){

        let hsv;

        this.value = this.value || {};

        if(!isObject(val)){
            val = toRGBA(val);
        }

        if('r' in val){
            this.value.r = parseInt(val.r, 10);
        }
        if('g' in val){
            this.value.g = parseInt(val.g, 10);
        }
        if('b' in val){
            this.value.b = parseInt(val.b, 10);
        }
        if('a' in val){
            this.value.a = parseFloat(val.a);
        }

        if(refillAlpha !== false){
            this.fillAlpha();
        }

        if(updateInputs !== false){
            this.controls.r.val(this.value.r);
            this.controls.g.val(this.value.g);
            this.controls.b.val(this.value.b);
            this.controls.a.val(this.value.a);
        }

        if(updatePositions !== false){
            hsv = rgb2hsv(this.value);

            this.gradient.position.css('left', `${(1 - hsv.h) * 255}px`);
            this.gradient.position.css('top', `${(hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2))}px`);

            this.alpha.position.css('top', `${(1 - this.value.a) * 255}px`);
        }

        this.fillCurrent();

        return this;

    }

    /**
     * Fill the gradient's canvas
     *
     * @method fillGradient
     * @private
     * @chainable
     */
    fillGradient() {
        let context = this.gradient.canvas.get(0).getContext('2d'),
            fill;

        // Create color gradient
        fill = context.createLinearGradient(0, 0, context.canvas.width, 0);
        fill.addColorStop(0, "rgb(255, 0, 0)");
        fill.addColorStop(0.15, "rgb(255, 0, 255)");
        fill.addColorStop(0.33, "rgb(0, 0, 255)");
        fill.addColorStop(0.49, "rgb(0, 255, 255)");
        fill.addColorStop(0.67, "rgb(0, 255, 0)");
        fill.addColorStop(0.84, "rgb(255, 255, 0)");
        fill.addColorStop(1, "rgb(255, 0, 0)");

        // Apply gradient to canvas
        context.fillStyle = fill;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        // Create semi transparent gradient (white -> trans. -> black)
        fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
        fill.addColorStop(0, "rgba(255, 255, 255, 1)");
        fill.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        fill.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        fill.addColorStop(1, "rgba(0, 0, 0, 1)");

        // Apply gradient to canvas
        context.fillStyle = fill;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    }

    /**
     * Fill the previous color indicator canvas
     *
     * @method fillPrevious
     * @private
     * @chainable
     */
    fillPrevious() {
        const context = this.controls.previous.get(0).getContext('2d');

        context.fillStyle = `rgba(${this.previous_value.r},${this.previous_value.g},${this.previous_value.b},${this.previous_value.a})`;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    }

    /**
     * Fill the current color indicator canvas
     *
     * @method fillCurrent
     * @private
     * @chainable
     */
    fillCurrent() {
        const context = this.controls.current.get(0).getContext('2d');

        context.fillStyle = `rgba(${this.value.r},${this.value.g},${this.value.b},${this.value.a})`;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    }

    /**
     * Fill the alpha indicator canvas
     *
     * @method fillAlpha
     * @private
     * @chainable
     */
    fillAlpha() {
        let context = this.alpha.canvas.get(0).getContext('2d'),
            fill;

        // Create color gradient
        fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
        fill.addColorStop(0, `rgb(${this.value.r},${this.value.g},${this.value.b})`);
        fill.addColorStop(1, "transparent");

        // Apply gradient to canvas
        context.fillStyle = fill;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    }

    /**
     * The controls input event handler
     *
     * @method onControlInput
     * @private
     */
    onControlInput(){
        this.updateValue({
            'r': this.controls.r.val(),
            'g': this.controls.g.val(),
            'b': this.controls.b.val(),
            'a': this.controls.a.val()
        }, true, true, false);
    }

    /**
     * The gradient mousedown event handler
     *
     * @method onGradientMousedown
     * @private
     * @param {Event} evt The event object
     */
    onGradientMousedown(evt){
        this.gradient.canvas.addListener('mousemove', this.onGradientClick);

        evt.stopPropagation();
    }

    /**
     * The gradient mouseup event handler
     *
     * @method onGradientMouseup
     * @private
     * @param {Event} evt The event object
     */
    onGradientMouseup(evt){
        this.gradient.canvas.removeListener('mousemove', this.onGradientClick);

        evt.stopPropagation();
    }

    /**
     * The gradient click event handler
     *
     * @method onGradientClick
     * @private
     * @param {Event} evt The event object
     */
    onGradientClick(evt){
        let offset = evt.target.getBoundingClientRect(),
            colorX = evt.pageX - offset.left,
            colorY = evt.pageY - offset.top,
            context = this.gradient.canvas.get(0).getContext('2d'),
            imageData = context.getImageData(colorX, colorY, 1, 1),
            value = this.value;

        this.gradient.position.css('left', `${colorX}px`);
        this.gradient.position.css('top', `${colorY}px`);

        value.r = imageData.data[0];
        value.g = imageData.data[1];
        value.b = imageData.data[2];

        if(!value.a){
            value.a = 1;
            this.updateValue(value, true, true);
        }
        else{
            this.updateValue(value, true, false);
        }


        evt.stopPropagation();
    }

    /**
     * The alpha mousedown event handler
     *
     * @method onAlphaMousedown
     * @private
     * @param {Event} evt The event object
     */
    onAlphaMousedown(evt){
        this.alpha.canvas.addListener('mousemove', this.onAlphaClick);

        evt.stopPropagation();
    }

    /**
     * The alpha mouseup event handler
     *
     * @method onAlphaMouseup
     * @private
     * @param {Event} evt The event object
     */
    onAlphaMouseup(evt){
        this.alpha.canvas.removeListener('mousemove', this.onAlphaClick);

        evt.stopPropagation();
    }

    /**
     * The alpha click event handler
     *
     * @method onAlphaClick
     * @private
     * @param {Event} evt The event object
     */
    onAlphaClick(evt){
        let offset = evt.target.getBoundingClientRect(),
            colorY = evt.pageY - offset.top,
            context = this.alpha.canvas.get(0).getContext('2d'),
            imageData = context.getImageData(0, colorY, 1, 1),
            value = this.value;

        this.alpha.position.css('top', `${colorY}px`);

        value.a = Math.round(imageData.data[3] / 255 * 100) / 100;

        this.updateValue(value, false, false);

        evt.stopPropagation();
    }

    /**
     * The apply button click event handler
     *
     * @method onApplyClick
     * @private
     */
    onApplyClick(){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'value': this.value}, true, false);

        this.hide();
    }

    /**
     * The cancel button click event handler
     *
     * @method onCancelClick
     * @private
     */
    onCancelClick(){
        this.hide();
    }

}
