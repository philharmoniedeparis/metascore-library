import Component from '../Component';
import Element from './Element';
import Locale from '../../core/Locale';
import {isString} from '../../core/utils/Var';

import CursorElement from './element/Cursor';
import ContentElement from './element/Content';
import AnimationElement from './element/Animation';

/**
 * The list of available element types
 * @type {Object}
 */
const ELEMENT_TYPES = {
    'Cursor': CursorElement,
    'Content': ContentElement,
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

                        return value;
                    },
                    'setter': function(value){
                        const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                        this.css('background-image', css_value);
                    }
                },
                'start-time': {
                    'getter': function(){
                        const value = parseFloat(this.data('start-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('start-time', isNaN(value) ? null : value);
                    }
                },
                'end-time': {
                    'getter': function(){
                        const value = parseFloat(this.data('end-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('end-time', isNaN(value) ? null : value);
                    }
                },
                'elements': {
                    'getter': function(skipDefault, skipID){
                        const elements = [];

                        this.getChildren().forEach((element) => {
                            elements.push(element.getPropertyValues(skipDefault, skipID));
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

            const el_index = this.children(`.element.${type}`).count() + 1;
            let name = '';

            switch(type){
                case 'Cursor':
                    name = `cur ${el_index}`;
                    break;

                case 'Content':
                    name = `content ${el_index}`;
                    break;

                case 'Animation':
                    name = `anim ${el_index}`;
                    break;
            }

            element = new ELEMENT_TYPES[type](Object.assign({
                    'name': name,
                }, element))
                .appendTo(this)
                .init();
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
