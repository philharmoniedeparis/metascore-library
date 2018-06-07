import Overlay from '../Overlay';
import Dom from '../../Dom';
import {t} from '../../Locale';

export default class LoadMask extends Overlay{

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
        // call parent constructor
        super(configs);

        this.addClass('loadmask');

        this.text = new Dom('<div/>', {'class': 'text', 'text': this.configs.text})
            .appendTo(this.contents);
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'text': t('overlay.LoadMask.text', 'Loading...')
        });
    }

}
