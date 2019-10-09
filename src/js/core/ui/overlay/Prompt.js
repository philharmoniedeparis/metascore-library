import Confirm from './Confirm';
import Locale from '../../Locale'
import TextInput from '../input/TextInput';
import {isFunction} from '../../utils/Var';

import {className} from '../../../../css/core/ui/overlay/Prompt.scss';

/**
 * An overlay to prompt use for input
 */
export default class Prompt extends Confirm{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs){
        super(configs);

        this.addClass(`prompt ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'default': '',
            'placeholder': '',
            'buttons': {
                'confirm': Locale.t('core.Prompt.buttons.confirm', 'OK'),
                'cancel': Locale.t('core.Prompt.buttons.cancel', 'Cancel')
            },
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input = new TextInput({
                'value': this.configs.default,
                'placeholder': this.configs.placeholder,
            })
            .addDelegate('input', 'keypress', this.onInputKeypress.bind(this))
            .appendTo(this.getContents());
    }

    onConfirmClick(){
        if(isFunction(this.configs.onConfirm)){
            const value = this.input.getValue();
            this.configs.onConfirm(value);
        }
    }

    /**
     * The keypress event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onInputKeypress(evt){
        if(evt.key === "Enter") {
            this.onConfirmClick();
            this.hide();
        }
    }

}