import Component from '../Component';
import Dom from '../../core/Dom';
import Draggable from '../../core/ui/Draggable';
import Resizable from '../../core/ui/Resizable';
import Locale from '../../core/Locale';
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
        return Object.assign({}, super.getDefaults(), {
            'properties': {
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
                'locked': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.BlockToggler.locked', 'Locked?')
                    },
                    'getter': function(){
                        return this.data('locked') === "true";
                    },
                    'setter': function(value){
                        this.data('locked', value ? "true" : null);
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
            }
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
        let componenets_width = 0;
        let componenets_height = 0;

        this.btn_wrapper.empty();

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

            componenets_width = Math.max(x + width, componenets_width);
            componenets_height = Math.max(y + height, componenets_height);
        });

        boxes.forEach((box, index) => {
            const button = new Dom('<div/>', {'class': 'button'})
                .addListener('click', this.onTogglerClick.bind(this, box.component))
                .appendTo(this.btn_wrapper);

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS(null, "preserveAspectRatio", "xMidYMidmeet");
            svg.setAttributeNS(null, "viewBox", `0 0 ${componenets_width} ${componenets_height}`);
            button.get(0).appendChild(svg);

            boxes.forEach((box2, index2) => {
                const x = box2.x;
                const y = box2.y;
                const width = box2.width;
                const height = box2.height;

                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttributeNS(null, "fill", index2 === index ? "#666666" : "#CECECE");
                rect.setAttributeNS(null, "width", width);
                rect.setAttributeNS(null, "height", height);
                rect.setAttributeNS(null, "x", x);
                rect.setAttributeNS(null, "y", y);

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
     * Set/Unset the draggable behaviour
     *
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    setDraggable(draggable){
        if(this.getPropertyValue('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            /**
             * The draggable behavior
             * @type {Draggable}
             */
            this._draggable = new Draggable({
                'target': this,
                'handle': this,
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

    }

    /**
     * Set/Unset the resizable behaviour
     *
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    setResizable(resizable){
        if(this.getPropertyValue('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            /**
             * The resizable behavior
             * @type {Resizable}
             */
            this._resizable = new Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    }

}
