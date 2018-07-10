import Element from '../Element';
import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale';

/**
 * Fired when a page link is clicked
 *
 * @event page
 * @param {Object} element The element instance
 * @param {String} block The block's name
 * @param {Integer} index The page index
 */
const EVT_PAGE = 'page';

/**
 * Fired when a play link is clicked
 *
 * @event play
 * @param {Object} element The element instance
 * @param {Number} inTime The start time
 * @param {Number} outTime The end time
 * @param {Integer} rIndex The reading index
 */
const EVT_PLAY = 'play';

/**
 * Fired when a block visibility link is clicked
 *
 * @event block_visibility
 * @param {Object} element The element instance
 * @param {String} block The block's name
 * @param {String} action The action to perform
 */
const EVT_BLOCK_VISIBILITY = 'block_visibility';

export default class Text extends Element {

    /**
     * A text element
     *
     * @class Cursor
     * @namespace player.component.element
     * @extends player.component.Element
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addDelegate('a', 'click', this.onLinkClick.bind(this));
    }

    static getDefaults(){
        let defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'text-locked': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.element.Text.locked', 'Text locked?')
                    }
                },
                'text': {
                    'editable':false,
                    'getter': function(){
                        return this.contents.text();
                    },
                    'setter': function(value){
                        this.contents.text(value);
                    }
                }
            })
        });
    }

    static getType(){
        return 'Text';
    }

    /**
     * The link click event handler
     *
     * @method onLinkClick
     * @private
     * @param {Event} evt The event object
     */
    onLinkClick(evt){
        let link = evt.target;

        if(!Dom.is(link, 'a')){
            link = Dom.closest(link, 'a');
        }

        if(link){
            let matches = link.hash.match(/^#page=([^,]*),(\d+)$/);
            if(matches){
                this.triggerEvent(EVT_PAGE, {'element': this, 'block': decodeURIComponent(matches[1]), 'index': parseInt(matches[2], 10)-1});
                evt.preventDefault();
                return;
            }

            matches = link.hash.match(/^#play=(\d*\.?\d+),(\d*\.?\d+),(\d+)$/)
            if(matches){
                this.triggerEvent(EVT_PLAY, {'element': this, 'inTime': parseFloat(matches[1]), 'outTime': parseFloat(matches[2]) - 1, 'rIndex': parseInt(matches[3], 10)});
                evt.preventDefault();
                return;
            }

            matches = link.hash.match(/^#(show|hide|toggle)Block=(.*)$/)
            if(matches){
                this.triggerEvent(EVT_BLOCK_VISIBILITY, {'element': this, 'block': decodeURIComponent(matches[2]), 'action': matches[1]});
                evt.preventDefault();
                return;
            }

            window.open(link.href, '_blank');
            evt.preventDefault();
        }

    }

}
