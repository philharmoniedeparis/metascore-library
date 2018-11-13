import Overlay from '../../core/ui/Overlay';
import Dom from '../../core/Dom';
import Button from '../../core/ui/Button';
import Locale from '../../core/Locale';
import NumberField from '../field/Number';

import {className} from '../../../css/editor/overlay/BorderRadius.less';

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
            'parent': '.metaScore-editor',
            'toolbar': true,
            'title': Locale.t('editor.overlay.BorderRadius.title', 'Border Radius')
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
         * The list of fields
         * @type {Object}
         */
        this.fields = {};

        this.fields.tlw = new NumberField({'min': 0})
            .addClass('tlw')
            .addListener('valuechange', this.onValueChange.bind(this))
            .appendTo(this.preview);

        this.fields.tlh = new NumberField({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('tlh')
            .appendTo(this.preview);

        this.fields.trw = new NumberField({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('trw')
            .appendTo(this.preview);

        this.fields.trh = new NumberField({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('trh')
            .appendTo(this.preview);

        this.fields.brw = new NumberField({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('brw')
            .appendTo(this.preview);

        this.fields.brh = new NumberField({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('brh')
            .appendTo(this.preview);

        this.fields.blw = new NumberField({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('blw')
            .appendTo(this.preview);

        this.fields.blh = new NumberField({'min': 0})
            .addListener('valuechange', this.onValueChange.bind(this))
            .addClass('blh')
            .appendTo(this.preview);

        /**
         * The list of buttons
         * @type {Object}
         */
        this.buttons = {};

        this.buttons.apply = new Button({'label': 'Apply'})
            .addClass('submit')
            .addListener('click', this.onApplyClick.bind(this))
            .appendTo(contents);

        this.buttons.cancel = new Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', this.onCloseClick.bind(this))
            .appendTo(contents);

    }

    /**
     * The valuechange event handler
     *
     * @private
     */
    onValueChange() {
        let radius    = '';

        radius += `${this.fields.tlw.getValue()}px `;
        radius += `${this.fields.trw.getValue()}px `;
        radius += `${this.fields.brw.getValue()}px `;
        radius += `${this.fields.blw.getValue()}px `;
        radius += '/ ';
        radius += `${this.fields.tlh.getValue()}px `;
        radius += `${this.fields.trh.getValue()}px `;
        radius += `${this.fields.brh.getValue()}px `;
        radius += `${this.fields.blh.getValue()}px`;

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

		Object.entries(this.fields).forEach(([key, field]) => {
            field.setValue(parseInt(values[key], 10), true);
        });

        return this;
    }

    /**
     * Get the current value
     *
     * @return {String} The value in CSS border-radius format
     */
    getValue() {
        return this.preview.css('border-radius');
    }

    /**
     * The apply button's click event handler
     *
     * @private
     */
    onApplyClick(){
        this.triggerEvent('submit', {'overlay': this, 'value': this.getValue()}, true, false);
        this.hide();
    }

}
