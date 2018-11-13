import Overlay from '../Overlay';
import Dom from '../../Dom';
import Locale from '../../Locale';

import {className} from '../../../../css/core/ui/overlay/LoadMask.less';

/**
 * A loading mask
 */
export default class LoadMask extends Overlay{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [text='Loading...'] The text to display
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`loadmask ${className}`);

        /**
         * The text container
         * @type {Dom}
         */
        this.text = new Dom('<div/>', {'class': 'text', 'text': this.configs.text})
            .appendTo(this.getContents());

        if(this.configs.bar){
            this.addClass('with-bar');

            /**
             * The load bar
             * @type {Dom}
             */
            this.bar = new Dom('<div/>', {'class': 'bar'})
                .appendTo(this.getContents());

            /**
             * The load bar's progress
             * @type {Dom}
             */
            this.bar_progress = new Dom('<div/>', {'class': 'progress'})
                .appendTo(this.bar);

            /**
             * The load bar's text container
             * @type {Dom}
             */
            this.bar_text = new Dom('<span/>', {'class': 'text'})
                .appendTo(this.bar);
        }

        this.setProgress(0);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'text': Locale.t('overlay.LoadMask.text', 'Loading...'),
            'bar': false,
            'barText': Locale.t('overlay.LoadMask.bar.text', '!percent%'),
        });
    }

    /**
    * Set the progress value
    *
    * @param {Number} value The progress value, between 0 and 100
    * @return {this}
    */
    setProgress(value){
        this.text.text(Locale.formatString(this.configs.text, {'!percent': value}));

        if(this.bar){
            this.bar_progress.css('width', `${value}%`);
            this.bar_text.text(Locale.formatString(this.configs.barText, {'!percent': value}));
        }

        return this;
    }

}
