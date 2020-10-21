import Overlay from '../Overlay';
import Locale from '../../Locale';
import {isFunction} from '../../utils/Var';

import {className} from '../../../../css/core/ui/overlay/Confirm.scss';

/**
 * A confirm overlay to show a simple message with yes/no buttons
 */
export default class Confirm extends Overlay{

    static defaults = Object.assign({}, super.defaults, {
        'confirmLabel': Locale.t('core.Confirm.confirmLabel', 'Yes'),
        'cancelLabel': Locale.t('core.Confirm.cancelLabel', 'No'),
        'onConfirm': null,
        'onCancel': null
    });

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [confirmLabel='Yes'] The confirm button's label
     * @property {String} [cancelLabel='No'] The cancel button's label
     */
    constructor(configs){
        super(configs);

        this.addClass(`confirm ${className}`);
    }

    setupUI(){
        super.setupUI();

        this.addButton('confirm', this.configs.confirmLabel);
        this.addButton('cancel', this.configs.cancelLabel);

        this.addListener('buttonclick', (evt) => {
            const action = evt.detail.action;

            switch(action){
                case 'confirm':
                    this.onConfirmClick();
                    break;

                case 'cancel':
                    this.onCancelClick();
                    break;
            }
        });
    }

    onConfirmClick(){
        if(isFunction(this.configs.onConfirm)){
            this.configs.onConfirm(this);
        }
    }

    onCancelClick(){
        if(isFunction(this.configs.onCancel)){
            this.configs.onCancel(this);
        }
    }
}
