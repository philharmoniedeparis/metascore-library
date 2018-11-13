import Dom from '../core/Dom';
import Locale from '../core/Locale';

/**
 * A pager for block components
 */
export default class Pager extends Dom{

    /**
     * Instantiate
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'pager'});

        /**
         * The count container
         * @type {Dom}
         */
        this.count = new Dom('<div/>', {'class': 'count'})
            .appendTo(this);

        /**
         * The buttons container
         * @type {Dom}
         */
        this.buttons = new Dom('<div/>', {'class': 'buttons'})
            .addListener('mousedown', (evt) => {
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
     * @param {Integer} index The index of the block's active page
     * @param {Integer} count The number of pages
     * @return {this}
     */
    updateCount(index, count){
        this.count.text(Locale.t('player.Pager.count', 'page !current/!count', {'!current': (index + 1), '!count': count}));

        this.buttons.first.toggleClass('inactive', index < 1);
        this.buttons.previous.toggleClass('inactive', index < 1);
        this.buttons.next.toggleClass('inactive', index >= count - 1);

        return this;
    }

}
