import Component from '../Component';
import {toCSS} from '../../core/utils/Color';
import {getRendererForMime} from '../../core/utils/Media';

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
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'hidden': {
                    'getter': function(){
                        return this.data('hidden') === "true";
                    },
                    'setter': function(value){
                        this.data('hidden', value ? "true" : null);
                    }
                },
                'x': {
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    },
                },
                'width': {
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    },
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    },
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'z-index': {
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('z-index', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('z-index', value);
                    }
                },
                'background-color': {
                    'getter': function(skipDefault){
                        return this.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('background-color', toCSS(value));
                    }
                },
                'border-width': {
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('border-width', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'getter': function(skipDefault){
                        return this.css('border-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-color', toCSS(value));
                    }
                },
                'border-radius': {
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

        const renderer = getRendererForMime(source.mime);
        if(renderer){
            /**
             * The renderer
             * @type {Dom}
             */
            this.renderer = new renderer({'type': this.configs.type})
                .addListener('ready', (evt) => {
                    evt.detail.renderer.setSource(source, supressEvent);
                })
                .appendTo(this)
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
