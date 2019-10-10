import Overlay from '../Overlay';
import Locale from '../../Locale';
import {isFunction} from '../../utils/Var';

/**
 * A confirm overlay to show a simple message with yes/no buttons
 */
export default class Confirm extends Overlay{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [text=''] The message's text
     */
    constructor(configs){
        super(configs);

        this.addClass(`confirm`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'buttons': {
                'confirm': Locale.t('core.Confirm.buttons.yes', 'Yes'),
                'cancel': Locale.t('core.Confirm.buttons.no', 'No')
            },
            'onConfirm': null,
            'onCancel': null
        });
    }

    setupUI(){
        super.setupUI();

        this.addListener('buttonclick', (evt) => {
            const action = evt.detail.action;

            switch(action){
                case 'confirm':
                    this.onConfirmClick(evt);
                    break;

                case 'cancel':
                    this.onCancelClick(evt);
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
