import Component from '../Component';
import {MasterClock} from '../../core/clock/MediaClock';
import Dom from '../../core/Dom';
import Pager from './block/Pager';
import Page from './Page';
import {isString, isNumber} from '../../core/utils/Var';

/**
 * A block component
 *
 * @emits {componentadd} Fired when a page is added
 * @param {Component} component The page instance
 * @param {Boolean} new Whether the component was an already existing one, or a newly created one from configs
 */
export default class Block extends Component {

    /**
     * @inheritdoc
     */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'name': {
                    'getter': function(){
                        return this.data('name');
                    },
                    'setter': function(value){
                        this.data('name', value);
                    }
                },
                'hidden': {
                    'getter': function(){
                        return this.data('hidden') === "true";
                    },
                    'setter': function(value){
                        this.data('hidden', value ? "true" : null);
                    }
                },
                'scenario': {
                    'getter': function(){
                        return this.data('scenario');
                    },
                    'setter': function(value){
                        this.data('scenario', value);
                    }
                },
                'x': {
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    },
                },
                'width': {
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    },
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    },
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'background-color': {
                    'getter': function(skipDefault){
                        return this.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('background-color', value);
                    }
                },
                'background-image': {
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
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('border-width', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'getter': function(skipDefault){
                        return this.css('border-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-color', value);
                    }
                },
                'border-radius': {
                    'getter': function(skipDefault){
                        return this.css('border-radius', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-radius', value);
                    }
                },
                'synched': {
                    'getter': function(){
                        return this.data('synched') === "true";
                    },
                    'setter': function(value){
                        this.data('synched', value);
                    }
                },
                'pages': {
                    'getter': function(skipDefault, skipID){
                        const pages = [];

                        this.getChildren().forEach((page) => {
                            pages.push(page.getPropertyValues(skipDefault, skipID));
                        });

                        return pages;
                    },
                    'setter': function(value){
                        this.removeAllChildren();

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
     * @inheritdoc
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
            .appendTo(this);

        /**
         * The pager
         * @type {Pager}
         */
        this.pager = new Pager()
            .addDelegate('.button', 'click', this.onPagerClick.bind(this))
            .appendTo(this);

        this
            .addDelegate('.metaScore-component.page', 'activate', this.onPageActivate.bind(this))
            .addDelegate('.metaScore-component.page', 'deactivate', this.onPageDeactivate.bind(this));

        return this;
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

        if(!existing){
            page.init();
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
                if(start_time !== null){
                    MasterClock.setTime(start_time);
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
