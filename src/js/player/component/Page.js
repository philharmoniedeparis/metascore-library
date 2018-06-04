import {Component} from '../Component';
import {Element} from './Element';
import {Locale} from '../core/Locale';
import {_Color} from '../core/utils/Color';
import {_Var} from '../core/utils/Var';
import {_Object} from '../core/utils/Object';
import {_Array} from '../core/utils/Array';

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

export default class Page extends Component {

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
    constructor(configs) {
        // call parent constructor
        super(configs);
    }

    Page.defaults = {
        'properties': {
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': Locale.t('player.component.Page.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('background-color', _Color.toCSS(value));
                }
            },
            'background-image': {
                'type': 'Image',
                'configs': {
                    'label': Locale.t('player.component.Page.background-image', 'Background image')
                },
                'getter': function(skipDefault){
                    var value = this.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !_Var.is(value, "string")){
                        return null;
                    }
                    
                    value = value.replace(/^url\(["']?/, '');
                    value = value.replace(/["']?\)$/, '');
                    value = value.replace(document.baseURI, '');

                    return value;
                },
                'setter': function(value){
                    value = (value !== 'none' && _Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.css('background-image', value);
                }
            },
            'start-time': {
                'type': 'Time',
                'configs': {
                    'label': Locale.t('player.component.Page.start-time', 'Start time'),
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
                    'label': Locale.t('player.component.Page.end-time', 'End time'),
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

                    _Array.each(this.getElements(), function(index, element){
                        elements.push(element.getProperties(skipDefault));
                    }, this);

                    return elements;
                },
                'setter': function(value){
                    _Array.each(value, function(index, configs){
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
    setupUI() {
        // call parent function
        super.setupUI();

        this.addClass('page');
    };

    /**
     * Add an new element component to this page
     * 
     * @method addElement
     * @param {Object} configs Configs to use for the element (see {{#crossLink "player.component.Element}"}}{{/crossLink}})
     * @return {player.component.Element} The element
     */
    addElement(configs, supressEvent){
        var element,
            existing = configs instanceof Element;

        if(existing){
            element = configs;
            element.appendTo(this);
        }
        else{
            element = new metaScore.player.component.element[configs.type](_Object.extend({}, configs, {
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
    getBlock() {
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
    getElements() {
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
    onCuePointStart(evt){
        this.triggerEvent(EVT_CUEPOINTSTART);
    };

    /**
     * The cuepoint stop event handler
     * 
     * @method onCuePointStop
     * @private
     * @param {Event} evt The event object
     */
    onCuePointStop(evt){
        this.triggerEvent(EVT_CUEPOINTSTOP);
    };
    
}