/**
 * @module Player
 */

metaScore.namespace('player.component').Block = (function () {

    /**
     * Fired when a page is added
     *
     * @event pageadd
     * @param {Object} block The block instance
     * @param {Object} page The page instance
     */
    var EVT_PAGEADD = 'pageadd';

    /**
     * Fired when a page is removed
     *
     * @event pageremove
     * @param {Object} block The block instance
     * @param {Object} page The page instance
     */
    var EVT_PAGEREMOVE = 'pageremove';

    /**
     * Fired when the active page is set
     *
     * @event pageactivate
     * @param {Object} block The block instance
     * @param {Object} page The page instance
     * @param {String} basis The reason behind this action
     */
    var EVT_PAGEACTIVATE = 'pageactivate';

    /**
     * A block component
     *
     * @class Block
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Block(configs) {
        // call parent constructor
        Block.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Block);

    Block.defaults = {
        'properties': {
            'name': {
                'type': 'Text',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.name', 'Name')
                },
                'getter': function(skipDefault){
                    return this.data('name');
                },
                'setter': function(value){
                    this.data('name', value);
                }
            },
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.locked', 'Locked ?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                },
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.width', 'Width'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.height', 'Height'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'background-image': {
                'type':'Image',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-image', 'Background image')
                },
                'getter': function(skipDefault){
                    var value = this.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !metaScore.Var.is(value, "string")){
                        return null;
                    }

                    return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                },
                'setter': function(value){
                    value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.css('background-image', value);
                }
            },
            'border-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-width', 'Border width'),
                    'min': 0
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('border-width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('border-width', value +'px');
                }
            },
            'border-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-color', 'Border color')
                },
                'getter': function(skipDefault){
                    return this.css('border-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-radius', 'Border radius')
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
                'getter': function(skipDefault){
                    return this.data('synched') === "true";
                },
                'setter': function(value){
                    this.data('synched', value);
                }
            },
            'pages': {
                'editable':false,
                'getter': function(skipDefault){
                    var pages = [];

                    metaScore.Array.each(this.getPages(), function(index, page){
                        pages.push(page.getProperties(skipDefault));
                    });

                    return pages;
                },
                'setter': function(value){
                    this.removePages();

                    metaScore.Array.each(value, function(index, configs){
                        this.addPage(configs);
                    }, this);

                    this.setActivePage(0);
                }
            }
        }
    };

    /**
     * Setup the block's UI
     * 
     * @method setupUI
     * @private
     */
    Block.prototype.setupUI = function(){
        // call parent function
        Block.parent.prototype.setupUI.call(this);

        this.addClass('block');

        this.page_wrapper = new metaScore.Dom('<div/>', {'class': 'pages'})
            .addDelegate('.page', 'cuepointstart', metaScore.Function.proxy(this.onPageCuePointStart, this))
            .appendTo(this);

        this.pager = new metaScore.player.Pager()
            .addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this))
            .appendTo(this);
    };

    /**
     * Page cuepointstart event handler
     *
     * @method onPageCuePointStart
     * @private
     * @param {Event} evt The event object
     */
    Block.prototype.onPageCuePointStart = function(evt){
        this.setActivePage(evt.target._metaScore, 'pagecuepoint');
    };

    /**
     * Pager click event handler
     *
     * @method onPagerClick
     * @private
     * @param {Event} evt The event object
     */
    Block.prototype.onPagerClick = function(evt){
        var active = !metaScore.Dom.hasClass(evt.target, 'inactive'),
            action;

        if(active){
            action = metaScore.Dom.data(evt.target, 'action');

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
    };

    /**
     * Get the block's pages
     *
     * @method getPages
     * @return {Array} List of pages
     */
    Block.prototype.getPages = function(){
        var pages = [];

        this.page_wrapper.children('.page').each(function(index, dom){
            pages.push(dom._metaScore);
        });

        return pages;
    };

    /**
     * Add a page
     *
     * @method addPage
     * @params {Mixed} configs Page configs or a player.component.Page instance
     * @params {Integer} index The new page's index
     * @param {Boolean} [supressEvent=false] Whether to supress the pageadd event
     * @return {player.component.Page} The added page
     */
    Block.prototype.addPage = function(configs, index, supressEvent){
        var page;

        if(configs instanceof metaScore.player.component.Page){
            page = configs;

            if(metaScore.Var.is(index, 'number')){
                page.insertAt(this.page_wrapper, index);
            }
            else{
                page.appendTo(this.page_wrapper);
            }
        }
        else{
            page = new metaScore.player.component.Page(metaScore.Object.extend({}, configs, {
                'container': this.page_wrapper,
                'index': index
            }));
        }

        this.setActivePage(page);

        if(supressEvent !== true){
            this.triggerEvent(EVT_PAGEADD, {'block': this, 'page': page});
        }

        return page;
    };

    /**
     * Remove a page
     *
     * @method removePage
     * @params {player.component.Page} page The page to remove
     * @param {Boolean} [supressEvent=false] Whether to supress the pageremove event
     * @return {player.component.Page} The removed page
     */
    Block.prototype.removePage = function(page, supressEvent){
        var index;

        page.remove();

        if(supressEvent !== true){
            this.triggerEvent(EVT_PAGEREMOVE, {'block': this, 'page': page});
        }

        return page;
    };

    /**
     * Remove all pages
     *
     * @method removePages
     * @chainable
     */
    Block.prototype.removePages = function(){
        this.page_wrapper.children('.page').remove();

        return this;
    };

    /**
     * Get a page by index
     *
     * @method getPage
     * @param {Integer} index The page's index
     * @return {player.component.Page} The page
     */
    Block.prototype.getPage = function(index){        
        var page = this.page_wrapper.child('.page:nth-child('+ (index+1) +')').get(0);
        
        return page ? page._metaScore : null;
    };

    /**
     * Get the currently active page
     *
     * @method getActivePage
     * @return {player.component.Page} The page
     */
    Block.prototype.getActivePage = function(){
        return this.getPage(this.getActivePageIndex());
    };

    /**
     * Get the index of the currently active page
     *
     * @method getActivePageIndex
     * @return {Integer} The index
     */
    Block.prototype.getActivePageIndex = function(){
        return this.page_wrapper.children('.page').index('.active');
    };

    /**
     * Get the page count
     *
     * @method getPageCount
     * @return {Integer} The number of pages
     */
    Block.prototype.getPageCount = function(){
        return this.page_wrapper.children('.page').count();
    };

    /**
     * Set the active page
     *
     * @method setActivePage
     * @param {Mixed} page The page to activate or its index
     * @param {Boolean} [supressEvent=false] Whether to supress the pageactivate event
     * @chainable
     */
    Block.prototype.setActivePage = function(page, basis, supressEvent){
        if(metaScore.Var.is(page, 'number')){
            page = this.getPage(page);
        }

        if(page instanceof metaScore.player.component.Page){
            metaScore.Array.each(this.getPages(), function(index, page){
                page.removeClass('active');
            });

            page.addClass('active');
            
            this.updatePager();

            if(supressEvent !== true){
                this.triggerEvent(EVT_PAGEACTIVATE, {'block': this, 'page': page, 'basis': basis});
            }
        }
        
        return this;
    };

    /**
     * Update the pager
     *
     * @method updatePager
     * @private
     * @chainable
     */
    Block.prototype.updatePager = function(){
        var index = this.getActivePageIndex(),
            count = this.getPageCount();

        this.pager.updateCount(index, count);

        this.data('page-count', count);
        
        return this;
    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    Block.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
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

    };

    /**
     * Set/Unset the resizable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    Block.prototype.setResizable = function(resizable){

        resizable = resizable !== false;

        if(this.getProperty('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            this._resizable = new metaScore.Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    };

    return Block;

})();