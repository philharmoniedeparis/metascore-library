import Overlay from '../Overlay';
import Dom from '../../Dom';
import Icon from '../Icon';
import Locale from '../../Locale';

import loading_icon from '../../../../img/core/loading.svg?svg-sprite';

import {className} from '../../../../css/core/ui/overlay/LoadMask.scss';

/**
 * A loading mask
 */
export default class LoadMask extends Overlay{

    static defaults = Object.assign({}, super.defaults, {
        'text': Locale.t('overlay.LoadMask.text', 'Loading...'),
        'bar': false,
        'barText': Locale.t('overlay.LoadMask.bar.text', '!percent%'),
    });

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean|Icon} [icon] A loading icon to use, or no icon if set to false
     * @property {String} [text='Loading...'] The text to display
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`loadmask ${className}`);

        this.setProgress(0);
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        if(this.configs.icon !== false){
            /**
             * The loading icon
             * @type {Icon}
             */
            this.icon = this.configs.icon instanceof Icon ? this.configs.icon : new Icon({'symbol': loading_icon});

            this.icon.insertAt(this.getContents(), 0);
        }

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
    }

    /**
    * Set the progress value
    *
    * @param {Number} value The progress value, between 0 and 100
    * @return {this}
    */
    setProgress(value){
        this.text_wrapper.text(Locale.formatString(this.configs.text, {'!percent': value}));

        if(this.bar){
            this.bar_progress.css('width', `${value}%`);
            this.bar_text.text(Locale.formatString(this.configs.barText, {'!percent': value}));
        }

        return this;
    }

    /**
     * keydown event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onKeyDown(evt){
        evt.preventDefault();
        evt.stopPropagation();
    }

}
