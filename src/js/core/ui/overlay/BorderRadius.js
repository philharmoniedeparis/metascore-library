import Overlay from '../Overlay';
import Dom from '../../Dom';
import Locale from '../../Locale';
import NumberInput from '../input/NumberInput';

import {className} from '../../../../css/core/ui/overlay/BorderRadius.scss';

/**
 * An overlay that simplifies the creation of a CSS border-radius value
 *
 * @emits {submit} Fired when the submit button is clicked
 * @param {Object} overlay The overlay instance
 * @param {String} value The border radius value in CSS format
 */
export default class BorderRadius extends Overlay {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Border Radius'] The overlay's title
     * @property {String} [format="css"] The format of the value (css, object)
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`border-radius ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbar': true,
            'title': Locale.t('editor.overlay.BorderRadius.title', 'Border Radius'),
            'format': 'css'
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        // call parent method
        super.setupUI();

        const contents = this.getContents();

        /**
         * The preview container
         * @type {Dom}
         */
        this.preview = new Dom('<div/>', {'class': 'preview'})
            .appendTo(contents);

        /**
         * The list of inputs
         * @type {Object}
         */
        this.inputs = {};

        this.inputs.tlw = new NumberInput({'min': 0})
            .addClass('tlw')
            .addListener('valuechange', this.onValueChange.bind(this))
            .appendTo(this.preview);

        this.inputs.tlh = new NumberInput({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('tlh')
            .appendTo(this.preview);

        this.inputs.trw = new NumberInput({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('trw')
            .appendTo(this.preview);

        this.inputs.trh = new NumberInput({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('trh')
            .appendTo(this.preview);

        this.inputs.brw = new NumberInput({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('brw')
            .appendTo(this.preview);

        this.inputs.brh = new NumberInput({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('brh')
            .appendTo(this.preview);

        this.inputs.blw = new NumberInput({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('blw')
            .appendTo(this.preview);

        this.inputs.blh = new NumberInput({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('blh')
            .appendTo(this.preview);

        this.addButton('apply', 'Apply');
        this.addButton('cancel', 'Cancel');
    }

    /**
     * The valuechange event handler
     *
     * @private
     */
    onValueChange() {
        let radius    = '';

        radius += `${this.inputs.tlw.getValue()}px `;
        radius += `${this.inputs.trw.getValue()}px `;
        radius += `${this.inputs.brw.getValue()}px `;
        radius += `${this.inputs.blw.getValue()}px `;
        radius += '/ ';
        radius += `${this.inputs.tlh.getValue()}px `;
        radius += `${this.inputs.trh.getValue()}px `;
        radius += `${this.inputs.brh.getValue()}px `;
        radius += `${this.inputs.blh.getValue()}px`;

        this.preview.css('border-radius', radius);
    }

    /**
     * Set the current value
     *
     * @param {String} val The value in CSS border-radius format
     * @return {this}
     */
    setValue(val){
        const values = {
            tlw: 0, tlh: 0,
            trw: 0, trh: 0,
            blw: 0, blh: 0,
            brw: 0, brh: 0
        };

        this.preview.css('border-radius', val);

        let matches = this.preview.css('border-top-left-radius', void 0, true).match(/(\d*)px/g);
        if(matches){
            if(matches.length > 1){
                values.tlw = matches[0];
                values.tlh = matches[1];
            }
            else{
                values.tlw = values.tlh = matches[0];
            }
        }

        matches = this.preview.css('border-top-right-radius', void 0, true).match(/(\d*)px/g);
        if(matches){
            if(matches.length > 1){
                values.trw = matches[0];
                values.trh = matches[1];
            }
            else{
                values.trw = values.trh = matches[0];
            }
        }

        matches = this.preview.css('border-bottom-left-radius', void 0, true).match(/(\d*)px/g);
        if(matches){
            if(matches.length > 1){
                values.blw = matches[0];
                values.blh = matches[1];
            }
            else{
                values.blw = values.blh = matches[0];
            }
        }

        matches = this.preview.css('border-bottom-right-radius', void 0, true).match(/(\d*)px/g);
        if(matches){
            if(matches.length > 1){
                values.brw = matches[0];
                values.brh = matches[1];
            }
            else{
                values.brw = values.brh = matches[0];
            }
        }

		Object.entries(this.inputs).forEach(([key, input]) => {
            input.setValue(parseInt(values[key], 10), true);
        });

        return this;
    }

    /**
     * Get the current value
     *
     * @return {String} The value in CSS border-radius format
     */
    getValue() {
        switch(this.configs.format){
            case 'object':
                return {
                    tlw: this.inputs.tlw.getValue(),
                    trw: this.inputs.trw.getValue(),
                    brw: this.inputs.brw.getValue(),
                    blw: this.inputs.blw.getValue(),
                    tlh: this.inputs.tlh.getValue(),
                    trh: this.inputs.trh.getValue(),
                    brh: this.inputs.brh.getValue(),
                    blh: this.inputs.blh.getValue()
                };

            default:
                return this.preview.css('border-radius');
        }
    }

    /**
     * @inheritdoc
     */
    onButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        switch(action){
            case 'apply':
                this.triggerEvent('submit', {'overlay': this, 'value': this.getValue()}, true, false);
                break;
        }

        super.onButtonClick(evt);
    }

}
