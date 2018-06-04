import {Dom} from '../../Dom';
import {Locale} from '../../Locale';

export default class LoadMask extends PARENT{

    /**
     * A loading mask
     *
     * @class LoadMask
     * @namespace overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.text='Loading...'] The text to display
     */
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super(this.configs);

        this.addClass('loadmask');

        this.text = new Dom('<div/>', {'class': 'text', 'text': this.configs.text})
            .appendTo(this.contents);
    }

    static getDefaults(){
        return {
            'text': Locale.t('overlay.LoadMask.text', 'Loading...')
        };
    }

}