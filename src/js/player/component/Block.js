import Component from '../Component';
import Dom from '../../core/Dom';
import Pager from '../Pager';
import Page from './Page';
import Locale from '../../core/Locale';
import {toCSS} from '../../core/utils/Color';
import {isString, isNumber} from '../../core/utils/Var';
import Draggable from '../../core/ui/Draggable';
import Resizable from '../../core/ui/Resizable';

/**
 * A block component
 *
 * @emits {pageadd} Fired when a page is added
 * @param {Block} block The block instance
 * @param {Page} page The page instance
 * @emits {pageremove} Fired when a page is removed
 * @param {Block} block The block instance
 * @param {Page} page The page instance
 * @emits {pageactivate} Fired when the active page is set
 * @param {Block} block The block instance
 * @param {Page} current The currently active page instance
 * @param {Page} previous The previously active page instance
 * @param {String} basis The reason behind this action
 */
export default class Block extends Component {

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'editable': false,
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'name': {
                    'type': 'Text',
                    'configs': {
                        'label': Locale.t('player.component.Block.name', 'Name')
                    },
                    'getter': function(){
                        return this.data('name');
                    },
                    'setter': function(value){
                        this.data('name', value);
                    }
                },
                'locked': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.Block.locked', 'Locked?')
                    },
                    'getter': function(){
                        return this.data('locked') === "true";
                    },
                    'setter': function(value){
                        this.data('locked', value ? "true" : null);
                    }
                },
                'hidden': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.Block.hidden', 'Hidden?')
                    },
                    'getter': function(){
                        return this.data('hidden') === "true";
                    },
                    'setter': function(value){
                        this.data('hidden', value ? "true" : null);
                    }
                },
                'x': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Block.x', 'X'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Block.y', 'Y'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    },
                },
                'width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Block.width', 'Width'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    },
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Block.height', 'Height'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    },
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'z-index': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.z-index', 'Display index')
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('z-index', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('z-index', value);
                    }
                },
                'background-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.Block.background-color', 'Background color')
                    },
                    'getter': function(skipDefault){
                        return this.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('background-color', toCSS(value));
                    }
                },
                'background-image': {
                    'type':'Image',
                    'configs': {
                        'label': Locale.t('player.component.Block.background-image', 'Background image'),
                        'resizeButton': true
                    },
                    'getter': function(skipDefault){
                        let value = this.css('background-image', void 0, skipDefault);

                        if(value === 'none' || !isString(value)){
                            return null;
                        }

                        value = value.replace(/^url\(["']?/, '');
                        value = value.replace(/["']?\)$/, '');
                        value = value.replace(document.baseURI, '');

                        return value;
                    },
                    'setter': function(value){
                        const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                        this.css('background-image', css_value);
                    }
                },
                'border-width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Block.border-width', 'Border width'),
                        'min': 0
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('border-width', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.Block.border-color', 'Border color')
                    },
                    'getter': function(skipDefault){
                        return this.css('border-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-color', toCSS(value));
                    }
                },
                'border-radius': {
                    'type': 'BorderRadius',
                    'configs': {
                        'label': Locale.t('player.component.Block.border-radius', 'Border radius')
                    },
                    'getter': function(skipDefault){
                        return this.css('border-radius', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-radius', value);
                    }
                },
                'synched': {
                    'editable': false,
                    'getter': function(){
                        return this.data('synched') === "true";
                    },
                    'setter': function(value){
                        this.data('synched', value);
                    }
                },
                'pages': {
                    'editable':false,
                    'getter': function(skipDefault){
                        const pages = [];

                        this.getPages().forEach((page) => {
                            pages.push(page.getPropertyValues(skipDefault));
                        });

                        return pages;
                    },
                    'setter': function(value){
                        this.removeAllPages();

                        value.forEach((configs) => {
                            this.addPage(configs);
                        });

                        this.setActivePage(0);
                    }
                }
            })
        });
    }

    /**
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return 'Block';
    }

    /**
     * Setup the block's UI
     *
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this.addClass('block');

        /**
         * The pages container
         * @type {Dom}
         */
        this.page_wrapper = new Dom('<div/>', {'class': 'pages'})
            .addDelegate('.page', 'cuepointstart', this.onPageCuePointStart.bind(this))
            .appendTo(this);

        /**
         * The pager
         * @type {Pager}
         */
        this.pager = new Pager()
            .addDelegate('.button', 'click', this.onPagerClick.bind(this))
            .appendTo(this);

        return this;
    }

    /**
     * Page cuepointstart event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPageCuePointStart(evt){
        this.setActivePage(evt.target._metaScore, true);
    }

    /**
     * Pager click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPagerClick(evt){
        const active = !Dom.hasClass(evt.target, 'inactive');

        if(active){
            const action = Dom.data(evt.target, 'action');

            switch(action){
                case 'first':
                    this.setActivePage(0);
                    break;
                case 'previous':
                    this.setActivePage(this.getActivePageIndex() - 1);
                    break;
                case 'next':
                    this.setActivePage(this.getActivePageIndex() + 1);
                    break;
            }
        }

        evt.stopPropagation();
    }

    /**
     * Get the block's pages
     *
     * @return {Array} List of pages
     */
    getPages() {
        const pages = [];

        this.page_wrapper.children('.page').forEach((dom) => {
            pages.push(dom._metaScore);
        });

        return pages;
    }

    /**
     * Get a page by index
     *
     * @param {Integer} index The page's index
     * @return {Page} The page
     */
    getPage(index){
        const page = this.page_wrapper.child(`.page:nth-child(${index+1})`).get(0);

        return page ? page._metaScore : null;
    }

    /**
     * Add a page
     *
     * @param {Object|Page} configs Page configs or an existing Page instance
     * @param {Integer} [index] The new page's index, page is appended if not given
     * @param {Boolean} [supressEvent=false] Whether to supress the pageadd event
     * @return {Page} The added page
     */
    addPage(configs, index, supressEvent){
        const existing = configs instanceof Page;
        let page = null;

        if(existing){
            page = configs;

            if(isNumber(index)){
                page.insertAt(this.page_wrapper, index);
            }
            else{
                page.appendTo(this.page_wrapper);
            }
        }
        else{
            page = new Page(Object.assign({}, configs, {
                'container': this.page_wrapper,
                'index': index
            }));
        }

        if(supressEvent !== true){
            this.triggerEvent('pageadd', {'block': this, 'page': page, 'new': !existing});
        }

        this.setActivePage(page);

        return page;
    }

    /**
     * Remove a page
     *
     * @param {Page} page The page to remove
     * @param {Boolean} [supressEvent=false] Whether to supress the pageremove event
     * @return {Page} The removed page
     */
    removePage(page, supressEvent){
        page.remove();

        if(supressEvent !== true){
            this.triggerEvent('pageremove', {'block': this, 'page': page});
        }

        return page;
    }

    /**
     * Remove all pages
     *
     * @return {this}
     */
    removeAllPages() {
        this.page_wrapper.children('.page').remove();

        return this;
    }

    /**
     * Get the index of a page
     *
     * @param {Page} page The page
     * @return {Integer} The page's index
     */
    getPageIndex(page){
        return this.getPages().indexOf(page);
    }

    /**
     * Get the currently active page
     *
     * @return {Page} The page
     */
    getActivePage() {
        return this.getPage(this.getActivePageIndex());
    }

    /**
     * Get the index of the currently active page
     *
     * @return {Integer} The index
     */
    getActivePageIndex() {
        return this.page_wrapper.children('.page').index('.active');
    }

    /**
     * Get the page count
     *
     * @return {Integer} The number of pages
     */
    getPageCount() {
        return this.page_wrapper.children('.page').count();
    }

    /**
     * Set the active page
     *
     * @param {Mixed} page The page to activate or its index
     * @param {Boolean} [supressEvent=false] Whether to supress the pageactivate event
     * @return {this}
     */
    setActivePage(page, supressEvent){
        const previous = this.getActivePage();
        let _page = page;

        if(isNumber(page)){
            _page = this.getPage(page);
        }

        if(_page instanceof Page){
			this.getPages().forEach((other_page) => {
                other_page.removeClass('active');
            });

            _page.addClass('active');

            this.updatePager();

            if(supressEvent !== true){
                this.triggerEvent('pageactivate', {'block': this, 'current': _page, 'previous': previous});
            }
        }

        return this;
    }

    /**
     * Update the pager
     *
     * @private
     * @return {this}
     */
    updatePager() {
        const index = this.getActivePageIndex();
        const count = this.getPageCount();

        this.pager.updateCount(index, count);

        this.data('page-count', count);

        return this;
    }

    /**
     * Set/Unset the draggable behaviour
     *
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    setDraggable(draggable){
        if(this.getPropertyValue('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            /**
             * The draggable behavior
             * @type {Draggable}
             */
            this._draggable = new Draggable({
                'target': this,
                'handle': this.child('.pager'),
                'limits': {
                    'top': 0,
                    'left': 0
                }
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    }

    /**
     * Set/Unset the resizable behaviour
     *
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    setResizable(resizable){
        if(this.getPropertyValue('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            /**
             * The resizable behavior
             * @type {Resizable}
             */
            this._resizable = new Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    }

}
