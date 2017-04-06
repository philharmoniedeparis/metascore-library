/**
 * @module Player
 */

metaScore.namespace('player.component').Page = (function () {

    /**
     * Fired when an element is added
     *
     * @event elementadd
     * @param {Object} page The page instance
     * @param {Object} element The element instance
     */
    var EVT_ELEMENTADD = 'elementadd';

    /**
     * Fired when a cuepoint started
     *
     * @event cuepointstart
     */
    var EVT_CUEPOINTSTART = 'cuepointstart';

    /**
     * Fired when a cuepoint stops
     *
     * @event cuepointstop
     */
    var EVT_CUEPOINTSTOP = 'cuepointstop';

    /**
     * A page component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Page(configs) {
        // call parent constructor
        Page.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Page);

    Page.defaults = {
        'properties': {
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('background-color', metaScore.Color.toCSS(value));
                }
            },
            'background-image': {
                'type': 'Image',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.background-image', 'Background image')
                },
                'getter': function(skipDefault){
                    var value = this.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !metaScore.Var.is(value, "string")){
                        return null;
                    }
                    
                    value = value.replace(/^url\(["']?/, '');
                    value = value.replace(/["']?\)$/, '');
                    value = value.replace(document.baseURI, '');

                    return value;
                },
                'setter': function(value){
                    value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.css('background-image', value);
                }
            },
            'start-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.start-time', 'Start time'),
                    'checkbox': false,
                    'inButton': true,
                    'outButton': true
                },
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('start-time'));
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.data('start-time', isNaN(value) ? null : value);
                }
            },
            'end-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.end-time', 'End time'),
                    'checkbox': false,
                    'inButton': true,
                    'outButton': true
                },
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('end-time'));
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.data('end-time', isNaN(value) ? null : value);
                }
            },
            'elements': {
                'editable': false,
                'getter': function(skipDefault){
                    var elements = [];

                    metaScore.Array.each(this.getElements(), function(index, element){
                        elements.push(element.getProperties(skipDefault));
                    }, this);

                    return elements;
                },
                'setter': function(value){
                    metaScore.Array.each(value, function(index, configs){
                        this.addElement(configs);
                    }, this);
                }
            }
        }
    };

    /**
     * Setup the page's UI
     * 
     * @method setupUI
     * @private
     */
    Page.prototype.setupUI = function(){
        // call parent function
        Page.parent.prototype.setupUI.call(this);

        this.addClass('page');
    };

    /**
     * Add an new element component to this page
     * 
     * @method addElement
     * @param {Object} configs Configs to use for the element (see {{#crossLink "player.component.Element}"}}{{/crossLink}})
     * @return {player.component.Element} The element
     */
    Page.prototype.addElement = function(configs, supressEvent){
        var element,
            existing = configs instanceof metaScore.player.component.Element;

        if(existing){
            element = configs;
            element.appendTo(this);
        }
        else{
            element = new metaScore.player.component.element[configs.type](metaScore.Object.extend({}, configs, {
                'container': this
            }));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_ELEMENTADD, {'page': this, 'element': element, 'new': !existing});
        }

        return element;
    };

    /**
     * Get the block component this page belongs to
     * 
     * @method getBlock
     * @return {player.component.Block}
     */
    Page.prototype.getBlock = function(){
        var dom = this.parents().parents().get(0),
            block;

        if(dom){
            block = dom._metaScore;
        }

        return block;
    };

    /**
     * Get the element components that belong to this page
     * 
     * @method getElements
     * @return {Array} The list of elements
     */
    Page.prototype.getElements = function(){
        var elements = [];

        this.children('.element').each(function(index, dom){
            elements.push(dom._metaScore);
        });

        return elements;
    };

    /**
     * The cuepoint start event handler
     * 
     * @method onCuePointStart
     * @private
     * @param {Event} evt The event object
     */
    Page.prototype.onCuePointStart = function(evt){
        this.triggerEvent(EVT_CUEPOINTSTART);
    };

    /**
     * The cuepoint stop event handler
     * 
     * @method onCuePointStop
     * @private
     * @param {Event} evt The event object
     */
    Page.prototype.onCuePointStop = function(evt){
        this.triggerEvent(EVT_CUEPOINTSTOP);
    };

    return Page;

})();