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
        super.setupUI();

        this.native_input.addListener('focus', this.onInputFocus.bind(this));

        const pickr_el = new Dom('<div/>')
            .appendTo(this);

        this.pickr = Pickr.create({
            'el': pickr_el.get(0),
            'theme': 'nano',
            'appClass': pickrClassName,
            'defaultRepresentation': 'HEX',
            'components': {
                'palette': true,
                'preview': true,
                'opacity': true,
                'hue': true,
                'interaction': {
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

    onInputFocus(){
        this.pickr.show();
    }

    onPickrShow(){
        this.pickr.on('save', this.onPickrSave);
    }

    onPickrCancel(){
        this.pickr.hide();
    }

    onPickrSave(color){
        this.pickr.off('save', this.onPickrSave);

        this.setValue(color ? color.toHEXA().toString(3) : null, false, false);
    }

    /**
     * Set the field'S value
     *
     * @param {Mixed} value The new color's value (see {@link toRGBA} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent, updatePickr){
        if(updatePickr !== false){
            this.pickr.setColor(value);
            this.pickr.setColorRepresentation('HEX');
        }

        this.native_input.val(value);
        this.value = value;

        if(supressEvent !== true){
            this.native_input.triggerEvent('change');
        }

        return this;
    }

    /**
     * Disable the input
     *
     * @return {this}
     */
    disable() {
        this.pickr.disable();
        return super.disable();
    }

    /**
     * Enable the input
     *
     * @return {this}
     */
    enable() {
        this.pickr.enable();
        return super.enable();
    }

    destroy(){
        this.pickr.destroyAndRemove();
    }

}
