import Confirm from './Confirm';
import Locale from '../../Locale'
import TextInput from '../input/TextInput';
import {isFunction} from '../../utils/Var';

import {className} from '../../../../css/core/ui/overlay/Prompt.scss';

/**
 * An overlay to prompt use for input
 */
export default class Prompt extends Confirm{

    static defaults = Object.assign({}, super.defaults, {
        'default': '',
        'placeholder': '',
        'confirmLabel': Locale.t('core.Prompt.confirmLabel', 'OK'),
        'cancelLabel': Locale.t('core.Prompt.cancelLabel', 'Cancel'),
    });

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

    show(){
        super.show();

        this.input.focus();

        return this;
    }

    onConfirmClick(){
        if(isFunction(this.configs.onConfirm)){
            const value = this.input.getValue();
            this.configs.onConfirm(value, this);
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

            if(this.configs.autoHide){
                this.hide();
            }

            evt.stopPropagation();
        }
    }

}
