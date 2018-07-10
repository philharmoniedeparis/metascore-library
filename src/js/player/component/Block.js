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
 * Fired when a page is added
 *
 * @event pageadd
 * @param {Block} block The block instance
 * @param {Page} page The page instance
 */
const EVT_PAGEADD = 'pageadd';

/**
 * Fired when a page is removed
 *
 * @event pageremove
 * @param {Block} block The block instance
 * @param {Page} page The page instance
 */
const EVT_PAGEREMOVE = 'pageremove';

/**
 * Fired when the active page is set
 *
 * @event pageactivate
 * @param {Block} block The block instance
 * @param {Page} current The currently active page instance
 * @param {Page} previous The previously active page instance
 * @param {String} basis The reason behind this action
 */
const EVT_PAGEACTIVATE = 'pageactivate';

/**
 * A block component
 */
export default class Block extends Component {

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'properties': {
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
                        const value = parseInt(this.css('z-index', undefined, skipDefault), 10);
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
                        return this.css('background-color', undefined, skipDefault);
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
                        let value = this.css('background-image', undefined, skipDefault);

                        if(value === 'none' || !isString(value)){
                            return null;
                        }

                        value = value.replace(/^url\(["']?/, '');
                        value = value.replace(/["']?\)$/, '');
                        value = value.replace(document.baseURI, '');

                        return value;
                    },
                    'setter': function(value){
                        value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                        this.css('background-image', value);
                    }
                },
                'border-width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Block.border-width', 'Border width'),
                        'min': 0
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('border-width', undefined, skipDefault), 10);
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
                        return this.css('border-color', undefined, skipDefault);
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
                        return this.css('border-radius', undefined, skipDefault);
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
                        this.removePages();

                        value.forEach((configs) => {
                            this.addPage(configs);
                        });

                        this.setActivePage(0);
                    }
                }
            }
        });
    }

    static getType(){
        return 'Block';
    }

    /**
     * Setup the block's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this.addClass('block');

        this.page_wrapper = new Dom('<div/>', {'class': 'pages'})
            .addDelegate('.page', 'cuepointstart', this.onPageCuePointStart.bind(this))
            .appendTo(this);

        this.pager = new Pager()
            .addDelegate('.button', 'click', this.onPagerClick.bind(this))
            .appendTo(this);
    }

    /**
     * Page cuepointstart event handler
     *
     * @method onPageCuePointStart
     * @private
     * @param {Event} evt The event object
     */
    onPageCuePointStart(evt){
        this.setActivePage(evt.target._metaScore, 'pagecuepoint');
    }

    /**
     * Pager click event handler
     *
     * @method onPagerClick
     * @private
     * @param {Event} evt The event object
     */
    onPagerClick(evt){
        let active = !Dom.hasClass(evt.target, 'inactive'),
            action;

        if(active){
            action = Dom.data(evt.target, 'action');

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
     * @method getPages
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
     * Add a page
     *
     * @method addPage
     * @params {Mixed} configs Page configs or a player.component.Page instance
     * @params {Integer} [index] The new page's index, page is appended if not given
     * @param {Boolean} [supressEvent=false] Whether to supress the pageadd event
     * @return {player.component.Page} The added page
     */
    addPage(configs, index, supressEvent){
        let page, page_index, sibling,
            existing = configs instanceof Page;

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

        page_index = this.getPageIndex(page);
        if(page_index > 0){
            sibling = this.getPage(page_index - 1);
            sibling.setPropertyValue('end-time', page.getPropertyValue('start-time'));
        }
        else if(this.getPageCount() > page_index + 1){
            sibling = this.getPage(page_index + 1);
            sibling.setPropertyValue('start-time', page.getPropertyValue('end-time'));
        }

        this.setActivePage(page);

        if(supressEvent !== true){
            this.triggerEvent(EVT_PAGEADD, {'block': this, 'page': page, 'new': !existing});
        }

        return page;
    }

    /**
     * Remove a page
     *
     * @method removePage
     * @params {player.component.Page} page The page to remove
     * @param {Boolean} [supressEvent=false] Whether to supress the pageremove event
     * @return {player.component.Page} The removed page
     */
    removePage(page, supressEvent){
        let page_index, sibling;

        page_index = this.getPageIndex(page);
        page.remove();

        if(page_index > 0){
            sibling = this.getPage(page_index - 1);
            sibling.setPropertyValue('end-time', page.getPropertyValue('end-time'));
        }
        else if(this.getPageCount() > page_index + 1){
            sibling = this.getPage(page_index + 1);
            sibling.setPropertyValue('start-time', page.getPropertyValue('start-time'));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_PAGEREMOVE, {'block': this, 'page': page});
        }

        return page;
    }

    /**
     * Remove all pages
     *
     * @method removePages
     * @chainable
     */
    removePages() {
        this.page_wrapper.children('.page').remove();

        return this;
    }

    /**
     * Get a page by index
     *
     * @method getPage
     * @param {Integer} index The page's index
     * @return {player.component.Page} The page
     */
    getPage(index){
        const page = this.page_wrapper.child(`.page:nth-child(${index+1})`).get(0);

        return page ? page._metaScore : null;
    }

    /**
     * Get the index of a page
     *
     * @method getPageIndex
     * @param {player.component.Page} page The page
     * @return {Integer} The page's index
     */
    getPageIndex(page){
        return this.getPages().indexOf(page);
    }

    /**
     * Get the currently active page
     *
     * @method getActivePage
     * @return {player.component.Page} The page
     */
    getActivePage() {
        return this.getPage(this.getActivePageIndex());
    }

    /**
     * Get the index of the currently active page
     *
     * @method getActivePageIndex
     * @return {Integer} The index
     */
    getActivePageIndex() {
        return this.page_wrapper.children('.page').index('.active');
    }

    /**
     * Get the page count
     *
     * @method getPageCount
     * @return {Integer} The number of pages
     */
    getPageCount() {
        return this.page_wrapper.children('.page').count();
    }

    /**
     * Set the active page
     *
     * @method setActivePage
     * @param {Mixed} page The page to activate or its index
     * @param {Boolean} [supressEvent=false] Whether to supress the pageactivate event
     * @chainable
     */
    setActivePage(page, basis, supressEvent){
        const previous = this.getActivePage();

        if(isNumber(page)){
            page = this.getPage(page);
        }

        if(page instanceof Page){
			this.getPages().forEach((other_page) => {
                other_page.removeClass('active');
            });

            page.addClass('active');

            this.updatePager();

            if(supressEvent !== true){
                this.triggerEvent(EVT_PAGEACTIVATE, {'block': this, 'current': page, 'previous': previous, 'basis': basis});
            }
        }

        return this;
    }

    /**
     * Update the pager
     *
     * @method updatePager
     * @private
     * @chainable
     */
    updatePager() {
        let index = this.getActivePageIndex(),
            count = this.getPageCount();

        this.pager.updateCount(index, count);

        this.data('page-count', count);

        return this;
    }

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    setDraggable(draggable){
        if(this.getPropertyValue('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
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
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    setResizable(resizable){
        if(this.getPropertyValue('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
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
