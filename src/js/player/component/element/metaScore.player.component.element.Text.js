/**
 * @module Player
 */

metaScore.namespace('player.component.element').Text = (function () {

    /**
     * Fired when a page link is clicked
     *
     * @event page
     * @param {Object} element The element instance
     * @param {String} block The block's name
     * @param {Integer} index The page index
     */
    var EVT_PAGE = 'page';

    /**
     * Fired when a play link is clicked
     *
     * @event play
     * @param {Object} element The element instance
     * @param {Number} inTime The start time
     * @param {Number} outTime The end time
     * @param {Integer} rIndex The reading index
     */
    var EVT_PLAY = 'play';

    /**
     * Fired when a block visibility link is clicked
     *
     * @event block_visibility
     * @param {Object} element The element instance
     * @param {String} block The block's name
     * @param {String} action The action to perform
     */
    var EVT_BLOCK_VISIBILITY = 'block_visibility';

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
    function Text(configs) {
        // call parent constructor
        Text.parent.call(this, configs);

        this.addDelegate('a', 'click', metaScore.Function.proxy(this.onLinkClick, this));
    }

    metaScore.player.component.Element.extend(Text);

    Text.defaults = {
        'properties': metaScore.Object.extend({}, Text.parent.defaults.properties, {
            'text-locked': {
                'type': 'Checkbox',
                'configs': {
                    'label': metaScore.Locale.t('player.component.element.Text.locked', 'Text locked?')
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
    };

    /**
     * Setup the text's UI
     * 
     * @method setupUI
     * @private
     */
    Text.prototype.setupUI = function(){
        // call parent function
        Text.parent.prototype.setupUI.call(this);

        this.data('type', 'Text');
    };

    /**
     * The link click event handler
     *
     * @method onLinkClick
     * @private
     * @param {Event} evt The event object
     */
    Text.prototype.onLinkClick = function(evt){
        var link = evt.target,
            matches;

        if(!metaScore.Dom.is(link, 'a')){
            link = metaScore.Dom.closest(link, 'a');
        }

        if(link){
            if(matches = link.hash.match(/^#page=([^,]*),(\d+)$/)){
                this.triggerEvent(EVT_PAGE, {'element': this, 'block': decodeURIComponent(matches[1]), 'index': parseInt(matches[2])-1});
                evt.preventDefault();
            }
            else if(matches = link.hash.match(/^#play=(\d*\.?\d+),(\d*\.?\d+),(\d+)$/)){
                this.triggerEvent(EVT_PLAY, {'element': this, 'inTime': parseFloat(matches[1]), 'outTime': parseFloat(matches[2]) - 1, 'rIndex': parseInt(matches[3])});
            }
            else if(matches = link.hash.match(/^#(show|hide|toggle)Block=(.*)$/)){
                this.triggerEvent(EVT_BLOCK_VISIBILITY, {'element': this, 'block': decodeURIComponent(matches[2]), 'action': matches[1]});
            }
            else{
                window.open(link.href, '_blank');
            }

            evt.preventDefault();
        }

    };

    return Text;

})();