import Component from '../Component';
import Element from './Element';
import Locale from '../../core/Locale';
import {pick} from '../../core/utils/Object';

import CursorElement from './element/Cursor';
import ContentElement from './element/Content';
import MediaElement from './element/Media';
import SVGElement from './element/SVG';
import AnimationElement from './element/Animation';

/**
 * The list of available element types
 * @type {Object}
 */
const ELEMENT_TYPES = {
    'Cursor': CursorElement,
    'Content': ContentElement,
    'Media': MediaElement,
    'SVG': SVGElement,
    'Animation': AnimationElement
};

/**
 * A page component
 *
 * @emits {componentadd} Fired when an element is added
 * @param {Object} component The element instance
 * @param {Boolean} new Whether the component was an already existing one, or a newly created one from configs
 */
export default class Page extends Component {

    static defaults = Object.assign({}, super.defaults, {
        'draggable': false,
        'resizable': false
    });

    /**
     * @inheritdoc
    */
    static getProperties() {
        if (!this.properties) {
            this.properties = Object.assign(pick(super.getProperties(), [
                'type',
                'id',
                'background-color',
                'background-image',
                'start-time',
                'end-time',
                'editor.locked'
            ]), {
                'elements': {
                    'type': 'array',
                    'label': Locale.t('component.Page.properties.elements.label', 'Elements'),
                    'getter': function(skipID){
                        const elements = [];

                        this.getChildren().forEach((element) => {
                            elements.push(element.getPropertyValues(skipID));
                        });

                        return elements;
                    }
                }
            });
        }

        return this.properties;
    }

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Page';
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('page');
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(name, value, skipAnimatedCheck = false){
        super.updatePropertyValue(name, value, skipAnimatedCheck);

        switch(name){
            case 'start-time':
            case 'end-time':
                {
                    const block = this.getParent();

                    if(block.getPropertyValue('synched')){
                        const index = block.getChildIndex(this);
                        const sibling_page = name === 'start-time' ? block.getChild(index - 1) : block.getChild(index + 1);

                        if(sibling_page){
                            sibling_page.setPropertyValue(name === 'start-time' ? 'end-time' : 'start-time', value);
                        }
                    }
                }
                break;

            case 'elements':
                value.forEach((configs) => {
                    this.addElement(configs);
                });
                break;
        }

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

}
