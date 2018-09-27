import Overlay from '../Overlay';
import Dom from '../../Dom';
import Locale from '../../Locale';

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

        if(this.configs.bar){
            this.addClass('with-bar');

            this.bar = new Dom('<div/>', {'class': 'bar'})
                .appendTo(this.contents);

            this.barProgress = new Dom('<div/>', {'class': 'progress'})
                .appendTo(this.bar);

            this.barText = new Dom('<span/>', {'class': 'text'})
                .appendTo(this.bar);
        }

        this.setProgress(0);
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'text': Locale.t('overlay.LoadMask.text', 'Loading...'),
            'bar': false,
            'barText': Locale.t('overlay.LoadMask.bar.text', '!percent%'),
        });
    }

    setProgress(value){
        this.text.text(Locale.formatString(this.configs.text, {'!percent': value}));

        if(this.bar){
            this.barProgress.css('width', `${value}%`);
            this.barText.text(Locale.formatString(this.configs.barText, {'!percent': value}));
        }
    }

}
