import Element from '../Element';
import Locale from '../../../core/Locale';
import CuePoint from '../../CuePoint';
import Dom from '../../../core/Dom';

/**
 * A content element
 *
 * @emits {apilinkclick} Fired when an api link is clicked
 * @param {Object} element The element instance
 * @param {String} hash The link's hash
 */
export default class Content extends Element {

    /**
     * @inheritdoc
    */
    static getProperties() {
        if (!this.properties) {
            this.properties = Object.assign({}, super.getProperties(), {
                'text': {
                    'type': 'string',
                    'label': Locale.t('component.element.Content.properties.text.label', 'Text'),
                    'getter': function(){
                        return this.contents.text();
                    }
                }
            });
        }

        return this.properties;
    }

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Content';
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this._auto_highlight_links = [];
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(name, value, skipAnimatedCheck = false){
        super.updatePropertyValue(name, value, skipAnimatedCheck);

        switch(name){
            case 'text':
                this.contents.text(value);
                this.updateLinksAutoHighlighting();
                break;
        }

        return this;
    }

    /**
     * Setup/update play links auto-highlighting cuepoints
     */
    updateLinksAutoHighlighting() {
        // Deactivate and remove old cuepoints
        this._auto_highlight_links.forEach((e) => {
            e.cuepoint.deactivate();
        });
        this._auto_highlight_links = [];

        // Add cuepoints for all play links with inTime and outTime.
        this.contents.find('a[data-auto-highlight]').forEach((link) => {
            let matches = link.hash.match(/^#play=(\d*\.?\d+)?,(\d*\.?\d+)?,(.+)$/);
            if(matches){
                const cuepoint = new CuePoint({
                        'inTime': parseFloat(matches[1]),
                        'outTime': parseFloat(matches[2])
                    })
                    .addListener('start', this.onLinkCuePointStart.bind(this, link))
                    .addListener('stop', this.onLinkCuePointStop.bind(this, link))
                    .activate();

                this._auto_highlight_links.push({
                    'el': link,
                    'cuepoint': cuepoint,
                });
            }
        });
    }

    /**
     * Link cuepoint start event handler
     *
     * @private
     * @param {HTMLElement} link
     */
    onLinkCuePointStart(link) {
        new Dom(link).addClass('highlight');
    }

    /**
     * Link cuepoint stop event handler
     *
     * @private
     * @param {HTMLElement} link
     */
    onLinkCuePointStop(link) {
        new Dom(link).removeClass('highlight');
    }

}
