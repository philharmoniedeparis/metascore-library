import Input from '../Input';
import Dom from '../../Dom';
import Locale from '../../Locale';
import Picker from './color/Picker';
import Swatches from './color/Swatches';
import Button from '../Button';
import {rgb2hex, rgba2hex, toCSS, toRGBA} from '../../utils/Color';
import {isEmpty} from '../../utils/Var';
import {throttle} from '../../utils/Function';
import {uuid} from '../../utils/String';

import clear_icon from '../../../../img/core/ui/input/color/clear.svg?svg-sprite';

import {className} from '../../../../css/core/ui/input/Color.scss';

/**
 * A color selection input
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
 * @param {Mixed} value The new value
 */
export default class ColorInput extends Input {

    static defaults = Object.assign({}, super.defaults, {
        'picker': {},
        'swatches': {},
        'format': 'rgba',
        'emptyValue': null
    });

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value=#fff}] The default value (see {@link toRGBA} for valid values)
     * @property {Mixed} [picker={}] Configs to pass to the color picker, or false to disable the picker
     * @property {Mixed} [swatches={}] Configs to pass to the color swatch selector, or false to disable swatches
     * @property {String} [format=rgba] The format of the returned value (rgba, hex, or css)
     * @property {Mixed} [emptyValue=null] The color to display when the field is empty
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onDocMouseDown = this.onDocMouseDown.bind(this);
        this.onWindowBlur = this.onWindowBlur.bind(this);
        this.onWindowScroll = this.onWindowScroll.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onWindowKeyDown = this.onWindowKeyDown.bind(this);

        // throttle the repositionOverlay
        this.repositionOverlay = throttle(this.repositionOverlay.bind(this), 100);

        this.addClass(`color ${className}`);
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        // Ignore the hidden input on tab
        this.native_input.attr('tabindex', -1);

