import Component from '../Component';
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
            .addClass(this.configs.tag);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'tag': 'audio',
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'type': 'string'
                },
                'hidden': {
                    'type': 'boolean',
                    'setter': function(value){
                        this.toggleClass('hidden', value);
                    }
                },
                'scenario': {
                    'type': 'string'
                },
                'x': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    },
                },
                'width': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'background-color': {
                    'type': 'color',
                    'setter': function(value){
                        this.css('background-color', value);
                    }
                },
                'border-width': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'type': 'color',
                    'setter': function(value){
                        this.css('border-color', value);
                    }
                },
                'border-radius': {
                    'type': 'string',
                    'setter': function(value){
                        this.css('border-radius', value);
                    }
                },
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
            this.renderer = new renderer({'tag': this.configs.tag})
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
