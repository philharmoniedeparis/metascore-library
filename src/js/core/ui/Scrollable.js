import Dom from '../Dom';
import ResizeObserver from 'resize-observer-polyfill';

import {className} from '../../../css/core/ui/Scrollable.less';

/**
 * A class for adding resizable behaviors
 * Inspired by Vitor Buzinaro's SimpleScrollbar (https://github.com/buzinas/simple-scrollbar)
 *
 * @emits {resizestart} Fired when a resize started
 * @emits {resize} Fired when a resize occured
 * @emits {resizeend} Fired when a resize ended
 */
export default class Scrollable {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Dom} scrollWrapper A Dom object to use as the scroll wrapper element
     * @property {Dom} contentWrapper A Dom object to use as the content wrapper element
     */
    constructor(configs) {
        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // fix event handlers scope
        this.onContentScroll = this.onContentScroll.bind(this);
        this.onContentMouseEnter = this.onContentMouseEnter.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onBarMousedown = this.onBarMousedown.bind(this);
        this.onDocMousemove = this.onDocMousemove.bind(this);
        this.onDocMouseup = this.onDocMouseup.bind(this);

        this.direction = this.configs.contentWrapper.css('direction');

        if(this.direction === 'rtl'){
            this.content_wrapper.addClass('rtl');
        }

        this.bar = new Dom("<div/>", {'class': 'scrollbar'})
            .appendTo(this.configs.target);

        this.resize_observer = new ResizeObserver(this.onResize);

        this.enable();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'target': null,
            'scrollWrapper': null,
            'contentWrapper': null,
        };
    }

    onContentScroll(){
        this.updateBar();
    }

    onContentMouseEnter(){
        this.updateBar();
    }

    onResize(){
        this.updateBar();
    }

    onBarMousedown(evt){
        this.last_page_y = evt.pageY;

        this.configs.target.addClass('scrolling');

        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.configs.target.get(0)));
        }

        this.doc
            .addListener('mousemove', this.onDocMousemove)
            .addListener('mouseup', this.onDocMouseup);

        evt.stopPropagation();
        evt.preventDefault();
    }

    onDocMousemove(evt){
        const delta = evt.pageY - this.last_page_y;

        this.last_page_y = evt.pageY;

        window.requestAnimationFrame(() => {
            this.configs.contentWrapper.get(0).scrollTop += delta / this.scroll_ratio;
        });

        evt.stopPropagation();
        evt.preventDefault();
    }

    onDocMouseup(evt){
        this.last_page_y = evt.pageY;

        this.configs.target.removeClass('scrolling');

        this.doc
            .removeListener('mousemove', this.onDocMousemove)
            .removeListener('mouseup', this.onDocMouseup);

        evt.stopPropagation();
        evt.preventDefault();
    }

    updateBar(){
        const content_wrapper_el = this.configs.contentWrapper.get(0);

        const total_height = content_wrapper_el.scrollHeight;
        const own_height = content_wrapper_el.clientHeight;

        this.scroll_ratio = own_height / total_height;

        window.requestAnimationFrame(() => {
            // Hide scrollbar if no scrolling is possible
            if(this.scroll_ratio >= 1) {
                this.bar.hide();
            }
            else {
                const target_width = this.configs.target.get(0).clientWidth;
                const bar_width = this.bar.get(0).clientWidth;

                const height = Math.max(this.scroll_ratio * 100, 10);
                const top = (content_wrapper_el.scrollTop / total_height ) * 100;

                const right = this.direction === 'rtl' ? (target_width - bar_width + 18) : (target_width - bar_width) * -1;

                this.bar
                    .show()
                    .css('height', `${height}%`)
                    .css('top', `${top}%`)
                    .css('right', `${right}px`);
            }
        });
    }

    /**
     * Enable the behavior
     *
     * @return {this}
     */
    enable() {
        this.configs.target.addClass(`scrollable ${className}`);

        this.configs.scrollWrapper.addClass('scroll-wrapper');

        this.configs.contentWrapper
            .addClass('content-wrapper')
            .addListener('scroll', this.onContentScroll)
            .addListener('mouseenter', this.onContentMouseEnter);

        this.bar.addListener('mousedown', this.onBarMousedown);

        this.resize_observer.observe(this.configs.scrollWrapper.get(0));

        /**
         * Whether the behavior is enabled
         * @type {Boolean}
         */
        this.enabled = true;

        return this;
    }

    /**
     * Disable the behavior
     *
     * @return {this}
     */
    disable() {
        this.configs.scrollWrapper.removeClass(`scrollable ${className}`);

        this.configs.scrollWrapper.removeClass('scroll-wrapper');

        this.configs.contentWrapper
            .removeClass('content-wrapper')
            .removeListener('scroll', this.onContentScroll)
            .removeListener('mouseenter', this.onContentMouseEnter);

        this.bar.removeListener('mousedown', this.onBarMousedown);

        this.resize_observer.unobserve(this.configs.scrollWrapper.get(0));

        this.enabled = false;

        return this;
    }

    /**
     * Destroy the behavior
     *
     * @return {this}
     */
    destroy() {
        this.disable();

        this.bar.remove();

        return this;
    }

}
