import Dom from '../../../Dom';
import Locale from '../../../Locale';
import Button from '../../Button';

import {className} from '../../../../../css/core/ui/input/color/Swatches.scss';

/**
 * A color swatch selector
 */
export default class Swatches extends Dom {

    static defaults = {
        'colors': [
            '#FFFFFF',
            '#000000'
        ]
    };

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Mixed} [value=#fff}] The default value (see {@link toRGBA} for valid values)
     */
    constructor(configs) {
        // call the super constructor.
        super('<div/>', {'class': `swatches ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        this.setupUI();
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        const top = new Dom('<div/>', {'class': 'top'})
            .appendTo(this);

        this.configs.colors.forEach((color) => {
            new Dom('<button/>', {'class': 'swatch', 'type': 'button'})
                .css('background-color', color)
                .data('action', 'swatch')
                .data('value', color)
                .appendTo(top);
        });

        const bottom = new Dom('<div/>', {'class': 'bottom'})
            .appendTo(this);

        new Button({'label': Locale.t('core.ui.input.color.Swatches.reset.label', 'Reset')})
            .data('action', 'reset')
            .appendTo(bottom);

        new Button({'label': Locale.t('core.ui.input.color.Swatches.cancel.label', 'Cancel')})
            .data('action', 'cancel')
            .appendTo(bottom);

        this.addDelegate('button', 'click', this.onButtonClick.bind(this));
    }

    /**
     * Button click event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onButtonClick(evt){
        const target = new Dom(evt.target);
        const action = target.data('action');
        const data = {'swatches': this, 'button': action};

        if (action === 'swatch') {
            data.value = target.data('value');
        }

        this.triggerEvent('buttonclick', data);
    }

}
