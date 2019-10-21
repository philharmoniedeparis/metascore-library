import Element from '../Element';
import Dom from '../../../core/Dom';

/**
 * A content element
 *
 * @emits {page} Fired when a page link is clicked
 * @param {Object} element The element instance
 * @param {String} block The block's name
 * @param {Integer} index The page index
 *
 * @emits {play} Fired when a play link is clicked
 * @param {Object} element The element instance
 * @param {Number} inTime The start time
 * @param {Number} outTime The end time
 * @param {String} scenario The scenario
 *
 * @emits {block_visibility} Fired when a block visibility link is clicked
 * @param {Object} element The element instance
 * @param {String} block The block's name
 * @param {String} action The action to perform
 */
export default class Content extends Element {

    /**
     *Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addDelegate('a, a *', 'click', this.onLinkClick.bind(this));
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'text': {
                    'type': 'string',
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

    /**
     * The link click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onLinkClick(evt){
        let link = evt.target;

        if(!Dom.is(link, 'a')){
            link = Dom.closest(link, 'a');
        }

        const href = Dom.attr(link, 'href');

        if((/^#/.test(href))){
            evt.preventDefault();

            let matches = link.hash.match(/^#page=([^,]*),(\d+)$/);
            if(matches){
                this.triggerEvent('page', {'element': this, 'block': decodeURIComponent(matches[1]), 'index': parseInt(matches[2], 10)-1});
                return;
            }

            matches = link.hash.match(/^#play=(\d*\.?\d+),(\d*\.?\d+),(.+)$/);
            if(matches){
                this.triggerEvent('play', {'element': this, 'inTime': parseFloat(matches[1]), 'outTime': parseFloat(matches[2]) - 1, 'scenario': matches[3]});
                return;
            }

            matches = link.hash.match(/^#(show|hide|toggle)Block=(.*)$/);
            if(matches){
                this.triggerEvent('block_visibility', {'element': this, 'block': decodeURIComponent(matches[2]), 'action': matches[1]});
            }
        }
        else{
            window.open(link.href, '_blank');
            evt.preventDefault();
        }

    }

}
