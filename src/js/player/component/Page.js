import Component from '../Component';
import Element from './Element';
import Locale from '../../core/Locale';
import {toCSS} from '../../core/utils/Color';
import {isString} from '../../core/utils/Var';

import CursorElement from './element/Cursor';
import ImageElement from './element/Image';
import TextElement from './element/Text';

/**
 * The list of available element types
 * @type {Object}
 */
const ELEMENT_TYPES = {
    'Cursor': CursorElement,
    'Image': ImageElement,
    'Text': TextElement,
};

/**
 * A page component
 *
 * @emits {componentadd} Fired when an element is added
 * @param {Object} component The element instance
 * @param {Boolean} new Whether the component was an already existing one, or a newly created one from configs
 * @emits {cuepointstart} Fired when a cuepoint started
 * @emits {cuepointstop} Fired when a cuepoint stops
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
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.Page.background-color', 'Background color')
                    },
                    'getter': function(skipDefault){
                        return this.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('background-color', toCSS(value));
                    }
                },
                'background-image': {
                    'type': 'Image',
                    'configs': {
                        'label': Locale.t('player.component.Page.background-image', 'Background image')
                    },
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
                'start-time': {
                    'type': 'Time',
                    'configs': {
                        'label': Locale.t('player.component.Page.start-time', 'Start time'),
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
                        'label': Locale.t('player.component.Page.end-time', 'End time'),
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
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return 'Page';
    }

    /**
     * Setup the page's UI
     *
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this
            .addClass('page')
            .addListener('cuepointset', this.onCuePointSet.bind(this));

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
        const existing = configs instanceof Element;
        let element = null;

        if(existing){
            element = configs;
            element.appendTo(this);
        }
        else{
            const type = configs.type;
            const el_index = this.children(`.element.${type}`).count() + 1;
            let name = '';

            switch(type){
                case 'Cursor':
                    name = `cur ${el_index}`;
                    break;

                case 'Image':
                    name = `img ${el_index}`;
                    break;

                case 'Text':
                    name = `txt ${el_index}`;
                    break;
            }

            element = new ELEMENT_TYPES[configs.type](Object.assign({
                'container': this,
                'name': name,
            }, configs));
        }

        if(this.active){
            element.activate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': element, 'new': !existing});
        }

        return element;
    }

    /**
     * Activate the page and its elements
     *
     * @return {this}
     */
    activate(){
        this.addClass('active');

        this.getChildren().forEach((element) => {
            element.activate();
        });

        this.active = true;

        return this;
    }

    /**
     * Deactivate the page and its elements
     *
     * @return {this}
     */
    deactivate(){
        delete this.active;

        this.getChildren().forEach((element) => {
            element.deactivate();
        });

        this.removeClass('active');

        return this;
    }

    /**
     * The cuepoint set event handler
     *
     * @param {Event} evt The event object
     * @private
     */
    onCuePointSet(evt){
        const cuepoint = evt.detail.cuepoint;

        cuepoint
            .addListener('start', this.onCuePointStart.bind(this))
            .addListener('stop', this.onCuePointStop.bind(this))
            .activate();

        evt.stopPropagation();
    }

    /**
     * The cuepoint start event handler
     *
     * @private
     */
    onCuePointStart(){
        this.triggerEvent('cuepointstart');
    }

    /**
     * The cuepoint stop event handler
     *
     * @private
     */
    onCuePointStop(){
        this.triggerEvent('cuepointstop');
    }

}
