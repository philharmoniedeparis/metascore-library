import Input from '../Input';
import Locale from '../../Locale';
import Pickr from '@simonwep/pickr';

import '@simonwep/pickr/dist/themes/nano.min.css';
import {className, pickrClassName} from '../../../../css/core/ui/input/Color.scss';
import Dom from '../../Dom';
/**
 * A color selection field
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
export default class ColorInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value={r:255, g:255, b:255, a:1}}] The default value (see {@link toRGBA} for valid values)
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onPickrSave = this.onPickrSave.bind(this);

        this.addClass(`color ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {});
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        const pickr_el = new Dom('<div/>')
            .appendTo(this);

        this.pickr = Pickr.create({
            'el': pickr_el.get(0),
            'theme': 'nano',
            'appClass': pickrClassName,
            'swatches': [],
            'components': {
                'palette': true,
                'preview': true,
                'opacity': true,
                'hue': true,
                'interaction': {
                    'hex': true,
                    'rgba': true,
                    'input': true,
                    'clear': true,
                    'cancel': true,
                    'save': true
                }
            },
            'strings': {
                'save': Locale.t('core.ui.input.ColorInput.pickr.save', 'Save'),
                'clear': Locale.t('core.ui.input.ColorInput.pickr.reset', 'Reset'),
                'cancel': Locale.t('core.ui.input.ColorInput.pickr.cancel', 'Cancel')
             }
        });

        this.pickr
            .on('show', this.onPickrShow.bind(this))
            .on('cancel', this.onPickrCancel.bind(this));
    }

    onPickrShow(){
        this.pickr.on('save', this.onPickrSave);
    }

    onPickrCancel(){
        this.pickr.hide();
    }

    onPickrSave(color){
        this.pickr.off('save', this.onPickrSave);

        /**
         * The current value
         * @type {Object}
         */
        this.value = color ? color.toRGBA().toString(3) : null;

        this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
    }

    /**
     * Set the field'S value
     *
     * @param {Mixed} value The new color's value (see {@link toRGBA} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        this.pickr.setColor(value);

        this.value = this.pickr.getColor().toRGBA().toString(3);

        if(supressEvent !== true){
            this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
        }

        return this;
    }

    /**
     * Disable the input
     *
     * @return {this}
     */
    disable() {
        super.disable();

        this.pickr.disable();

        return this;
    }

    /**
     * Enable the input
     *
     * @return {this}
     */
    enable() {
        super.enable();

        this.pickr.enable();

        return this;
    }

}
