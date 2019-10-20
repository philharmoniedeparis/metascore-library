import Input from '../Input';
import Dom from '../../Dom';
import Picker from './color/Picker';
import Button from '../Button';

import {className} from '../../../../css/core/ui/input/Color.scss';

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

        this.button = new Button()
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this);

        this.picker = new Picker()
            .hide()
            //.addListener('save', this.onPickerSave.bind(this))
            //.addListener('cancel', this.onPickerCancel.bind(this))
            .appendTo(this);
    }

    onButtonClick(){
        this.showPicker();
    }

    showPicker(){
        this.picker
            .setValue(this.value)
            .show();

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

    hidePicker(){
        this.picker.hide();

        this.doc.removeListener('mousedown', this.onDocMouseDown, true);

        Dom.removeListener(window, 'scroll', this.onWindowScroll, true);
        Dom.removeListener(window, 'resize', this.onWindowResize);
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
        this.showPicker();
    }

    onPickerCancel(){
        this.picker.hide();
    }

    onPickerSave(color){
        this.setValue(color ? color.toHEXA().toString(3) : null, false, false);
    }

}
