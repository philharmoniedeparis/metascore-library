import Component from '../Component';
import Element from './Element';
import Locale from '../../core/Locale';
import {isString} from '../../core/utils/Var';

import CursorElement from './element/Cursor';
import ContentElement from './element/Content';
import SVGElement from './element/SVG';
import AnimationElement from './element/Animation';

/**
 * The list of available element types
 * @type {Object}
 */
const ELEMENT_TYPES = {
    'Cursor': CursorElement,
    'Content': ContentElement,
    'SVG': SVGElement,
    'Animation': AnimationElement,
};

/**
 * A page component
 *
 * @emits {componentadd} Fired when an element is added
 * @param {Object} component The element instance
 * @param {Boolean} new Whether the component was an already existing one, or a newly created one from configs
 */
export default class Page extends Component {

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'draggable': false,
            'resizable': false,
            'properties': Object.assign({}, defaults.properties, {
                'background-color': {
                    'type': 'color',
                    'setter': function(value){
                        this.css('background-color', value);
                    }
                },
                'background-image': {
                    'type': 'image',
                    'setter': function(value){
                        const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                        this.css('background-image', css_value);
                    }
                },
                'start-time': {
                    'type': 'time'
                },
                'end-time': {
                    'type': 'time'
                },
                'elements': {
                    'type': 'array',
                    'getter': function(skipID){
                        const elements = [];

                        this.getChildren().forEach((element) => {
                            elements.push(element.getPropertyValues(skipID));
                        });

                        return elements;
                    },
                    'setter': function(value){
                        value.forEach((configs) => {
                            this.addElement(configs);
                        });
                    }
                }
            })
        });
    }

    /**
     * Setup the page's UI
     *
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this.addClass('page');

        return this;
    }

    getName(){
        const block = this.getParent();
        const index = block ? block.getChildIndex(this) + 1 : null;

        return Locale.t('player.component.Page.name', 'page !index', {'!index': index});
    }

    /**
     * Add an element
     *
     * @param {Object|Element} configs Element configs or an existing Element instance
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event
     * @return {Element} The element
     */
    addElement(configs, supressEvent){
        let element = configs;
        const existing = element instanceof Element;

        if(existing){
            element.appendTo(this);
        }
        else{
            const type = element.type;

            if(!(type in ELEMENT_TYPES)){
                console.error(`Element of type "${type}" is not supported.`);
                return null;
            }

            element = new ELEMENT_TYPES[type](element)
                .appendTo(this)
                .init();
        }

        if(this.isActive()){
            element.activate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': element, 'new': !existing});
        }

        return element;
    }

    onOwnPropChange(evt){
        super.onOwnPropChange(evt);

        const property = evt.detail.property;
        if((property === 'start-time') || (property === 'end-time')){
            const page = evt.detail.component;
            const block = page.getParent();

            if(block.getPropertyValue('synched')){
                const index = block.getChildIndex(page);
                const sibling_page = property === 'start-time' ? block.getChild(index - 1) : block.getChild(index + 1);

                if(sibling_page){
                    sibling_page.setPropertyValue(property === 'start-time' ? 'end-time' : 'start-time', evt.detail.value);
                }
            }
        }
    }

}
