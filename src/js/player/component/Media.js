import Component from '../Component';
import Locale from '../../core/Locale';
import {toCSS} from '../../core/utils/Color';
import Draggable from '../../core/ui/Draggable';
import Resizable from '../../core/ui/Resizable';

import HTML5 from '../renderer/HTML5';
import HLS from '../renderer/HLS';
import Dash from '../renderer/Dash';

/**
 * The list of renderers to use in order of priority
 * @type {Array}
 */
const RENDERERS = [
    HTML5,
    HLS,
    Dash
];

/**
 * A media component
 */
export default class Media extends Component{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [properties={...}] A list of the component properties as name/descriptor pairs
     */
    constructor(configs){
        // call parent constructor
        super(configs);

        this
            .addClass('media')
            .addClass(this.configs.type);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'type': 'audio',
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'editable': false,
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'locked': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.Media.locked', 'Locked?')
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
                        'label': Locale.t('player.component.Media.x', 'X'),
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
                        'label': Locale.t('player.component.Media.y', 'Y'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    },
                },
                'width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Media.width', 'Width'),
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
                        'label': Locale.t('player.component.Media.height', 'Height'),
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
                        'label': Locale.t('player.component.Block.border-width', 'Border width'),
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
                        'label': Locale.t('player.component.Block.border-color', 'Border color')
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
                        'label': Locale.t('player.component.Media.border-radius', 'Border radius')
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
        return 'Media';
    }

    /**
    * Get a renderer class from a mime type
    *
    * @param {String} mime The mime type
    * @return {Class} The matched renderer class, or null
    */
    static getRendererForMime(mime){
        const index = RENDERERS.findIndex((renderer) => {
            return renderer.canPlayType(mime);
        });

        if(index > -1){
            return RENDERERS[index];
        }

        return null;
    }

    /**
     * Get the renderer
     *
     * @return {Dom} The renderer
     */
    getRenderer(){
        return this.renderer;
    }

    /**
     * Set the media source
     *
     * @param {Object} source The source as objects with 'url' and 'mime' keys
     * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
     * @return {this}
     */
    setSource(source, supressEvent){
        if(this.renderer){
            this.renderer.remove();
        }

        const renderer = this.constructor.getRendererForMime(source.mime);
        if(renderer){
            /**
             * The renderer
             * @type {Dom}
             */
            this.renderer = new renderer({'type': this.configs.type})
                .appendTo(this)
                .addListener('ready', (evt) => {
                    evt.detail.renderer.setSource(source, supressEvent);
                })
                .init();
        }

        return this;

    }

    /**
     * Get the value of the media's name property
     *
     * @return {String} The name
     */
    getName() {
        return '[media]';
    }

    /**
     * Check whether the media is playing
     *
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
        return this.getRenderer().isPlaying();
    }

    /**
     * Reset the media time
     *
     * @return {this}
     */
    reset() {
        this.setTime(0);

        return this;
    }

    /**
     * Play the media
     *
     * @return {this}
     */
    play() {
        this.getRenderer().play();

        return this;
    }

    /**
     * Pause the media
     *
     * @return {this}
     */
    pause() {
        this.getRenderer().pause();

        return this;
    }

    /**
     * Set the media time
     *
     * @param {Number} time The time in centiseconds
     * @return {this}
     */
    setTime(time) {
        this.getRenderer().setTime(time);

        return this;
    }

    /**
     * Get the current media time
     *
     * @return {Number} The time in centiseconds
     */
    getTime() {
        const renderer = this.getRenderer();

        if(renderer){
            return renderer.getTime();
        }

        return null;
    }

    /**
     * Get the media's duration
     *
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        const renderer = this.getRenderer();

        if(renderer){
            return renderer.getDuration();
        }

        return null;
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
                'handle': this
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

    /**
     * Remove from dom
     *
     * @return {this}
     */
    remove() {
        if(this.renderer){
            this.renderer.remove();
        }

        return super.remove();
    }

}
