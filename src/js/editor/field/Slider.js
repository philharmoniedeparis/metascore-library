import Field from '../Field';

import '../../../css/editor/field/Slider.less';

export default class Number extends Field {

    /**
     * A number field based on an HTML input[type=number] element
     *
     * @class NumberField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=null] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     * @param {Number} [configs.step=1] The spin up/down step amount
     * @param {Boolean} [configs.spinButtons=true] Whether to show the spin buttons
     * @param {Integer} [configs.initSpinDelay=200] The initial delay between each increment/decrement of the spin buttons
     * @param {Integer} [configs.minSpinDelay=5] The min delay of the spin buttons
     * @param {Float} [configs.spinDelayMultiplier=0.95] The value to multiply the delay of the spin buttons with
     * @param {String} [configs.spinDirection='horizontal'] The direction of the spin buttons
     * @param {Boolean} [configs.flipSpinButtons=false] Whether to flip the spin buttons
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('sliderfield');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'value': 0,
            'min': null,
            'max': null,
            'step': 1,
            'vertical': false,
            'reversed': false,
            'triggerChangeOnDrag': false
        });
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input.attr('type', 'range');

        this
            .toggleClass('vertical', this.configs.vertical)
            .toggleClass('reversed', this.configs.reversed);

        if(this.configs.triggerChangeOnDrag){
            this.input.addListener('input', this.onChange.bind(this));
        }
    }

    /**
     * Set the minimum allowed value
     *
     * @method setMin
     * @param {Number} value The minimum allowed value
     * @chainable
     */
    setMin(value){
        this.input.attr('min', value);

        return this;
    }

    /**
     * Set the maximum allowed value
     *
     * @method setMax
     * @param {Number} value The maximum allowed value
     * @chainable
     */
    setMax(value){
        this.input.attr('max', value);

        return this;
    }

    /**
     * Set the granularity of the slider
     *
     * @method setStep
     * @param {Number} value The step's value
     * @chainable
     */
    setStep(value){
        this.input.attr('step', value);

        return this;
    }

    /**
     * Reset the field's configs
     *
     * @method reset
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    reset(supressEvent){
        this
            .setMin(this.configs.min)
            .setMax(this.configs.max);

        super.reset(supressEvent);

        return this;
    }

}
