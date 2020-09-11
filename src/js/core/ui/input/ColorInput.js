import Input from '../Input';
import Dom from '../../Dom';
import Locale from '../../Locale';
import Picker from './color/Picker';
import Swatches from './color/Swatches';
import Button from '../Button';
import {toRGBA} from '../../utils/Color';
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

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value=#fff}] The default value (see {@link toRGBA} for valid values)
     * @property {Mixed} [picker={}] Configs to pass to the color picker, or false to disable the picker
     * @property {Mixed} [swatches=false] Configs to pass to the color swatch selector, or false to disable swatches
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onDocMouseDown = this.onDocMouseDown.bind(this);
        this.onWindowScroll = this.onWindowScroll.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onWindowKeyDown = this.onWindowKeyDown.bind(this);

        // throttle the repositionOverlay
        this.repositionOverlay = throttle(this.repositionOverlay.bind(this), 100);

        this.addClass(`color ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'picker': {},
            'swatches': {}
        });
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

        this.overlay = new Dom('<div/>', {'class': `overlay`})
            .hide()
            .appendTo(this);

        const tabs_input_name = `tabs-${uuid(5)}`;
        if (this.configs.picker !== false) {
            const id = `tab-input-${uuid(5)}`;

            new Dom('<input/>', {'id': id, 'name': tabs_input_name, 'type': 'radio', 'checked': 'checked'})
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
                .addClass('tab-input')
                .appendTo(this.overlay);

            new Dom('<label/>', {'for': id, 'text': Locale.t('core.ui.input.ColorInput.tabs.swatches.label', 'Swatches')})
                .addClass('tab-label')
                .appendTo(this.overlay);

            this.swatches = new Swatches(this.configs.swatches)
                .addListener('swatchclick', this.onSwatchesSwatchClick.bind(this))
                .addClass('tab-content')
                .appendTo(this.overlay);
        }
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
            case 'save':
                {
                    const hex = this.picker.getHEX();
                    this.setValue(hex);
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
     * Swatches swatchclick event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onSwatchesSwatchClick(evt) {
        this.setValue(evt.detail.value);
        this.overlay.hide();
    }

    /**
     * Show the overlay
     */
    showOverlay(){
        if (this.picker) {
            this.picker.setValue(this.getValue());
        }

        this.overlay.show();

        this.repositionOverlay();

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
        Dom.addListener(window, 'keydown', this.onWindowKeyDown, true);

        return this;
    }

    /**
     * Hide the overlay
     */
    hideOverlay(){
        this.overlay.hide();

        this.doc.removeListener('mousedown', this.onDocMouseDown, true);

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
        if(!this.get(0).contains(evt.target)){
            this.hideOverlay();
        }
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
                    const hex = this.picker.getHEX(); //TODO: fix when no picker
                    this.setValue(hex);
                    this.overlay.hide();
                }
                break;
        }

        evt.stopPropagation();
    }

    /**
     * @inheritdoc
     */
    setValue(value, supressEvent){
        super.setValue(value, supressEvent);

        if(isEmpty(value)){
            this.button.css('color', null);
            this.addClass('empty');
        }
        else{
            const rgba = toRGBA(value);
            this.button.css('color', `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`);
            this.removeClass('empty');
        }
    }

}