        this.button = new Button({'icon': clear_icon})
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this);

        this.overlay = new Dom('<div/>', {'class': `overlay`, 'tabindex': -1})
            .hide()
            .appendTo(this);

        const tabs_input_name = `tabs-${uuid(5)}`;
        if (this.configs.picker !== false) {
            const id = `tab-input-${uuid(5)}`;

            new Dom('<input/>', {'id': id, 'name': tabs_input_name, 'type': 'radio'})
                .data('target', 'picker')
                .addClass('tab-input')
                .appendTo(this.overlay);

            new Dom('<label/>', {'for': id, 'text': Locale.t('core.ui.input.ColorInput.tabs.picker.label', 'Picker')})
                .addClass('tab-label')
                .appendTo(this.overlay);

            this.picker = new Picker(this.configs.picker)
                .addListener('buttonclick', this.onPickerButtonClick.bind(this))
                .addClass('tab-content')
                .appendTo(this.overlay);
        }
        if (this.configs.swatches !== false) {
            const id = `tab-input-${uuid(5)}`;

            new Dom('<input/>', {'id': id, 'name': tabs_input_name, 'type': 'radio'})
                .data('target', 'swatches')
                .addClass('tab-input')
                .appendTo(this.overlay);

            new Dom('<label/>', {'for': id, 'text': Locale.t('core.ui.input.ColorInput.tabs.swatches.label', 'Swatches')})
                .addClass('tab-label')
                .appendTo(this.overlay);

            this.swatches = new Swatches(this.configs.swatches)
                .addListener('buttonclick', this.onSwatchesButtonClick.bind(this))
                .addClass('tab-content')
                .appendTo(this.overlay);
        }

        const first_tab = this.overlay.child('.tab-input');
        if (first_tab.count() > 0) {
            first_tab.get(0).checked = true;
        }

        this.setEmptyValue(this.configs.emptyValue);
    }

    /**
     * Button click event callback
     *
     * @private
     */
    onButtonClick(){
        this.showOverlay();
    }

    /**
     * Picker button click event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onPickerButtonClick(evt){
        switch(evt.detail.button){
            case 'apply':
                {
                    const rgba = this.picker.getRGBA();
                    this.setValue(rgba);
                    this.overlay.hide();
                }
                break;

            case 'reset':
                this.setValue(null);
                this.overlay.hide();
                break;

            case 'cancel':
                this.overlay.hide();
                break;
        }
    }

    /**
     * Swatches buttonclick event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onSwatchesButtonClick(evt) {
        switch(evt.detail.button){
            case 'swatch':
                this.setValue(evt.detail.value);
                this.overlay.hide();
                break;

            case 'reset':
                this.setValue(null);
                this.overlay.hide();
                break;

            case 'cancel':
                this.overlay.hide();
                break;
        }
    }

    /**
     * Set the input's empty value
     *
     * Used to show a specific color when the current value is null.
     *
     * @param {Mixed} value The new value
     * @return {this}
     */
    setEmptyValue(value){
        this.empty_value = value;

        this.toggleClass('has-empty-value', value);

        this.updateButton();

        return this;
    }

    /**
     * Show the overlay
     */
    showOverlay(){
        if (this.picker) {
            this.picker.setValue(this.getValue());
        }

        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.get(0)));
        }

        this.overlay.show().focus();

        this.repositionOverlay();

        this.doc.addListener('mousedown', this.onDocMouseDown, true);

        Dom.addListener(window, 'blur', this.onWindowBlur);
        Dom.addListener(window, 'scroll', this.onWindowScroll, true);
        Dom.addListener(window, 'resize', this.onWindowResize);
        Dom.addListener(window, 'keydown', this.onWindowKeyDown, true);

        return this;
    }

    /**
     * Hide the overlay
     */
    hideOverlay(){
        this.overlay.hide();

        this.doc.removeListener('mousedown', this.onDocMouseDown, true);

        Dom.removeListener(window, 'blur', this.onWindowBlur);
        Dom.removeListener(window, 'scroll', this.onWindowScroll, true);
        Dom.removeListener(window, 'resize', this.onWindowResize);
        Dom.removeListener(window, 'keydown', this.onWindowKeyDown, true);
    }

    /**
     * Reposition the overlay relative to the button's position
     *
     * @private
     */
    repositionOverlay(){
        const rect = this.button.get(0).getBoundingClientRect();
        const overlay_rect = this.overlay.get(0).getBoundingClientRect();

        let x = Math.max(0, rect.left + (rect.width - overlay_rect.width) / 2);
        let y = Math.max(0, rect.bottom + 10);

        if((x + overlay_rect.width) > window.innerWidth){
            x = window.innerWidth - overlay_rect.width;
        }

        if((y + overlay_rect.height) > window.innerHeight){
            y = window.innerHeight - overlay_rect.height;
        }

        this.overlay
            .css('left', `${x}px`)
            .css('top', `${y}px`);

        return this;
    }

    /**
     * Document mousedown event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onDocMouseDown(evt){
        const overlay_dom = this.overlay.get(0);
        if (!overlay_dom.isSameNode(evt.target) && !overlay_dom.contains(evt.target)) {
            this.hideOverlay();
        }
    }

    /**
     * Window blur event handler
     *
     * @private
     */
    onWindowBlur(){
        this.hideOverlay();
    }

    /**
     * Window scroll event handler
     *
     * @private
     */
    onWindowScroll(){
        this.repositionOverlay(true);
    }

    /**
     * Window resize event handler
     *
     * @private
     */
    onWindowResize(){
        this.repositionOverlay(true);
    }

    /**
     * Window keyup event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onWindowKeyDown(evt){
        switch(evt.key){
            case 'Escape':
                this.hideOverlay();
                break;

            case 'Enter':
                {
                    const checked_tab = this.overlay.child('.tab-input:checked');
                    if(checked_tab.count() > 0 && checked_tab.data('target') === 'picker'){
                        const rgba = this.picker.getRGBA();
                        this.setValue(rgba);
                        this.hideOverlay();
                    }
                }
                break;
        }

        evt.stopPropagation();
    }

    /**
     * @inheritdoc
     */
    setValue(value, supressEvent){
        const rgba = toRGBA(value);
        let formatted_value = null;

        if (rgba) {
            switch (this.configs.format) {
                case 'hex':
                    formatted_value = rgba.a === 1 ? rgb2hex(rgba.r, rgba.g, rgba.b) : rgba2hex(rgba.r, rgba.g, rgba.b, rgba.a);
                    break;

                case 'css':
                    formatted_value = toCSS(rgba);
                    break;

                default:
                    formatted_value = Object.assign({}, rgba);
            }
        }

        super.setValue(formatted_value, supressEvent);

        this.updateButton();
    }

    updateButton() {
        const value = this.getValue();

        if(!isEmpty(value)){
            const rgba = toRGBA(value);
            this.button.css('color', `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`);
            this.removeClass('empty');
        }
        else{
            this.button.css('color', this.empty_value);
            this.addClass('empty');
        }
    }

}
