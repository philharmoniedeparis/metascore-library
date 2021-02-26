import Overlay from '../Overlay';
import Dom from '../../Dom';
import Locale from '../../Locale';
import NumberInput from '../input/NumberInput';
import CombinedInputs from '../input/CombinedInputs';

import {className} from '../../../../css/core/ui/overlay/BorderRadius.scss';

/**
 * An overlay that simplifies the creation of a CSS border-radius value
 *
 * @emits {submit} Fired when the submit button is clicked
 * @param {Object} overlay The overlay instance
 * @param {String} value The border radius value in CSS format
 */
export default class BorderRadius extends Overlay {

    static properties = [
        'top-left',
        'top-right',
        'bottom-right',
        'bottom-left'
    ];

    static defaults = Object.assign({}, super.defaults, {
        'toolbar': true,
        'title': Locale.t('editor.overlay.BorderRadius.title', 'Border Radius'),
        'format': 'css'
    });

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
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
     * @inheritdoc
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

        this.constructor.properties.forEach((property) => {
            this.inputs[property] = new CombinedInputs({
                    'inputs': [
                        {'type': NumberInput, 'configs': {'min': 0}},
                        {'type': NumberInput, 'configs': {'min': 0}}
                    ]
                })
                .data('property', property)
                .appendTo(this.preview);
        });


        this.addListener('valuechange', this.onValueChange.bind(this));

        this.addButton('apply', 'Apply');
        this.addButton('cancel', 'Cancel');
    }

    /**
     * The valuechange event handler
     *
     * @private
     */
    onValueChange() {
        const values = [[], []];
        Object.values(this.inputs).forEach((input) => {
            const value = input.getValue();
            values[0].push(value[0]);
            values[1].push(value[1]);
        });

        let radius    = '';
        radius += `${values[0].join('px ')}px`;
        radius += '/ ';
        radius += `${values[1].join('px ')}px`;

        this.preview.css('border-radius', radius);
    }

    /**
     * Set the current value
     *
     * @param {String} val The value in CSS border-radius format
     * @return {this}
     */
    setValue(val){
        this.preview.css('border-radius', val !== null ? val : 0);

        Object.entries(this.inputs).forEach(([property, input]) => {
            const css = this.preview.css(`border-${property}-radius`, void 0, true);
            const value = [0, 0];

            if (css !== null) {
                const matches = css.match(/(\d*)px/g);

                if(matches){
                    if(matches.length > 1){
                        value[0] = parseInt(matches[0], 10);
                        value[1] = parseInt(matches[1], 10);
                    }
                    else{
                        value[0] = value[1] = parseInt(matches[0], 10);
                    }
                }
            }

            input.setValue(value, true);
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
            case 'object': {
                const value = {};
                Object.entries(this.inputs).forEach(([property, input]) => {
                    value[property] = input.getValue();
                });
                return value;
            }

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
