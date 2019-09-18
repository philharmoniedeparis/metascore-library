import Dom from '../core/Dom';
import BorderRadiusInput from '../core/ui/input/BorderRadiusInput';
import ButtonsInput from '../core/ui/input/ButtonsInput';
import CheckboxInput from '../core/ui/input/CheckboxInput';
import CheckboxesInput from '../core/ui/input/CheckboxesInput';
import ColorInput from '../core/ui/input/ColorInput';
import FileInput from '../core/ui/input/FileInput';
import FileOrUrlInput from '../core/ui/input/FileOrUrlInput';
import HiddenInput from '../core/ui/input/HiddenInput';
import ImageInput from '../core/ui/input/ImageInput';
import NumberInput from '../core/ui/input/NumberInput';
import RadioButtonsInput from '../core/ui/input/RadioButtonsInput';
import SelectInput from '../core/ui/input/SelectInput';
import SliderInput from '../core/ui/input/SliderInput';
import TextInput from '../core/ui/input/TextInput';
import TextareaInput from '../core/ui/input/TextareaInput';
import TimeInput from '../core/ui/input/TimeInput';
import UrlInput from '../core/ui/input/UrlInput';

import {className} from '../../css/editor/Field.scss';

/**
 * The list of renderers to use in order of priority
 * @type {Array}
 */
const INPUTS = {
    'border-radius': BorderRadiusInput,
    'buttons': ButtonsInput,
    'checkbox': CheckboxInput,
    'checkboxes': CheckboxesInput,
    'color': ColorInput,
    'file': FileInput,
    'fileorurl': FileOrUrlInput,
    'hidden': HiddenInput,
    'image': ImageInput,
    'number': NumberInput,
    'radio-buttons': RadioButtonsInput,
    'select': SelectInput,
    'slider': SliderInput,
    'text': TextInput,
    'textarea': TextareaInput,
    'time': TimeInput,
    'url': UrlInput,
};

/**
 * A generic field based on an HTML input element
 *
 * @emits {valuechange} Fired when the field's value changes
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 * @emits {reset} Fired when the field is reset
 * @param {Object} field The field instance
 */
export default class Field extends Dom{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} input The input configs
     * @property {String} [description=''] A description to add to the field
     */
    constructor(configs) {
        // call the super constructor.
        super('<div/>', {'class': `field ${className}`, 'tabindex': -1});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.addClass(this.configs.type);

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        /**
         * The input
         * @type {Input}
         */
        this.input = new INPUTS[this.configs.type](this.configs.input);

        if(this.configs.label){
            this.setLabelText(this.configs.label);
        }

        this.input
            .addListener('valuechange', this.onInputValueChange.bind(this))
            .appendTo(this);

        if(this.configs.description){
            this.setDescriptionText(this.configs.description);
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'type': 'text',
            'input': {},
            'description': null
        };
    }

    /**
     * Input valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onInputValueChange(evt){
        const detail = Object.assign({}, evt.detail, {'field': this});
        this.triggerEvent('valuechange', detail, true, false);
        evt.stopPropagation();
    }

    /**
     * Get the label element
     *
     * @return {Dom}
     */
    getLabel(){
        return this.label;
    }

    /**
     * Set the label text
     *
     * @param {String} text The label text
     * @return {this}
     */
    setLabelText(text){
        if(!('label' in this)){
            const id = this.getInput().getId();
            /**
             * A potential <label> element
             * @type {Dom}
             */
            this.label = new Dom('<label/>', {'for': id})
                .appendTo(this);
        }

        this.label.text(text);

        return this;
    }

    /**
     * Get the description element
     *
     * @return {Dom}
     */
    getDescription(){
        return this.description;
    }

    /**
     * Set the description text
     *
     * @param {String} text The description text
     * @return {this}
     */
    setDescriptionText(text){
        if(!('description' in this)){
            /**
             * A potential description container
             * @type {Dom}
             */
            this.description = new Dom('<div/>', {'class': 'description'})
                .appendTo(this.input_wrapper);
        }

        this.description.text(text);

        return this;
    }

    /**
     * Get the field's input
     *
     * @return {Input} The input
     */
    getInput() {
        return this.input;
    }

}
