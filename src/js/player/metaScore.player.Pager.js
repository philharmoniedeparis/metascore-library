/**
 * @module Player
 */

metaScore.namespace('player').Pager = (function () {

    /**
     * A pager for block components
     *
     * @class Pager
     * @namespace player
     * @extends Dom
     * @constructor
     */
    function Pager() {
        // call parent constructor
        Pager.parent.call(this, '<div/>', {'class': 'pager'});

        this.count = new metaScore.Dom('<div/>', {'class': 'count'})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .addListener('mousedown', function(evt){
                evt.stopPropagation();
            })
            .appendTo(this);

        this.buttons.first = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'first'})
            .appendTo(this.buttons);
        this.buttons.previous = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'previous'})
            .appendTo(this.buttons);
        this.buttons.next = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'next'})
            .appendTo(this.buttons);
    }

    metaScore.Dom.extend(Pager);

    /**
     * Update the page counter
     * 
     * @method updateCount
     * @param {Integer} index The index of the block's active page
     * @param {Integer} count The number of pages
     * @chainable
     */
    Pager.prototype.updateCount = function(index, count){
        this.count.text(metaScore.Locale.t('player.Pager.count', 'page !current/!count', {'!current': (index + 1), '!count': count}));

        this.buttons.first.toggleClass('inactive', index < 1);
        this.buttons.previous.toggleClass('inactive', index < 1);
        this.buttons.next.toggleClass('inactive', index >= count - 1);

        return this;
    };

    return Pager;

})();