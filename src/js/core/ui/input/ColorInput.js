import Input from '../Input';
import Dom from '../../Dom';
import Locale from '../../Locale';
import Pickr from '@simonwep/pickr';
import Picker from './color/Picker';
import Button from '../Button';

import '@simonwep/pickr/dist/themes/nano.min.css';
import {className, pickerClassName, pickrClassName} from '../../../../css/core/ui/input/Color.scss';

/**
 * A color selection input
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
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
        this.onDocMouseDown = this.onDocMouseDown.bind(this);
        this.onWindowScroll = this.onWindowScroll.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.repositionPicker = this.repositionPicker.bind(this);
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
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.native_input.addListener('focus', this.onInputFocus.bind(this));

        this.picker = new Picker()
            .addClass(pickerClassName)
            .hide()
            .appendTo(this);

        this.button = new Button()
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this);

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

    onButtonClick(){
        this.showPicker();
    }

    showPicker(){
        this.picker.show();

        this.repositionPicker();

        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.get(0)));
        }

        this.doc.addListener('mousedown', this.onDocMouseDown, true);

        Dom.addListener(window, 'scroll', this.onWindowScroll, true);
        Dom.addListener(window, 'resize', this.onWindowResize);

        return this;
    }

    repositionPicker(timeout){
        if(this.scroll_timeout){
            clearTimeout(this.scroll_timeout);
        }

        if(timeout === true){
            this.scroll_timeout = setTimeout(this.repositionPicker, 20);
        }
        else{
            const rect = this.button.get(0).getBoundingClientRect();
            const picker_rect = this.picker.get(0).getBoundingClientRect();

            this.picker
                .css('top', `${rect.bottom + 10}px`)
                .css('left', `${rect.left + (rect.width - picker_rect.width) / 2}px`);
        }

        return this;
    }

    hidePicker(){
        this.picker.hide();

        this.doc.removeListener('mousedown', this.onDocMouseDown, true);

        Dom.removeListener(window, 'scroll', this.onWindowScroll, true);
        Dom.removeListener(window, 'resize', this.onWindowResize);
    }

    onDocMouseDown(evt){
        if(!this.get(0).contains(evt.target)){
            this.hidePicker();
        }
    }

    onWindowScroll(){
        this.repositionPicker(true);
    }

    onWindowResize(){
        this.repositionPicker(true);
    }

    onInputFocus(){
        this.pickr.show();

        this.showPicker();
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
     * Set the input'S value
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
