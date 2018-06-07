import Component from '../Component';
import Element from './Element';
import {t} from '../../core/utils/Locale';
import {toCSS} from '../../core/utils/Color';
import {isString} from '../../core/utils/Var';

import CursorElement from './element/Cursor';
import ImageElement from './element/Image';
import TextElement from './element/Text';

const ELEMENT_TYPES = {
    'Cursor': CursorElement,
    'Image': ImageElement,
    'Text': TextElement,
};

/**
 * Fired when an element is added
 *
 * @event elementadd
 * @param {Object} page The page instance
 * @param {Object} element The element instance
 */
const EVT_ELEMENTADD = 'elementadd';

/**
 * Fired when a cuepoint started
 *
 * @event cuepointstart
 */
const EVT_CUEPOINTSTART = 'cuepointstart';

/**
 * Fired when a cuepoint stops
 *
 * @event cuepointstop
 */
const EVT_CUEPOINTSTOP = 'cuepointstop';

/**
 * A page component
 */
export default class Page extends Component {

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'properties': {
                'background-color': {
                    'type': 'Color',
                    'configs': {
                        'label': t('player.component.Page.background-color', 'Background color')
                    },
                    'getter': function(skipDefault){
                        return this.css('background-color', undefined, skipDefault);
                    },
                    'setter': function(value){
                        this.css('background-color', toCSS(value));
                    }
                },
                'background-image': {
                    'type': 'Image',
                    'configs': {
                        'label': t('player.component.Page.background-image', 'Background image')
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
                'start-time': {
                    'type': 'Time',
                    'configs': {
                        'label': t('player.component.Page.start-time', 'Start time'),
                        'inButton': true,
                        'outButton': true
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('start-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('start-time', isNaN(value) ? null : value);
                    }
                },
                'end-time': {
                    'type': 'Time',
                    'configs': {
                        'label': t('player.component.Page.end-time', 'End time'),
                        'inButton': true,
                        'outButton': true
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('end-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('end-time', isNaN(value) ? null : value);
                    }
                },
                'elements': {
                    'editable': false,
                    'getter': function(skipDefault){
                        const elements = [];

                        this.getElements().forEach((element) => {
                            elements.push(element.getProperties(skipDefault));
                        });

                        return elements;
                    },
                    'setter': function(value){
                        value.forEach((configs) => {
                            this.addElement(configs);
                        });
                    }
                }
            }
        });
    }

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
    }

    /**
     * Add an new element component to this page
     *
     * @method addElement
     * @param {Object} configs Configs to use for the element (see {{#crossLink "player.component.Element}"}}{{/crossLink}})
     * @return {player.component.Element} The element
     */
    addElement(configs, supressEvent){
        let element,
            existing = configs instanceof Element;

        if(existing){
            element = configs;
            element.appendTo(this);
        }
        else{
            element = new ELEMENT_TYPES[configs.type](Object.assign({}, configs, {
                'container': this
            }));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_ELEMENTADD, {'page': this, 'element': element, 'new': !existing});
        }

        return element;
    }

    /**
     * Get the block component this page belongs to
     *
     * @method getBlock
     * @return {player.component.Block}
     */
    getBlock() {
        let dom = this.parents().parents().get(0),
            block;

        if(dom){
            block = dom._metaScore;
        }

        return block;
    }

    /**
     * Get the element components that belong to this page
     *
     * @method getElements
     * @return {Array} The list of elements
     */
    getElements() {
        const elements = [];

        this.children('.element').each((index, dom) => {
            elements.push(dom._metaScore);
        });

        return elements;
    }

    /**
     * The cuepoint start event handler
     *
     * @method onCuePointStart
     * @private
     */
    onCuePointStart(){
        this.triggerEvent(EVT_CUEPOINTSTART);
    }

    /**
     * The cuepoint stop event handler
     *
     * @method onCuePointStop
     * @private
     */
    onCuePointStop(){
        this.triggerEvent(EVT_CUEPOINTSTOP);
    }

}
