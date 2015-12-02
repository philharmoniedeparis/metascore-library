/**
* Description
*
* @class player.component.Block
* @extends player.Component
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
     * Description
     * @constructor
     * @param {} configs
     */
    function Block(configs) {
        // call parent constructor
        Block.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Block);

    Block.defaults = {
        'container': null,
        'properties': {
            'name': {
                'type': 'Text',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.name', 'Name')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.data('name');
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.data('name', value);
                }
            },
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.locked', 'Locked ?')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return BinaryExpression
                 */
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.x', 'X')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.y', 'Y')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.css('top', value +'px');
                },
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.width', 'Width')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.height', 'Height')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
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
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    var value = this.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !metaScore.Var.is(value, "string")){
                        return null;
                    }

                    return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.css('background-image', value);
                }
            },
            'border-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-width', 'Border width')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return ConditionalExpression
                 */
                'getter': function(skipDefault){
                    var value = this.css('border-width', undefined, skipDefault);
                    return value !== null ? parseInt(value, 10) : null;
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.css('border-width', value +'px');
                }
            },
            'border-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-color', 'Border color')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.css('border-color', undefined, skipDefault);
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
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
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.css('border-radius', value);
                }
            },
            'synched': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.synched', 'Synchronized pages ?'),
                    'readonly': true
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return BinaryExpression
                 */
                'getter': function(skipDefault){
                    return this.data('synched') === "true";
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.data('synched', value);
                }
            },
            'pages': {
                'editable':false,
                /**
                 * Description
                 * @param {} skipDefault
                 * @return pages
                 */
                'getter': function(skipDefault){
                    var pages = [];

                    this.getPages().each(function(index, page){
                        pages.push(page._metaScore.getProperties(skipDefault));
                    }, this);

                    return pages;
                },
                /**
                 * Description
                 * @param {} value
                 * @return 
                 */
                'setter': function(value){
                    this.getPages().remove();

                    metaScore.Array.each(value, function(index, configs){
                        this.addPage(configs);
                    }, this);

                    this.setActivePage(0);
                }
            }
        }
    };

    /**
     * Description
     * @method setupDOM
     * @return 
     */
    Block.prototype.setupDOM = function(){
        // call parent function
        Block.parent.prototype.setupDOM.call(this);

        this.addClass('block');

        this.page_wrapper = new metaScore.Dom('<div/>', {'class': 'pages'})
            .addDelegate('.page', 'cuepointstart', metaScore.Function.proxy(this.onPageCuePointStart, this))
            .appendTo(this);

        this.pager = new metaScore.player.Pager()
            .addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this))
            .appendTo(this);
    };

    /**
     * Description
     * @method onPageCuePointStart
     * @param {} evt
     * @return 
     */
    Block.prototype.onPageCuePointStart = function(evt){
        this.setActivePage(evt.target._metaScore, 'pagecuepoint');
    };

    /**
     * Description
     * @method onPagerClick
     * @param {} evt
     * @return 
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
     * Description
     * @method getPages
     * @return CallExpression
     */
    Block.prototype.getPages = function(){
        return this.page_wrapper.children('.page');
    };

    /**
     * Description
     * @method addPage
     * @param {} configs
     * @param {} supressEvent
     * @return page
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
     * Description
     * @method removePage
     * @param {} page
     * @param {} supressEvent
     * @return page
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
     * Description
     * @method getPage
     * @param {} index
     * @return ConditionalExpression
     */
    Block.prototype.getPage = function(index){
        var pages = this.getPages(),
            page = pages.get(index);

        return page ? page._metaScore : null;
    };

    /**
     * Description
     * @method getActivePage
     * @return CallExpression
     */
    Block.prototype.getActivePage = function(){
        return this.getPage(this.getActivePageIndex());
    };

    /**
     * Description
     * @method getActivePageIndex
     * @return index
     */
    Block.prototype.getActivePageIndex = function(){
        var pages = this.getPages(),
            index = pages.index('.active');

        return index;
    };

    /**
     * Description
     * @method getPageCount
     * @return CallExpression
     */
    Block.prototype.getPageCount = function(){
        return this.getPages().count();
    };

    /**
     * Description
     * @method setActivePage
     * @param {} page
     * @param {} supressEvent
     * @return 
     */
    Block.prototype.setActivePage = function(page, basis, supressEvent){
        var pages = this.getPages(), dom;

        if(metaScore.Var.is(page, 'number')){
            page = pages.get(parseInt(page, 10));
            page = page ? page._metaScore : null;
        }

        if(page instanceof metaScore.player.component.Page){
            pages.removeClass('active');
            page.addClass('active');
            this.updatePager();

            if(supressEvent !== true){
                this.triggerEvent(EVT_PAGEACTIVATE, {'block': this, 'page': page, 'basis': basis});
            }
        }
    };

    /**
     * Description
     * @method updatePager
     * @return 
     */
    Block.prototype.updatePager = function(){
        var index = this.getActivePageIndex(),
            count = this.getPageCount();

        this.pager.updateCount(index, count);

        this.data('page-count', count);
    };

    /**
     * Description
     * @method setDraggable
     * @param {} draggable
     * @return MemberExpression
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
                'container': this.parents(),
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
     * Description
     * @method setResizable
     * @param {} resizable
     * @return MemberExpression
     */
    Block.prototype.setResizable = function(resizable){
        
        resizable = resizable !== false;
    
        if(this.getProperty('locked') && resizable){
            return false;
        }
    
        if(resizable && !this._resizable){
            this._resizable = new metaScore.Resizable({
                'target': this,
                'container': this.parents()
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