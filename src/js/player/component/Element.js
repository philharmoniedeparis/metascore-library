import Component from '../Component';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {toCSS} from '../../core/utils/Color';
import {isString} from '../../core/utils/Var';

/**
 * An element component
 *
 * @emits {activate} Fired when the element is activated
 * @param {Object} element The element instance
 * @emits {deactivate} Fired when the element is deactivated
 * @param {Object} element The element instance
 * @emits {cuepointstart} Fired when a cuepoint started
 * @emits {cuepointstop} Fired when a cuepoint stops
 */
export default class Element extends Component{

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
                    'field': {
                        'type': 'text',
                        'label': Locale.t('player.component.Element.name', 'Name')
                    },
                    'getter': function(){
                        return this.data('name');
                    },
                    'setter': function(value){
                        this.data('name', value);
                    }
                },
                'x': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'spinDirection': 'vertical'
                        },
                        'label': Locale.t('player.component.Element.x', 'X')
                    },
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'flipSpinButtons': true
                        },
                        'label': Locale.t('player.component.Element.y', 'Y')
                    },
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    }
                },
                'width': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'spinDirection': 'vertical'
                        },
                        'label': Locale.t('player.component.Element.width', 'Width')
                    },
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    },
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'flipSpinButtons': true
                        },
                        'label': Locale.t('player.component.Element.height', 'Height')
                    },
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    },
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'r-index': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'min': 0
                        },
                        'label': Locale.t('player.component.Element.r-index', 'Reading index')
                    },
                    'getter': function(){
                        const value = parseInt(this.data('r-index'), 10);
                        return isNaN(value) || value === 0 ? null : value;
                    },
                    'setter': function(value){
                        this.data('r-index', value);
                    }
                },
                'z-index': {
                    'field': {
                        'type': 'number',
                        'label': Locale.t('player.component.Element.z-index', 'Display index')
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
                    'field': {
                        'type': 'timcolore',
                        'label': Locale.t('player.component.Element.background-color', 'Background color')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('background-color', toCSS(value));
                    }
                },
                'background-image': {
                    'field': {
                        'type': 'image',
                        'input': {
                            'resizeButton': true
                        },
                        'label': Locale.t('player.component.Element.background-image', 'Background image')
                    },
                    'getter': function(skipDefault){
                        let value = this.contents.css('background-image', void 0, skipDefault);

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
                        this.contents.css('background-image', css_value);
                    }
                },
                'border-width': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'min': 0
                        },
                        'label': Locale.t('player.component.Element.border-width', 'Border width')
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.contents.css('border-width', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.contents.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'field': {
                        'type': 'color',
                        'label': Locale.t('player.component.Element.border-color', 'Border color')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('border-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('border-color', toCSS(value));
                    }
                },
                'border-radius': {
                    'field': {
                        'type': 'border-radius',
                        'label': Locale.t('player.component.Element.border-radius', 'Border radius')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('border-radius', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('border-radius', value);
                    }
                },
                'opacity': {
                    'field': {
                        'type': 'number',
                        'input': {
                            'min': 0,
                            'max': 1,
                            'step': 0.1
                        },
                        'label': Locale.t('player.component.Element.opacity', 'Opacity')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('opacity', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('opacity', value);
                    }
                },
                'start-time': {
                    'field': {
                        'type': 'time',
                        'input': {
                            'clearButton': true,
                            'inButton': true,
                            'outButton': true
                        },
                        'label': Locale.t('player.component.Element.start-time', 'Start time')
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
                    'field': {
                        'type': 'time',
                        'input': {
                            'clearButton': true,
                            'inButton': true,
                            'outButton': true
                        },
                        'label': Locale.t('player.component.Element.end-time', 'End time')
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('end-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('end-time', isNaN(value) ? null : value);
                    }
                }
            })
        });
    }

    /**
     * Setup the element's UI
     *
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this
            .addClass('element')
            .addClass(this.constructor.getType())
            .addListener('cuepointset', this.onCuePointSet.bind(this));

        /**
         * The contents container
         * @type {Dom}
         */
        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(this);

        return this;
    }

    /**
     * Check if the element is active or not
     *
     * @return {Boolean} Whether the element is active or not
     */
    isActive(){
        return this.hasClass('active');
    }

    /**
     * Activate the element
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the activate event
     * @return {this}
     */
    activate(supressEvent){
        if(!this.isActive()){
            this.addClass('active');

            const cuepoint = this.getCuePoint();
            if(cuepoint){
                cuepoint.activate();
            }

            if(supressEvent !== true){
                this.triggerEvent('activate', {'element': this});
            }
        }

        return this;
    }

    /**
     * Deactivate the element
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the deactivate event
     * @return {this}
     */
    deactivate(supressEvent){
        if(this.isActive()){
            this.removeClass('active');

            const cuepoint = this.getCuePoint();
            if(cuepoint){
                cuepoint.deactivate();
            }

            if(supressEvent !== true){
                this.triggerEvent('deactivate', {'element': this});
            }
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

        this.removeClass('cuepointactive');

        cuepoint
            .addListener('start', this.onCuePointStart.bind(this))
            .addListener('stop', this.onCuePointStop.bind(this));

        if(this.isActive()){
            cuepoint.activate();
        }

        evt.stopPropagation();
    }

    /**
     * The cuepoint start event handler
     *
     * @private
     */
    onCuePointStart(){
        this.addClass('cuepointactive');
        this.triggerEvent('cuepointstart');
    }

    /**
     * The cuepoint stop event handler
     *
     * @private
     */
    onCuePointStop(){
        this.removeClass('cuepointactive');
        this.triggerEvent('cuepointstop');
    }

}
