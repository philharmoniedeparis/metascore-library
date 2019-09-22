import Alert from './Alert';
import Locale from '../../Locale'
import {isFunction} from '../../utils/Var'

/**
 * A confirm overlay to show a simple message with yes/no buttons
 */
export default class Confirm extends Alert{

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

    /**
     * Setup the overlay's UI
     * @private
     */
    setupUI(){
        // call parent method
        super.setupUI();

        this.addListener('buttonclick', (evt) => {
            if(evt.detail.action === 'confirm' && isFunction(this.configs.onConfirm)){
                this.configs.onConfirm(evt);
            }
            if(evt.detail.action === 'cancel' && isFunction(this.configs.onCancel)){
                this.configs.onCancel(evt);
            }
        });

    }
}
