import {Dom} from '../core/Dom';
import {Locale} from '../core/Locale';

export default class Pager extends Dom{

    /**
     * A pager for block components
     *
     * @class Pager
     * @namespace player
     * @extends Dom
     * @constructor
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'pager'});

        this.count = new Dom('<div/>', {'class': 'count'})
            .appendTo(this);

        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .addListener('mousedown', function(evt){
                evt.stopPropagation();
            })
            .appendTo(this);

        this.buttons.first = new Dom('<div/>', {'class': 'button', 'data-action': 'first'})
            .appendTo(this.buttons);
        this.buttons.previous = new Dom('<div/>', {'class': 'button', 'data-action': 'previous'})
            .appendTo(this.buttons);
        this.buttons.next = new Dom('<div/>', {'class': 'button', 'data-action': 'next'})
            .appendTo(this.buttons);
    }

    /**
     * Update the page counter
     * 
     * @method updateCount
     * @param {Integer} index The index of the block's active page
     * @param {Integer} count The number of pages
     * @chainable
     */
    updateCount(index, count){
        this.count.text(Locale.t('player.Pager.count', 'page !current/!count', {'!current': (index + 1), '!count': count}));

        this.buttons.first.toggleClass('inactive', index < 1);
        this.buttons.previous.toggleClass('inactive', index < 1);
        this.buttons.next.toggleClass('inactive', index >= count - 1);

        return this;
    };

}