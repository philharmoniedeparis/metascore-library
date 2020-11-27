import Component from '../Component';
import {MasterClock} from '../../core/media/MediaClock';
import Dom from '../../core/Dom';
import Pager from './block/Pager';
import Page from './Page';
import {isNumber} from '../../core/utils/Var';
import Hammer from 'hammerjs';

/**
 * A block component
 *
 * @emits {componentadd} Fired when a page is added
 * @param {Component} component The page instance
 * @param {Boolean} new Whether the component was an already existing one, or a newly created one from configs
 */
export default class Block extends Component {

    static defaults = Object.assign({}, super.defaults, {
        'properties': Object.assign({}, super.defaults.properties, {
            'name': {
                'type': 'string'
            },
            'hidden': {
                'type': 'boolean'
            },
            'x': {
                'type': 'number',
                'default': 0
            },
            'y': {
                'type': 'number',
                'default': 0
            },
            'width': {
                'type': 'number',
                'default': 200,
                'getter': function() {
                    // Get value from CSS to honor CSS min and max values.
                    return parseInt(this.css('width'), 10);
                }
            },
            'height': {
                'type': 'number',
                'default': 200,
                'getter': function() {
                    // Get value from CSS to honor CSS min and max values.
                    return parseInt(this.css('height'), 10);
                }
            },
            'background-color': {
                'type': 'color'
            },
            'background-image': {
                'type': 'image'
            },
            'border-width': {
                'type': 'number'
            },
            'border-color': {
                'type': 'color'
            },
            'border-radius': {
                'type': 'string'
            },
            'synched': {
                'type': 'boolean',
                'default': false
            },
            'pager-visibility': {
                'type': 'string',
                'default': 'auto'
            },
            'pages': {
                'type': 'array',
                'getter': function(skipID){
                    const pages = [];

                    this.getChildren().forEach((page) => {
                        pages.push(page.getPropertyValues(skipID));
                    });

                    return pages;
                }
            }
        })
    });

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Block';
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('block');

        this.setupUI();
    }

    /**
     * @inheritdoc
     */
    init(){
        super.init();

        if(this.getChildrenCount() === 0){
            // add a page
            this.addPage();
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setupUI() {
        /**
         * The pages container
         * @type {Dom}
         */
        this.page_wrapper = new Dom('<div/>', {'class': 'pages'})
            .addListener('childremove', this.onPageRemove.bind(this))
            .addDelegate('.metaScore-component.page', 'activate', this.onPageActivate.bind(this))
            .addDelegate('.metaScore-component.page', 'deactivate', this.onPageDeactivate.bind(this))
            .appendTo(this);

        // Add the swipe gesture handler.
        new Hammer.Manager(this.page_wrapper.get(0), {
                'recognizers': [[Hammer.Swipe, {'direction': Hammer.DIRECTION_HORIZONTAL}]],
                'cssProps': {'userSelect': 'auto'} // Allow user selection.
            })
            .on('swipe', this.onPageWrapperSwipe.bind(this));

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
     * @inheritdoc
     */
    updatePropertyValue(name, value){
        switch(name){
            case 'pager-visibility':
                this.data(name, value);
                break;

            case 'pages':
                this.removeAllChildren();
                value.forEach((configs) => {
                    this.addPage(configs);
                });
                this.setActivePage(0);
                break;

            default:
                super.updatePropertyValue(name, value);
        }

        return this;
    }

    /**
     * Page wrapper swipe event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPageWrapperSwipe(evt){
        const index = this.getActivePageIndex();
        const count = this.getChildrenCount();

        switch(evt.direction){
            case Hammer.DIRECTION_LEFT:
                if(index < count - 1){
                    this.setActivePage(index + 1);
                }
                break;

            case Hammer.DIRECTION_RIGHT:
                if(index > 0){
                    this.setActivePage(index - 1);
                }
                break;
        }
    }

    /**
     * Pager click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPagerClick(evt){
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

        evt.stopPropagation();
    }

    /**
     * Page activate event handler
     *
     * @private
     */
    onPageActivate(){
        this.updatePager();
    }

    /**
     * Page deactivate event handler
     *
     * @private
     */
    onPageDeactivate(){
        this.updatePager();
    }

    /**
     * Page wrapper childremove event handler
     *
     * @private
     */
    onPageRemove(){
        this.updatePager();
    }

    /**
     * @inheritdoc
     */
    getChildren(){
        const children = [];

        this.page_wrapper.children('.metaScore-component').forEach((dom) => {
            children.push(dom._metaScore);
        });

        return children;
    }

    /**
     * @inheritdoc
     */
    getChildrenCount() {
        return this.page_wrapper.children('.metaScore-component').count();
    }

    /**
     * @inheritdoc
     */
    getChild(index){
        const child = this.page_wrapper.child(`.page:nth-child(${index+1})`).get(0);

        return child ? child._metaScore : null;
    }

    /**
     * @inheritdoc
     */
    removeAllChildren() {
        this.page_wrapper.children('.page').remove();

        return this;
    }

    /**
     * @inheritdoc
     */
    doActivate(supressEvent){
        this.active = true;
        this.addClass('active');

        if(this.getPropertyValue('synched')){
            this.getChildren().forEach((child) => {
                child.activate();
            });
        }
        else{
            this.setActivePage(0);
        }

        if(supressEvent !== true){
            this.triggerEvent('activate', {'component': this});
        }

        return this;
    }

    /**
     * Add a page
     *
     * @param {Object|Page} configs Page configs or an existing Page instance
     * @param {Integer} [index] The new page's index, page is appended if not given
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event
     * @return {Page} The added page
     */
    addPage(configs, index, supressEvent){
        let page = configs;
        const existing = page instanceof Page;

        if(!existing){
            page = new Page(configs);
        }

        if(isNumber(index)){
            page.insertAt(this.page_wrapper, index);
        }
        else{
            page.appendTo(this.page_wrapper);
        }

        this.updatePager();

        if(!existing){
            page.init();
        }

        if(this.isActive()){
            page.activate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': page, 'new': !existing});
        }

        return page;
    }

    /**
     * Get the currently active page
     *
     * @return {Page} The page
     */
    getActivePage() {
        return this.getChild(this.getActivePageIndex());
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
     * Set the active page
     *
     * @param {Mixed} page The page to activate or its index
     * @return {this}
     */
    setActivePage(page){
        if(this.isActive()){
            const previous = this.getActivePage();
            let _page = page;

            if(isNumber(page)){
                _page = this.getChild(page);
            }

            if(_page instanceof Page && _page !== previous){
                const start_time = _page.getPropertyValue('start-time');
                const end_time = _page.getPropertyValue('end-time');
                if(start_time !== null || end_time !== null){
                    MasterClock.setTime(start_time || 0);
                }
                else{
                    if(previous){
                        previous.deactivate();
                    }

                    _page.activate();
                }
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
        const count = this.getChildrenCount();

        this.pager.updateCount(index, count);

        this.data('page-count', count);

        return this;
    }

    /**
     * Get the draggable behaviour's configuration
     *
     * @return {Object} The configuration
     */
    getDraggableConfigs(){
        return Object.assign(super.getDraggableConfigs(), {
            'handle': this.child('.pager')
        });
    }

}
