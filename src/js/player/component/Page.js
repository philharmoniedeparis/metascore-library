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
 * @emits {elementadd} Fired when an element is added
 * @param {Object} page The page instance
 * @param {Object} element The element instance
 * @emits {cuepointstart} Fired when a cuepoint started
 * @emits {cuepointstop} Fired when a cuepoint stops
 * @emits {activate} Fired when the page is activated
 * @param {Object} page The page instance
 * @emits {deactivate} Fired when the page is deactivated
 * @param {Object} page The page instance
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

                        this.getElements().forEach((element) => {
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

    /**
     * Add an element
     *
     * @param {Object|Element} configs Element configs or an existing Element instance
     * @param {Boolean} [supressEvent=false] Whether to supress the pageadd event
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
                    'name': name,
                }, element))
                .appendTo(this)
                .init();
        }

        if(this.active){
            element.activate();
        }

        if(supressEvent !== true){
            this.triggerEvent('elementadd', {'page': this, 'element': element, 'new': !existing});
        }

        return element;
    }

    /**
     * Get the block component this page belongs to
     *
     * @return {player.component.Block}
     */
    getBlock() {
        const dom = this.closest('.metaScore-component.block');

        return dom ? dom._metaScore : null;
    }

    /**
     * Get the element components that belong to this page
     *
     * @return {Array} The list of elements
     */
    getElements() {
        const elements = [];

        this.children('.element').forEach((dom) => {
            elements.push(dom._metaScore);
        });

        return elements;
    }

    /**
     * Activate the page and its elements
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the activate event
     * @return {this}
     */
    activate(supressEvent){
        this.addClass('active');

        this.getElements().forEach((element) => {
            element.activate();
        });

        this.active = true;

        if(supressEvent !== true){
            this.triggerEvent('activate', {'page': this});
        }

        return this;
    }

    /**
     * Deactivate the page and its elements
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the deactivate event
     * @return {this}
     */
    deactivate(supressEvent){
        delete this.active;

        this.getElements().forEach((element) => {
            element.deactivate();
        });

        this.removeClass('active');

        if(supressEvent !== true){
            this.triggerEvent('deactivate', {'page': this});
        }

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
