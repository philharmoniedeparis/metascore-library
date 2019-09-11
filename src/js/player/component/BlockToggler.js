import Component from '../Component';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {isArray, isString, isEmpty} from '../../core/utils/Var';
import {toCSS} from '../../core/utils/Color';

/**
 * A block toggler component
 */
export default class BlockToggler extends Component{

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'editable': false,
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'name': {
                    'type': 'Text',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.name', 'Name')
                    },
                    'getter': function(){
                        return this.data('name');
                    },
                    'setter': function(value){
                        this.data('name', value);
                    }
                },
                'blocks': {
                    'type': 'Select',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.blocks', 'Blocks'),
                        'multiple': true
                    },
                    'getter': function(){
                        const value = this.data('blocks');
                        if(isString(value)){
                            return value.split(',').filter((el) => {
                                return !isEmpty(el);
                            });
                        }
                        // Return null if the data-blocks attribute doesn't exist for backwards compatibility.
                        // See Player.updateBlockToggler
                        return null;
                    },
                    'setter': function(value){
                        this.data('blocks', isArray(value) ? value.join(',') : null);
                    }
                },
                'x': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.x', 'X'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.y', 'Y'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    }
                },
                'width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.width', 'Width'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    },
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.height', 'Height'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    },
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'z-index': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.z-index', 'Display index')
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('z-index', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('z-index', value);
                    }
                },
                'background-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.Block.background-color', 'Background color')
                    },
                    'getter': function(skipDefault){
                        return this.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('background-color', toCSS(value));
                    }
                },
                'border-width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.border-width', 'Border width'),
                        'min': 0
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('border-width', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.border-color', 'Border color')
                    },
                    'getter': function(skipDefault){
                        return this.css('border-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-color', toCSS(value));
                    }
                },
                'border-radius': {
                    'type': 'BorderRadius',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.border-radius', 'Border radius')
                    },
                    'getter': function(skipDefault){
                        return this.css('border-radius', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-radius', value);
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
        return 'BlockToggler';
    }

    /**
     * Setup the block's UI
     *
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this.addClass('block-toggler');

        /**
         * The buttons container
         * @type {Dom}
         */
        this.btn_wrapper = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        return this;
    }

    /**
     * Update the displayed time
     *
     * @param {Dom} components A Dom instance containing the components to control
     * @return {this}
     */
    update(components){
        const boxes = [];
        let components_width = 0;
        let components_height = 0;

        this.btn_wrapper.empty();

        // Iterate through the list of components to retreive bounding box data.
        components.forEach((component) => {
            const x = component.getPropertyValue('x') || 0;
            const y = component.getPropertyValue('y') || 0;
            const width = component.getPropertyValue('width') || 0;
            const height = component.getPropertyValue('height') || 0;

            boxes.push({
                'component': component,
                'x': x,
                'y': y,
                'width': width,
                'height': height
            });

            components_width = Math.max(x + width, components_width);
            components_height = Math.max(y + height, components_height);
        });

        // Sort boxes by position from top-left to bottom-right.
        boxes.sort((a, b) => {
            if(a.x > b.x) {return 1;}
            if(a.x < b.x) {return -1;}
            if(a.y > b.y) {return 1;}
            if(a.y < b.y) {return -1;}
            return 0;
        });

        // Iterate through the boxes to create a corresponding toggle button.
        boxes.forEach((box, index) => {
            const button = new Dom('<div/>', {'class': 'button'})
                .data('component', box.component.getId())
                .addListener('click', this.onTogglerClick.bind(this, box.component))
                .appendTo(this.btn_wrapper);

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS(null, "preserveAspectRatio", "xMidYMid meet");
            svg.setAttributeNS(null, "viewBox", `0 0 ${components_width} ${components_height}`);
            button.get(0).appendChild(svg);

            boxes.forEach((box2, index2) => {
                const x = box2.x;
                const y = box2.y;
                const width = box2.width;
                const height = box2.height;

                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttributeNS(null, "width", width);
                rect.setAttributeNS(null, "height", height);
                rect.setAttributeNS(null, "x", x);
                rect.setAttributeNS(null, "y", y);

                if(index2 === index){
                    rect.setAttribute('class', "current");
                }

                svg.appendChild(rect);
            });
        });

        return this;
    }

    /**
     * The toggler button click event callback
     *
     * @param {Component} component The associated component
     */
    onTogglerClick(component){
        component.toggleVisibility();
    }

    /**
     * Get the draggable behaviour's configuration
     *
     * @return {Object} The configuration
     */
    getDraggableConfigs(){
        return {
            'target': this,
            'handle': this
        };
    }

}
