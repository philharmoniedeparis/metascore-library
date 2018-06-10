import Component from '../Component';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {toCSS} from '../../core/utils/Color';
import Draggable from '../../core/ui/Draggable';
import Resizable from '../../core/ui/Resizable';

/**
 * Fired when the media source is set
 *
 * @event sourcesset
 * @param {Object} media The media instance
 */
const EVT_SOURCESSET = 'sourcesset';

/**
 * Fired when the metadata has loaded
 *
 * @event loadedmetadata
 * @param {Object} media The media instance
 */
const EVT_LOADEDMETADATA = 'loadedmetadata';

/**
 * Fired when the media starts playing
 *
 * @event play
 * @param {Object} media The media instance
 */
const EVT_PLAY = 'play';

/**
 * Fired when the media is paused
 *
 * @event pause
 * @param {Object} media The media instance
 */
const EVT_PAUSE = 'pause';

/**
 * Fired when a seek operation begins
 *
 * @event seeking
 * @param {Object} media The media instance
 */
const EVT_SEEKING = 'seeking';

/**
 * Fired when a seek operation completes
 *
 * @event seeked
 * @param {Object} media The media instance
 */
const EVT_SEEKED = 'seeked';

/**
 * Fired when the media's time changed
 *
 * @event timeupdate
 * @param {Object} media The media instance
 */
const EVT_TIMEUPDATE = 'timeupdate';

export default class Media extends Component{

    /**
     * A media component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    constructor(configs){
        // call parent constructor
        super(configs);

        this.addClass('media').addClass(this.configs.type);

        this.el = new Dom(`<${this.configs.type}></${this.configs.type}>`, {'preload': 'auto'})
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('play', this.onPlay.bind(this))
            .addListener('pause', this.onPause.bind(this))
            .addListener('timeupdate', this.onTimeUpdate.bind(this))
            .addListener('seeking', this.onSeeking.bind(this))
            .addListener('seeked', this.onSeeked.bind(this))
            .appendTo(this);

        this.dom = this.el.get(0);

        this.playing = false;
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'type': 'audio',
            'useFrameAnimation': true,
            'properties': {
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
                        const value = parseInt(this.css('z-index', undefined, skipDefault), 10);
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
                        return this.css('background-color', undefined, skipDefault);
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
                        const value = parseInt(this.css('border-width', undefined, skipDefault), 10);
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
                        return this.css('border-color', undefined, skipDefault);
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
                        return this.css('border-radius', undefined, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-radius', value);
                    }
                }
            }
        });
    }

    /**
     * Set the media sources
     *
     * @method setSources
     * @param {Array} sources The list of sources as objects with 'url' and 'mime' keys
     * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
     * @chainable
     */
    setSources(sources, supressEvent){
        let source_tags = '';

		sources.forEach((source) => {
            source_tags += `<source src="${source.url}" type="${source.mime}"></source>`;
        });

        this.el.text(source_tags);

        this.dom.load();

        if(supressEvent !== true){
            this.triggerEvent(EVT_SOURCESSET, {'media': this});
        }

        return this;

    }

    /**
     * Get the value of the media's name property
     *
     * @method getName
     * @return {String} The name
     */
    getName() {
        return '[media]';
    }

    /**
     * The loadedmetadata event handler
     *
     * @method onLoadedMetadata
     * @private
     */
    onLoadedMetadata() {
        this.triggerEvent(EVT_LOADEDMETADATA, {'media': this});
    }

    /**
     * The play event handler
     *
     * @method onPlay
     * @private
     */
    onPlay() {
        this.playing = true;

        this.triggerEvent(EVT_PLAY, {'media': this});

        if(this.configs.useFrameAnimation){
            this.triggerTimeUpdate();
        }
    }

    /**
     * The pause event handler
     *
     * @method onPause
     * @private
     */
    onPause() {
        this.playing = false;

        this.triggerEvent(EVT_PAUSE, {'media': this});
    }

    /**
     * The timeupdate event handler
     *
     * @method onTimeUpdate
     * @private
     */
    onTimeUpdate(){
        if(!this.configs.useFrameAnimation){
            this.triggerTimeUpdate(false);
        }
    }

    /**
     * The seeking event handler
     *
     * @method onSeeking
     * @private
     */
    onSeeking(){
        this.triggerEvent(EVT_SEEKING, {'media': this});
    }

    /**
     * The seeked event handler
     *
     * @method onSeeked
     * @private
     */
    onSeeked(){
        this.triggerEvent(EVT_SEEKED, {'media': this});
    }

    /**
     * Check whether the media is playing
     *
     * @method isPlaying
     * @return {Boolean} Whether the media is playing
     */
    isPlaying() {
        return this.playing;
    }

    /**
     * Reset the media time
     *
     * @method reset
     * @chainable
     */
    reset() {
        this.setTime(0);

        return this;
    }

    /**
     * Play the media
     *
     * @method play
     * @chainable
     */
    play() {
        this.dom.play();

        return this;
    }

    /**
     * Pause the media
     *
     * @method pause
     * @chainable
     */
    pause() {
        this.dom.pause();

        return this;
    }

    /**
     * Trigger the timeupdate event
     *
     * @method triggerTimeUpdate
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @chainable
     */
    triggerTimeUpdate(loop) {
        if(loop !== false && this.isPlaying()){
            window.requestAnimationFrame(this.triggerTimeUpdate.bind(this));
        }

        this.triggerEvent(EVT_TIMEUPDATE, {'media': this});

        return this;
    }

    /**
     * Set the media time
     *
     * @method setTime
     * @param {Number} time The time in centiseconds
     * @chainable
     */
    setTime(time) {
        this.dom.currentTime = parseFloat(time) / 100;

        return this;
    }

    /**
     * Get the current media time
     *
     * @method getTime
     * @return {Number} The time in centiseconds
     */
    getTime() {
        return Math.round(parseFloat(this.dom.currentTime) * 100);
    }

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    getDuration() {
        return Math.round(parseFloat(this.dom.duration) * 100);
    }

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    setDraggable(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
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
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    setResizable(resizable){

        resizable = resizable !== false;

        if(this.getProperty('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
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
